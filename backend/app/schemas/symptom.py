from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class SymptomCreate(BaseModel):
    datetime_: datetime = Field(alias="datetime", default=None)
    type: str
    severity: str  # mild, moderate, severe
    notes: Optional[str] = None

    model_config = {"populate_by_name": True}


class SymptomUpdate(BaseModel):
    datetime_: Optional[datetime] = Field(alias="datetime", default=None)
    type: Optional[str] = None
    severity: Optional[str] = None
    notes: Optional[str] = None

    model_config = {"populate_by_name": True}


class SymptomOut(BaseModel):
    id: int
    pet_id: int
    datetime_: datetime = Field(alias="datetime")
    type: str
    severity: str
    notes: Optional[str]

    model_config = {"from_attributes": True, "populate_by_name": True}
