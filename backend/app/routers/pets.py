import logging
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_pet_for_user
from app.core.security import get_current_user
from app.models.user import User
from app.models.pet import Pet
from app.models.feeding_log import FeedingLog
from app.models.water_log import WaterLog
from app.models.event import Event as EventModel
from app.models.medication import Medication
from app.schemas.pet import PetCreate, PetUpdate, PetOut
from app.schemas.dashboard import PetDashboard, FeedingSummary, WaterSummary, VaccineStatusSummary, PetSummaryItem
from app.schemas.event import EventOut
from app.schemas.medication import MedicationOut
from app.models.vaccine import Vaccine as VaccineModel
from app.schemas.vaccine import VaccineOut

logger = logging.getLogger("pwelltrack.pets")
router = APIRouter(prefix="/pets", tags=["pets"])


def _pet_out(pet: Pet) -> PetOut:
    """Convert Pet model to PetOut. Photos are always returned inline as data URIs."""
    return PetOut.model_validate(pet)


@router.get("/", response_model=list[PetOut])
async def list_pets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Pet).where(Pet.user_id == current_user.id))
    return [_pet_out(p) for p in result.scalars().all()]


@router.get("/summary", response_model=list[PetSummaryItem])
async def pets_summary(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return all pets with their dashboards and vaccine status in a single call.

    Replaces the N+1 pattern of GET /pets/ + GET /pets/:id/today + GET /pets/:id/vaccines
    for each pet. Uses batched queries (6 queries total instead of 2N+1).
    """
    # Use user's timezone for "today" calculation
    try:
        user_tz = ZoneInfo(current_user.timezone)
    except Exception:
        user_tz = timezone.utc
    user_now = datetime.now(user_tz)
    user_today = user_now.date()
    today_start = datetime.combine(user_today, time.min, tzinfo=user_tz).astimezone(timezone.utc)
    today_end = datetime.combine(user_today, time.max, tzinfo=user_tz).astimezone(timezone.utc)
    now_utc = datetime.now(timezone.utc)

    # 1. All pets for user
    pets_result = await db.execute(select(Pet).where(Pet.user_id == current_user.id))
    pets = pets_result.scalars().all()
    if not pets:
        return []

    pet_ids = [p.id for p in pets]

    # 2. Feeding summaries (batched by pet_id)
    feeding_result = await db.execute(
        select(
            FeedingLog.pet_id,
            func.coalesce(func.sum(FeedingLog.actual_amount_grams), 0),
            func.coalesce(func.sum(FeedingLog.planned_amount_grams), 0),
            func.count(FeedingLog.id),
        ).where(
            FeedingLog.pet_id.in_(pet_ids),
            FeedingLog.datetime_.between(today_start, today_end),
        ).group_by(FeedingLog.pet_id)
    )
    feeding_map: dict[int, FeedingSummary] = {}
    for row in feeding_result.all():
        pid, actual, planned, count = row
        feeding_map[pid] = FeedingSummary(
            total_actual_grams=float(actual),
            total_planned_grams=float(planned) if planned is not None and count > 0 else None,
            entries_count=int(count),
        )

    # 3. Water summaries (batched by pet_id)
    water_result = await db.execute(
        select(
            WaterLog.pet_id,
            func.coalesce(func.sum(WaterLog.amount_ml), 0),
            func.count(WaterLog.id),
        ).where(
            WaterLog.pet_id.in_(pet_ids),
            WaterLog.datetime_.between(today_start, today_end),
        ).group_by(WaterLog.pet_id)
    )
    water_map: dict[int, tuple[float, int]] = {}
    for row in water_result.all():
        pid, total_ml, count = row
        water_map[pid] = (float(total_ml), int(count))

    # Get latest daily goals per pet (one query using DISTINCT ON for postgres, or subquery)
    water_goals: dict[int, float | None] = {}
    for pid in pet_ids:
        goal_result = await db.execute(
            select(WaterLog.daily_goal_ml)
            .where(WaterLog.pet_id == pid, WaterLog.daily_goal_ml.isnot(None))
            .order_by(WaterLog.datetime_.desc())
            .limit(1)
        )
        water_goals[pid] = goal_result.scalar_one_or_none()

    # 4. Upcoming events (all pets, limited to 5 per pet)
    events_result = await db.execute(
        select(EventModel)
        .where(EventModel.pet_id.in_(pet_ids), EventModel.datetime_start >= now_utc)
        .order_by(EventModel.datetime_start)
    )
    events_by_pet: dict[int, list[EventOut]] = {pid: [] for pid in pet_ids}
    for e in events_result.scalars().all():
        if len(events_by_pet[e.pet_id]) < 5:
            events_by_pet[e.pet_id].append(EventOut.model_validate(e))

    # 5. Active medications (all pets)
    meds_result = await db.execute(
        select(Medication).where(
            Medication.pet_id.in_(pet_ids),
            Medication.start_date <= user_today,
            (Medication.end_date.is_(None)) | (Medication.end_date >= user_today),
        )
    )
    meds_by_pet: dict[int, list[MedicationOut]] = {pid: [] for pid in pet_ids}
    for m in meds_result.scalars().all():
        meds_by_pet[m.pet_id].append(MedicationOut.model_validate(m))

    # 6. Vaccines (all pets) for status computation
    vaccines_result = await db.execute(
        select(VaccineModel).where(VaccineModel.pet_id.in_(pet_ids))
    )
    vaccines_by_pet: dict[int, list] = {pid: [] for pid in pet_ids}
    for v in vaccines_result.scalars().all():
        vaccines_by_pet[v.pet_id].append(v)

    # Assemble results
    items: list[PetSummaryItem] = []
    thirty_days = user_today + timedelta(days=30)
    for pet in pets:
        pid = pet.id
        f = feeding_map.get(pid, FeedingSummary(total_actual_grams=0, total_planned_grams=None, entries_count=0))
        w_total, w_count = water_map.get(pid, (0.0, 0))
        w = WaterSummary(total_ml=w_total, daily_goal_ml=water_goals.get(pid), entries_count=w_count)

        dashboard = PetDashboard(
            feeding=f,
            water=w,
            upcoming_events=events_by_pet.get(pid, []),
            active_medications=meds_by_pet.get(pid, []),
        )

        # Compute vaccine status
        vax = vaccines_by_pet.get(pid, [])
        if not vax:
            vs = VaccineStatusSummary(status="no_records", overdue_count=0)
        else:
            overdue = 0
            due_soon = 0
            for v in vax:
                if not v.next_due_date:
                    continue
                if v.next_due_date < user_today:
                    overdue += 1
                elif v.next_due_date <= thirty_days:
                    due_soon += 1
            if overdue > 0:
                vs = VaccineStatusSummary(status="overdue", overdue_count=overdue)
            elif due_soon > 0:
                vs = VaccineStatusSummary(status="due_soon", overdue_count=0)
            else:
                vs = VaccineStatusSummary(status="up_to_date", overdue_count=0)

        items.append(PetSummaryItem(
            pet=_pet_out(pet),
            dashboard=dashboard,
            vaccine_status=vs,
        ))

    return items


@router.post("/", response_model=PetOut, status_code=status.HTTP_201_CREATED)
async def create_pet(
    data: PetCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        pet = Pet(**data.model_dump(), user_id=current_user.id)
        db.add(pet)
        await db.commit()
        await db.refresh(pet)
        return _pet_out(pet)
    except Exception as exc:
        await db.rollback()
        logger.error(
            "Failed to create pet for user %s: %s (photo_url length: %s)",
            current_user.id,
            exc,
            len(data.photo_url) if data.photo_url else 0,
            exc_info=True,
        )
        raise HTTPException(status_code=500, detail="Failed to create pet")


@router.get("/{pet_id}", response_model=PetOut)
async def get_pet(
    pet_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = await get_pet_for_user(pet_id, current_user, db)
    return _pet_out(pet)


@router.put("/{pet_id}", response_model=PetOut)
async def update_pet(
    pet_id: int,
    data: PetUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = await get_pet_for_user(pet_id, current_user, db)
    try:
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(pet, key, value)
        await db.commit()
        await db.refresh(pet)
        return _pet_out(pet)
    except Exception as exc:
        await db.rollback()
        logger.error("Failed to update pet %s: %s", pet_id, exc, exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to update pet")


@router.delete("/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pet(
    pet_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = await get_pet_for_user(pet_id, current_user, db)
    await db.delete(pet)
    await db.commit()


@router.delete("/{pet_id}/photo", response_model=PetOut)
async def delete_pet_photo(
    pet_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = await get_pet_for_user(pet_id, current_user, db)
    pet.photo_url = None
    await db.commit()
    await db.refresh(pet)
    return _pet_out(pet)


@router.get("/{pet_id}/today", response_model=PetDashboard)
async def pet_today(
    pet_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = await get_pet_for_user(pet_id, current_user, db)

    # Use user's timezone for "today" calculation
    try:
        user_tz = ZoneInfo(current_user.timezone)
    except Exception:
        user_tz = timezone.utc
    user_now = datetime.now(user_tz)
    user_today = user_now.date()
    today_start = datetime.combine(user_today, time.min, tzinfo=user_tz).astimezone(timezone.utc)
    today_end = datetime.combine(user_today, time.max, tzinfo=user_tz).astimezone(timezone.utc)

    # Feeding summary
    feeding_result = await db.execute(
        select(
            func.coalesce(func.sum(FeedingLog.actual_amount_grams), 0),
            func.coalesce(func.sum(FeedingLog.planned_amount_grams), 0),
            func.count(FeedingLog.id),
        ).where(
            FeedingLog.pet_id == pet_id,
            FeedingLog.datetime_.between(today_start, today_end),
        )
    )
    f_row = feeding_result.one()
    feeding_summary = FeedingSummary(
        total_actual_grams=float(f_row[0]),
        total_planned_grams=float(f_row[1]) if f_row[1] is not None and f_row[2] > 0 else None,
        entries_count=int(f_row[2]),
    )

    # Water summary
    water_result = await db.execute(
        select(
            func.coalesce(func.sum(WaterLog.amount_ml), 0),
            func.count(WaterLog.id),
        ).where(
            WaterLog.pet_id == pet_id,
            WaterLog.datetime_.between(today_start, today_end),
        )
    )
    w_row = water_result.one()
    # Get the latest daily goal
    latest_water = await db.execute(
        select(WaterLog.daily_goal_ml)
        .where(WaterLog.pet_id == pet_id, WaterLog.daily_goal_ml.isnot(None))
        .order_by(WaterLog.datetime_.desc())
        .limit(1)
    )
    goal = latest_water.scalar_one_or_none()
    water_summary = WaterSummary(
        total_ml=float(w_row[0]),
        daily_goal_ml=goal,
        entries_count=int(w_row[1]),
    )

    # Upcoming events
    now = datetime.now(timezone.utc)
    events_result = await db.execute(
        select(EventModel)
        .where(EventModel.pet_id == pet_id, EventModel.datetime_start >= now)
        .order_by(EventModel.datetime_start)
        .limit(5)
    )
    upcoming_events = [EventOut.model_validate(e) for e in events_result.scalars().all()]

    # Active medications
    today = user_today
    meds_result = await db.execute(
        select(Medication).where(
            Medication.pet_id == pet_id,
            Medication.start_date <= today,
            (Medication.end_date.is_(None)) | (Medication.end_date >= today),
        )
    )
    active_meds = [MedicationOut.model_validate(m) for m in meds_result.scalars().all()]

    return PetDashboard(
        feeding=feeding_summary,
        water=water_summary,
        upcoming_events=upcoming_events,
        active_medications=active_meds,
    )
