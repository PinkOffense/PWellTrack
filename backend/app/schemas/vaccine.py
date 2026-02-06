from datetime import date
from typing import Optional
from pydantic import BaseModel


class VaccineCreate(BaseModel):
    name: str
    date_administered: date
    next_due_date: Optional[date] = None
    clinic: Optional[str] = None
    notes: Optional[str] = None
    document_url: Optional[str] = None


class VaccineUpdate(BaseModel):
    name: Optional[str] = None
    date_administered: Optional[date] = None
    next_due_date: Optional[date] = None
    clinic: Optional[str] = None
    notes: Optional[str] = None
    document_url: Optional[str] = None


class VaccineOut(BaseModel):
    id: int
    pet_id: int
    name: str
    date_administered: date
    next_due_date: Optional[date]
    clinic: Optional[str]
    notes: Optional[str]
    document_url: Optional[str]

    model_config = {"from_attributes": True}
