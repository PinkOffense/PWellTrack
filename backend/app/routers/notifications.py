"""WebSocket-based real-time notification system for feeding and medication reminders."""

import asyncio
import json
import logging
from datetime import date, datetime, time, timezone
from typing import Dict, Set
from zoneinfo import ZoneInfo

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from sqlalchemy import select

from app.core.database import async_session
from app.core.security import _decode_jwt
from app.models.user import User
from app.models.pet import Pet
from app.models.medication import Medication
from app.models.feeding_log import FeedingLog

logger = logging.getLogger(__name__)

router = APIRouter(tags=["notifications"])


# ── Connection Manager ──────────────────────────────────────────────────

class ConnectionManager:
    """Tracks active WebSocket connections per user."""

    def __init__(self):
        self._connections: Dict[int, Set[WebSocket]] = {}

    async def connect(self, user_id: int, ws: WebSocket):
        await ws.accept()
        self._connections.setdefault(user_id, set()).add(ws)

    def disconnect(self, user_id: int, ws: WebSocket):
        if user_id in self._connections:
            self._connections[user_id].discard(ws)
            if not self._connections[user_id]:
                del self._connections[user_id]

    async def send_to_user(self, user_id: int, data: dict):
        if user_id not in self._connections:
            return
        dead: list[WebSocket] = []
        for ws in self._connections[user_id]:
            try:
                await ws.send_json(data)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self._connections[user_id].discard(ws)

    @property
    def connected_users(self) -> set[int]:
        return set(self._connections.keys())


manager = ConnectionManager()


# ── Deduplication ────────────────────────────────────────────────────────

_sent_today: Dict[str, Set[str]] = {}


def _today_key() -> str:
    return datetime.now(timezone.utc).date().isoformat()


def _mark_sent(user_id: int, notif_type: str, ref_id: int, time_slot: str):
    key = _today_key()
    if key not in _sent_today:
        _sent_today.clear()
        _sent_today[key] = set()
    _sent_today[key].add(f"{user_id}:{notif_type}:{ref_id}:{time_slot}")


def _was_sent(user_id: int, notif_type: str, ref_id: int, time_slot: str) -> bool:
    key = _today_key()
    return key in _sent_today and f"{user_id}:{notif_type}:{ref_id}:{time_slot}" in _sent_today[key]


# ── WebSocket Endpoint ──────────────────────────────────────────────────

@router.websocket("/ws/notifications")
async def websocket_notifications(ws: WebSocket, token: str = Query(default="")):
    """Real-time notification channel.

    Supports two auth methods:
    1. Query param: ?token=<jwt>  (legacy, for backwards compat)
    2. First message: {"type": "auth", "token": "<jwt>"}  (preferred)
    """
    user_id: int | None = None

    # Try query param auth first (legacy support)
    if token:
        try:
            payload = _decode_jwt(token)
            user_id = int(payload["sub"])
        except Exception:
            await ws.close(code=4001, reason="Invalid token")
            return
    else:
        # Accept connection and wait for auth message
        await ws.accept()
        try:
            raw = await asyncio.wait_for(ws.receive_text(), timeout=10.0)
            msg = json.loads(raw)
            if msg.get("type") == "auth" and msg.get("token"):
                payload = _decode_jwt(msg["token"])
                user_id = int(payload["sub"])
            else:
                await ws.close(code=4001, reason="Expected auth message")
                return
        except Exception:
            await ws.close(code=4001, reason="Auth failed")
            return

    async with async_session() as db:
        user = await db.get(User, user_id)
        if not user:
            await ws.close(code=4001, reason="User not found")
            return

    if not token:
        # Already accepted above for message-based auth
        await ws.send_json({"type": "auth_ok"})
        manager._connections.setdefault(user_id, set()).add(ws)
    else:
        await manager.connect(user_id, ws)

    try:
        while True:
            data = await ws.receive_text()
            if data == "ping":
                await ws.send_text("pong")
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(user_id, ws)


# ── Background Reminder Loop ────────────────────────────────────────────

async def reminder_loop():
    """Runs continuously, checking for due reminders every 60 seconds."""
    while True:
        try:
            await _check_reminders()
        except Exception as e:
            logger.error("Reminder check failed: %s", e)
        await asyncio.sleep(60)


def _is_time_due(current: str, scheduled: str) -> bool:
    """True if current time is within a 5-minute window after scheduled time."""
    try:
        ch, cm = map(int, current.split(":"))
        sh, sm = map(int, scheduled.split(":"))
        diff = (ch * 60 + cm) - (sh * 60 + sm)
        return 0 <= diff <= 5
    except Exception:
        return False


async def _check_reminders():
    connected = manager.connected_users
    if not connected:
        return

    now_utc = datetime.now(timezone.utc)
    today_utc = now_utc.date()
    today_start = datetime.combine(today_utc, time.min, tzinfo=timezone.utc)
    today_end = datetime.combine(today_utc, time.max, tzinfo=timezone.utc)

    async with async_session() as db:
        for user_id in connected:
            # Get user timezone
            user = await db.get(User, user_id)
            if not user:
                continue
            try:
                user_tz = ZoneInfo(user.timezone)
            except Exception:
                user_tz = timezone.utc

            user_now = now_utc.astimezone(user_tz)
            current_time = user_now.strftime("%H:%M")
            user_today = user_now.date()

            pets_result = await db.execute(
                select(Pet).where(Pet.user_id == user_id)
            )
            pets = pets_result.scalars().all()

            for pet in pets:
                await _check_medications(db, user_id, pet, user_today, current_time)
                await _check_feeding(db, user_id, pet, today_start, today_end, current_time)


async def _check_medications(db, user_id: int, pet: Pet, today: date, current_time: str):
    """Send reminders for active medications whose scheduled time is now."""
    result = await db.execute(
        select(Medication).where(
            Medication.pet_id == pet.id,
            Medication.start_date <= today,
            (Medication.end_date.is_(None)) | (Medication.end_date >= today),
        )
    )
    for med in result.scalars().all():
        if not med.times_of_day:
            continue
        for slot in med.times_of_day:
            if _is_time_due(current_time, slot) and not _was_sent(user_id, "medication", med.id, slot):
                await manager.send_to_user(user_id, {
                    "type": "medication_reminder",
                    "pet_id": pet.id,
                    "pet_name": pet.name,
                    "medication_name": med.name,
                    "dosage": med.dosage,
                    "scheduled_time": slot,
                })
                _mark_sent(user_id, "medication", med.id, slot)


async def _check_feeding(db, user_id: int, pet: Pet, today_start, today_end, current_time: str):
    """Send feeding reminder if pet hasn't been fed at standard meal times."""
    feeding_result = await db.execute(
        select(FeedingLog.id).where(
            FeedingLog.pet_id == pet.id,
            FeedingLog.datetime_.between(today_start, today_end),
        ).limit(1)
    )
    has_been_fed = feeding_result.scalar_one_or_none() is not None

    if has_been_fed:
        return

    for slot in ("08:00", "13:00", "19:00"):
        if _is_time_due(current_time, slot) and not _was_sent(user_id, "feeding", pet.id, slot):
            await manager.send_to_user(user_id, {
                "type": "feeding_reminder",
                "pet_id": pet.id,
                "pet_name": pet.name,
                "scheduled_time": slot,
            })
            _mark_sent(user_id, "feeding", pet.id, slot)
