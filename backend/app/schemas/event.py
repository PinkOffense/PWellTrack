from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class EventCreate(BaseModel):
    type: str
    title: str
    datetime_start: datetime
    duration_minutes: Optional[int] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    reminder_minutes_before: Optional[int] = None


class EventOut(BaseModel):
    id: int
    pet_id: int
    type: str
    title: str
    datetime_start: datetime
    duration_minutes: Optional[int]
    location: Optional[str]
    notes: Optional[str]
    reminder_minutes_before: Optional[int]

    model_config = {"from_attributes": True}
