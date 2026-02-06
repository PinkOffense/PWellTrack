from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.feeding_log import FeedingLog
from app.routers.pets import _get_pet_for_user
from app.schemas.feeding import FeedingCreate, FeedingOut

router = APIRouter(tags=["feeding"])


@router.get("/pets/{pet_id}/feeding", response_model=list[FeedingOut])
async def list_feedings(
    pet_id: int,
    date_from: datetime | None = Query(None),
    date_to: datetime | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_pet_for_user(pet_id, current_user, db)
    q = select(FeedingLog).where(FeedingLog.pet_id == pet_id)
    if date_from:
        q = q.where(FeedingLog.datetime_ >= date_from)
    if date_to:
        q = q.where(FeedingLog.datetime_ <= date_to)
    q = q.order_by(FeedingLog.datetime_.desc())
    result = await db.execute(q)
    return [FeedingOut.model_validate(f) for f in result.scalars().all()]


@router.post("/pets/{pet_id}/feeding", response_model=FeedingOut, status_code=status.HTTP_201_CREATED)
async def create_feeding(
    pet_id: int,
    data: FeedingCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_pet_for_user(pet_id, current_user, db)
    log = FeedingLog(
        pet_id=pet_id,
        datetime_=data.datetime_ or datetime.now(timezone.utc),
        food_type=data.food_type,
        planned_amount_grams=data.planned_amount_grams,
        actual_amount_grams=data.actual_amount_grams,
        notes=data.notes,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return FeedingOut.model_validate(log)
