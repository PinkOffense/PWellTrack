from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_pet_for_user
from app.core.security import get_current_user
from app.models.user import User
from app.models.symptom import Symptom
from app.schemas.symptom import SymptomCreate, SymptomUpdate, SymptomOut

router = APIRouter(tags=["symptoms"])

_PROTECTED_FIELDS = {"pet_id", "id"}


@router.get("/pets/{pet_id}/symptoms", response_model=list[SymptomOut])
async def list_symptoms(
    pet_id: int,
    date_from: datetime | None = Query(None),
    date_to: datetime | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_pet_for_user(pet_id, current_user, db)
    q = select(Symptom).where(Symptom.pet_id == pet_id)
    if date_from:
        q = q.where(Symptom.datetime_ >= date_from)
    if date_to:
        q = q.where(Symptom.datetime_ <= date_to)
    q = q.order_by(Symptom.datetime_.desc())
    result = await db.execute(q)
    return [SymptomOut.model_validate(s) for s in result.scalars().all()]


@router.post("/pets/{pet_id}/symptoms", response_model=SymptomOut, status_code=status.HTTP_201_CREATED)
async def create_symptom(
    pet_id: int,
    data: SymptomCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_pet_for_user(pet_id, current_user, db)
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


@router.put("/symptoms/{symptom_id}", response_model=SymptomOut)
async def update_symptom(
    symptom_id: int,
    data: SymptomUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    symptom = await db.get(Symptom, symptom_id)
    if not symptom:
        raise HTTPException(status_code=404, detail="Symptom not found")
    await get_pet_for_user(symptom.pet_id, current_user, db)
    for key, value in data.model_dump(exclude_unset=True).items():
        if key not in _PROTECTED_FIELDS:
            setattr(symptom, key, value)
    await db.commit()
    await db.refresh(symptom)
    return SymptomOut.model_validate(symptom)


@router.delete("/symptoms/{symptom_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_symptom(
    symptom_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    symptom = await db.get(Symptom, symptom_id)
    if not symptom:
        raise HTTPException(status_code=404, detail="Symptom not found")
    await get_pet_for_user(symptom.pet_id, current_user, db)
    await db.delete(symptom)
    await db.commit()
