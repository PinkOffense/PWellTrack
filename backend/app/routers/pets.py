import base64
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import Response
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
from app.schemas.dashboard import PetDashboard, FeedingSummary, WaterSummary
from app.schemas.event import EventOut
from app.schemas.medication import MedicationOut

router = APIRouter(prefix="/pets", tags=["pets"])


def _pet_out(pet: Pet) -> PetOut:
    """Convert Pet model to PetOut, replacing base64 photo_url with an API path."""
    out = PetOut.model_validate(pet)
    if pet.photo_url and pet.photo_url.startswith("data:"):
        out.photo_url = f"/pets/{pet.id}/photo"
    return out


@router.get("/", response_model=list[PetOut])
async def list_pets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Pet).where(Pet.user_id == current_user.id))
    return [_pet_out(p) for p in result.scalars().all()]


@router.post("/", response_model=PetOut, status_code=status.HTTP_201_CREATED)
async def create_pet(
    data: PetCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = Pet(**data.model_dump(), user_id=current_user.id)
    db.add(pet)
    await db.commit()
    await db.refresh(pet)
    return _pet_out(pet)


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
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(pet, key, value)
    await db.commit()
    await db.refresh(pet)
    return _pet_out(pet)


@router.delete("/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pet(
    pet_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = await get_pet_for_user(pet_id, current_user, db)
    await db.delete(pet)
    await db.commit()


@router.get("/{pet_id}/photo")
async def get_pet_photo(
    pet_id: int,
    token: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """Serve pet photo as raw image bytes. Accepts token as query param for <img> tags."""
    from app.core.security import _decode_jwt
    # Auth via query param (for <img src="...?token=xxx">)
    if not token:
        raise HTTPException(status_code=401, detail="Token required")
    try:
        payload = _decode_jwt(token)
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    pet = await get_pet_for_user(pet_id, user, db)
    if not pet.photo_url or not pet.photo_url.startswith("data:"):
        raise HTTPException(status_code=404, detail="No photo")
    try:
        meta, b64_data = pet.photo_url.split(",", 1)
        content_type = meta.split(":")[1].split(";")[0]
        image_bytes = base64.b64decode(b64_data)
    except Exception:
        raise HTTPException(status_code=404, detail="Invalid photo data")
    return Response(
        content=image_bytes,
        media_type=content_type,
        headers={"Cache-Control": "private, max-age=3600"},
    )


@router.post("/{pet_id}/photo", response_model=PetOut)
async def upload_pet_photo(
    pet_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = await get_pet_for_user(pet_id, current_user, db)

    # Validate file type
    allowed_types = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    if file.content_type and file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="File must be an image (JPEG, PNG, GIF, or WebP)")

    # Read with size limit (5 MB)
    max_size = 5 * 1024 * 1024
    contents = await file.read()
    if len(contents) > max_size:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5 MB")

    b64 = base64.b64encode(contents).decode()
    mime_ext = {"image/jpeg": "jpeg", "image/png": "png", "image/gif": "gif", "image/webp": "webp"}
    ext = mime_ext.get(file.content_type, "jpeg")
    pet.photo_url = f"data:image/{ext};base64,{b64}"
    await db.commit()
    await db.refresh(pet)
    return _pet_out(pet)


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
