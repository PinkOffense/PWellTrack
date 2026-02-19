from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class EventCreate(BaseModel):
    type: str = Field(min_length=1, max_length=50)
    title: str = Field(min_length=1, max_length=200)
    datetime_start: datetime
    duration_minutes: Optional[int] = Field(default=None, ge=0)
    location: Optional[str] = Field(default=None, max_length=300)
    notes: Optional[str] = Field(default=None, max_length=2000)
    reminder_minutes_before: Optional[int] = Field(default=None, ge=0)


class EventUpdate(BaseModel):
    type: Optional[str] = Field(default=None, min_length=1, max_length=50)
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    datetime_start: Optional[datetime] = None
    duration_minutes: Optional[int] = Field(default=None, ge=0)
    location: Optional[str] = Field(default=None, max_length=300)
    notes: Optional[str] = Field(default=None, max_length=2000)
    reminder_minutes_before: Optional[int] = Field(default=None, ge=0)


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
