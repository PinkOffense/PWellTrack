from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_pet_for_user
from app.core.security import get_current_user
from app.models.user import User
from app.models.weight_log import WeightLog
from app.schemas.weight import WeightCreate, WeightUpdate, WeightOut

router = APIRouter(tags=["weight"])

_PROTECTED_FIELDS = {"pet_id", "id"}


@router.get("/pets/{pet_id}/weight", response_model=list[WeightOut])
async def list_weight(
    pet_id: int,
    date_from: datetime | None = Query(None),
    date_to: datetime | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_pet_for_user(pet_id, current_user, db)
    q = select(WeightLog).where(WeightLog.pet_id == pet_id)
    if date_from:
        q = q.where(WeightLog.datetime_ >= date_from)
    if date_to:
        q = q.where(WeightLog.datetime_ <= date_to)
    q = q.order_by(WeightLog.datetime_.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return [WeightOut.model_validate(w) for w in result.scalars().all()]


@router.post("/pets/{pet_id}/weight", response_model=WeightOut, status_code=status.HTTP_201_CREATED)
async def create_weight(
    pet_id: int,
    data: WeightCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_pet_for_user(pet_id, current_user, db)
    log = WeightLog(
        pet_id=pet_id,
        datetime_=data.datetime_ or datetime.now(timezone.utc),
        weight_kg=data.weight_kg,
        notes=data.notes,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return WeightOut.model_validate(log)


@router.put("/weight/{weight_id}", response_model=WeightOut)
async def update_weight(
    weight_id: int,
    data: WeightUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = await db.get(WeightLog, weight_id)
    if not log:
        raise HTTPException(status_code=404, detail="Weight log not found")
    await get_pet_for_user(log.pet_id, current_user, db)
    for key, value in data.model_dump(exclude_unset=True).items():
        if key not in _PROTECTED_FIELDS:
            setattr(log, key, value)
    await db.commit()
    await db.refresh(log)
    return WeightOut.model_validate(log)


@router.delete("/weight/{weight_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_weight(
    weight_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = await db.get(WeightLog, weight_id)
    if not log:
        raise HTTPException(status_code=404, detail="Weight log not found")
    await get_pet_for_user(log.pet_id, current_user, db)
    await db.delete(log)
    await db.commit()
