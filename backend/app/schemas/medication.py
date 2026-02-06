from datetime import date
from typing import Optional
from pydantic import BaseModel


class MedicationCreate(BaseModel):
    name: str
    dosage: str
    frequency_per_day: int
    start_date: date
    end_date: Optional[date] = None
    times_of_day: Optional[list[str]] = None
    notes: Optional[str] = None


class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    frequency_per_day: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    times_of_day: Optional[list[str]] = None
    notes: Optional[str] = None


class MedicationOut(BaseModel):
    id: int
    pet_id: int
    name: str
    dosage: str
    frequency_per_day: int
    start_date: date
    end_date: Optional[date]
    times_of_day: Optional[list[str]]
    notes: Optional[str]

    model_config = {"from_attributes": True}
