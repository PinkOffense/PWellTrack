from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.water_log import WaterLog
from app.routers.pets import _get_pet_for_user
from app.schemas.water import WaterCreate, WaterUpdate, WaterOut

router = APIRouter(tags=["water"])


@router.get("/pets/{pet_id}/water", response_model=list[WaterOut])
async def list_water(
    pet_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_pet_for_user(pet_id, current_user, db)
    result = await db.execute(
        select(WaterLog).where(WaterLog.pet_id == pet_id).order_by(WaterLog.datetime_.desc())
    )
    return [WaterOut.model_validate(w) for w in result.scalars().all()]


@router.post("/pets/{pet_id}/water", response_model=WaterOut, status_code=status.HTTP_201_CREATED)
async def create_water(
    pet_id: int,
    data: WaterCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_pet_for_user(pet_id, current_user, db)
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
    await _get_pet_for_user(log.pet_id, current_user, db)
    for key, value in data.model_dump(exclude_unset=True).items():
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
    await _get_pet_for_user(log.pet_id, current_user, db)
    await db.delete(log)
    await db.commit()
