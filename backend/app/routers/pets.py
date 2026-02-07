from datetime import date, datetime, time, timezone
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
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


async def _get_pet_for_user(pet_id: int, user: User, db: AsyncSession) -> Pet:
    pet = await db.get(Pet, pet_id)
    if not pet or pet.user_id != user.id:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet


@router.get("/", response_model=list[PetOut])
async def list_pets(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Pet).where(Pet.user_id == current_user.id))
    return [PetOut.model_validate(p) for p in result.scalars().all()]


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
    return PetOut.model_validate(pet)


@router.get("/{pet_id}", response_model=PetOut)
async def get_pet(
    pet_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = await _get_pet_for_user(pet_id, current_user, db)
    return PetOut.model_validate(pet)


@router.put("/{pet_id}", response_model=PetOut)
async def update_pet(
    pet_id: int,
    data: PetUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = await _get_pet_for_user(pet_id, current_user, db)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(pet, key, value)
    await db.commit()
    await db.refresh(pet)
    return PetOut.model_validate(pet)


@router.delete("/{pet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pet(
    pet_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = await _get_pet_for_user(pet_id, current_user, db)
    await db.delete(pet)
    await db.commit()


@router.post("/{pet_id}/photo", response_model=PetOut)
async def upload_pet_photo(
    pet_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = await _get_pet_for_user(pet_id, current_user, db)
    contents = await file.read()
    import base64
    b64 = base64.b64encode(contents).decode()
    ext = file.filename.split(".")[-1] if file.filename else "jpg"
    pet.photo_url = f"data:image/{ext};base64,{b64}"
    await db.commit()
    await db.refresh(pet)
    return PetOut.model_validate(pet)


@router.get("/{pet_id}/today", response_model=PetDashboard)
async def pet_today(
    pet_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pet = await _get_pet_for_user(pet_id, current_user, db)

    today_start = datetime.combine(date.today(), time.min).replace(tzinfo=timezone.utc)
    today_end = datetime.combine(date.today(), time.max).replace(tzinfo=timezone.utc)

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
        total_planned_grams=float(f_row[1]) if f_row[1] else None,
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
    today = date.today()
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
