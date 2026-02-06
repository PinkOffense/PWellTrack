from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.symptom import Symptom
from app.routers.pets import _get_pet_for_user
from app.schemas.symptom import SymptomCreate, SymptomOut

router = APIRouter(tags=["symptoms"])


@router.get("/pets/{pet_id}/symptoms", response_model=list[SymptomOut])
async def list_symptoms(
    pet_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_pet_for_user(pet_id, current_user, db)
    result = await db.execute(
        select(Symptom).where(Symptom.pet_id == pet_id).order_by(Symptom.datetime_.desc())
    )
    return [SymptomOut.model_validate(s) for s in result.scalars().all()]


@router.post("/pets/{pet_id}/symptoms", response_model=SymptomOut, status_code=status.HTTP_201_CREATED)
async def create_symptom(
    pet_id: int,
    data: SymptomCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_pet_for_user(pet_id, current_user, db)
    symptom = Symptom(
        pet_id=pet_id,
        datetime_=data.datetime_ or datetime.now(timezone.utc),
        type=data.type,
        severity=data.severity,
        notes=data.notes,
    )
    db.add(symptom)
    await db.commit()
    await db.refresh(symptom)
    return SymptomOut.model_validate(symptom)
