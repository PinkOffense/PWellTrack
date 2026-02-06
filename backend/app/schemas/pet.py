from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class PetCreate(BaseModel):
    name: str
    species: str
    breed: Optional[str] = None
    date_of_birth: Optional[date] = None
    sex: Optional[str] = None
    weight_kg: Optional[float] = None
    photo_url: Optional[str] = None
    notes: Optional[str] = None


class PetUpdate(BaseModel):
    name: Optional[str] = None
    species: Optional[str] = None
    breed: Optional[str] = None
    date_of_birth: Optional[date] = None
    sex: Optional[str] = None
    weight_kg: Optional[float] = None
    photo_url: Optional[str] = None
    notes: Optional[str] = None


class PetOut(BaseModel):
    id: int
    user_id: int
    name: str
    species: str
    breed: Optional[str]
    date_of_birth: Optional[date]
    sex: Optional[str]
    weight_kg: Optional[float]
    photo_url: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
