from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_pet_for_user
from app.core.security import get_current_user
from app.models.user import User
from app.models.water_log import WaterLog
from app.schemas.water import WaterCreate, WaterUpdate, WaterOut

router = APIRouter(tags=["water"])

_PROTECTED_FIELDS = {"pet_id", "id"}


@router.get("/pets/{pet_id}/water", response_model=list[WaterOut])
async def list_water(
    pet_id: int,
    date_from: datetime | None = Query(None),
    date_to: datetime | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_pet_for_user(pet_id, current_user, db)
    q = select(WaterLog).where(WaterLog.pet_id == pet_id)
    if date_from:
        q = q.where(WaterLog.datetime_ >= date_from)
    if date_to:
        q = q.where(WaterLog.datetime_ <= date_to)
    q = q.order_by(WaterLog.datetime_.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return [WaterOut.model_validate(w) for w in result.scalars().all()]


@router.post("/pets/{pet_id}/water", response_model=WaterOut, status_code=status.HTTP_201_CREATED)
async def create_water(
    pet_id: int,
    data: WaterCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_pet_for_user(pet_id, current_user, db)
    log = WaterLog(
        pet_id=pet_id,
        datetime_=data.datetime_ or datetime.now(timezone.utc),
        amount_ml=data.amount_ml,
        daily_goal_ml=data.daily_goal_ml,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return WaterOut.model_validate(log)


@router.put("/water/{water_id}", response_model=WaterOut)
async def update_water(
    water_id: int,
    data: WaterUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = await db.get(WaterLog, water_id)
    if not log:
        raise HTTPException(status_code=404, detail="Water log not found")
    await get_pet_for_user(log.pet_id, current_user, db)
    for key, value in data.model_dump(exclude_unset=True).items():
        if key not in _PROTECTED_FIELDS:
            setattr(log, key, value)
    await db.commit()
    await db.refresh(log)
    return WaterOut.model_validate(log)


@router.delete("/water/{water_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_water(
    water_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = await db.get(WaterLog, water_id)
    if not log:
        raise HTTPException(status_code=404, detail="Water log not found")
    await get_pet_for_user(log.pet_id, current_user, db)
    await db.delete(log)
    await db.commit()
