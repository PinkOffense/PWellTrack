from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.water_log import WaterLog
from app.routers.pets import _get_pet_for_user
from app.schemas.water import WaterCreate, WaterOut

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
