from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_pet_for_user
from app.core.security import get_current_user
from app.models.user import User
from app.models.vaccine import Vaccine
from app.schemas.vaccine import VaccineCreate, VaccineUpdate, VaccineOut

router = APIRouter(tags=["vaccines"])

_ALLOWED_FIELDS = {"name", "date_administered", "next_due_date", "clinic", "notes", "document_url"}


@router.get("/pets/{pet_id}/vaccines", response_model=list[VaccineOut])
async def list_vaccines(
    pet_id: int,
    date_from: datetime | None = Query(None),
    date_to: datetime | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_pet_for_user(pet_id, current_user, db)
    q = select(Vaccine).where(Vaccine.pet_id == pet_id)
    if date_from:
        q = q.where(Vaccine.date_administered >= date_from)
    if date_to:
        q = q.where(Vaccine.date_administered <= date_to)
    q = q.order_by(Vaccine.date_administered.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return [VaccineOut.model_validate(v) for v in result.scalars().all()]


@router.post("/pets/{pet_id}/vaccines", response_model=VaccineOut, status_code=status.HTTP_201_CREATED)
async def create_vaccine(
    pet_id: int,
    data: VaccineCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_pet_for_user(pet_id, current_user, db)
    vaccine = Vaccine(**data.model_dump(), pet_id=pet_id)
    db.add(vaccine)
    await db.commit()
    await db.refresh(vaccine)
    return VaccineOut.model_validate(vaccine)


@router.put("/vaccines/{vaccine_id}", response_model=VaccineOut)
async def update_vaccine(
    vaccine_id: int,
    data: VaccineUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vaccine = await db.get(Vaccine, vaccine_id)
    if not vaccine:
        raise HTTPException(status_code=404, detail="Vaccine not found")
    await get_pet_for_user(vaccine.pet_id, current_user, db)
    for key, value in data.model_dump(exclude_unset=True).items():
        if key in _ALLOWED_FIELDS:
            setattr(vaccine, key, value)
    await db.commit()
    await db.refresh(vaccine)
    return VaccineOut.model_validate(vaccine)


@router.delete("/vaccines/{vaccine_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vaccine(
    vaccine_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vaccine = await db.get(Vaccine, vaccine_id)
    if not vaccine:
        raise HTTPException(status_code=404, detail="Vaccine not found")
    await get_pet_for_user(vaccine.pet_id, current_user, db)
    await db.delete(vaccine)
    await db.commit()
