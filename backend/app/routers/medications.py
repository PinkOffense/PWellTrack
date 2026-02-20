from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_pet_for_user
from app.core.security import get_current_user
from app.models.user import User
from app.models.medication import Medication
from app.schemas.medication import MedicationCreate, MedicationUpdate, MedicationOut

router = APIRouter(tags=["medications"])

_ALLOWED_FIELDS = {"name", "dosage", "frequency_per_day", "start_date", "end_date", "times_of_day", "notes"}


@router.get("/pets/{pet_id}/medications", response_model=list[MedicationOut])
async def list_medications(
    pet_id: int,
    date_from: datetime | None = Query(None),
    date_to: datetime | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_pet_for_user(pet_id, current_user, db)
    q = select(Medication).where(Medication.pet_id == pet_id)
    if date_from:
        q = q.where(Medication.start_date >= date_from)
    if date_to:
        q = q.where(Medication.start_date <= date_to)
    q = q.order_by(Medication.start_date.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return [MedicationOut.model_validate(m) for m in result.scalars().all()]


@router.post("/pets/{pet_id}/medications", response_model=MedicationOut, status_code=status.HTTP_201_CREATED)
async def create_medication(
    pet_id: int,
    data: MedicationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_pet_for_user(pet_id, current_user, db)
    med = Medication(**data.model_dump(), pet_id=pet_id)
    db.add(med)
    await db.commit()
    await db.refresh(med)
    return MedicationOut.model_validate(med)


@router.put("/medications/{medication_id}", response_model=MedicationOut)
async def update_medication(
    medication_id: int,
    data: MedicationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    med = await db.get(Medication, medication_id)
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    await get_pet_for_user(med.pet_id, current_user, db)
    for key, value in data.model_dump(exclude_unset=True).items():
        if key in _ALLOWED_FIELDS:
            setattr(med, key, value)
    await db.commit()
    await db.refresh(med)
    return MedicationOut.model_validate(med)


@router.delete("/medications/{medication_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_medication(
    medication_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    med = await db.get(Medication, medication_id)
    if not med:
        raise HTTPException(status_code=404, detail="Medication not found")
    await get_pet_for_user(med.pet_id, current_user, db)
    await db.delete(med)
    await db.commit()
