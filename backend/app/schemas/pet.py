from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, Field


class PetCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    species: str = Field(min_length=1, max_length=50)
    breed: Optional[str] = Field(default=None, max_length=120)
    date_of_birth: Optional[date] = None
    sex: Optional[str] = Field(default=None, max_length=20)
    weight_kg: Optional[float] = Field(default=None, gt=0)
    photo_url: Optional[str] = Field(default=None, max_length=7_000_000)
    notes: Optional[str] = Field(default=None, max_length=5000)


class PetUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    species: Optional[str] = Field(default=None, min_length=1, max_length=50)
    breed: Optional[str] = Field(default=None, max_length=120)
    date_of_birth: Optional[date] = None
    sex: Optional[str] = Field(default=None, max_length=20)
    weight_kg: Optional[float] = Field(default=None, gt=0)
    photo_url: Optional[str] = Field(default=None, max_length=7_000_000)
    notes: Optional[str] = Field(default=None, max_length=5000)


class PetOut(BaseModel):
    id: int
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
