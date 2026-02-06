from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.vaccine import Vaccine
from app.routers.pets import _get_pet_for_user
from app.schemas.vaccine import VaccineCreate, VaccineUpdate, VaccineOut

router = APIRouter(tags=["vaccines"])


@router.get("/pets/{pet_id}/vaccines", response_model=list[VaccineOut])
async def list_vaccines(
    pet_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_pet_for_user(pet_id, current_user, db)
    result = await db.execute(
        select(Vaccine).where(Vaccine.pet_id == pet_id).order_by(Vaccine.date_administered.desc())
    )
    return [VaccineOut.model_validate(v) for v in result.scalars().all()]


@router.post("/pets/{pet_id}/vaccines", response_model=VaccineOut, status_code=status.HTTP_201_CREATED)
async def create_vaccine(
    pet_id: int,
    data: VaccineCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_pet_for_user(pet_id, current_user, db)
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
    # Verify ownership
    await _get_pet_for_user(vaccine.pet_id, current_user, db)
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(vaccine, key, value)
    await db.commit()
    await db.refresh(vaccine)
    return VaccineOut.model_validate(vaccine)
