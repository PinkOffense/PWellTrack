from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class SymptomCreate(BaseModel):
    datetime_: Optional[datetime] = Field(alias="datetime", default=None)
    type: str = Field(min_length=1, max_length=100)
    severity: str = Field(pattern=r"^(mild|moderate|severe)$")
    notes: Optional[str] = Field(default=None, max_length=2000)

    model_config = {"populate_by_name": True}


class SymptomUpdate(BaseModel):
    datetime_: Optional[datetime] = Field(alias="datetime", default=None)
    type: Optional[str] = Field(default=None, min_length=1, max_length=100)
    severity: Optional[str] = Field(default=None, pattern=r"^(mild|moderate|severe)$")
    notes: Optional[str] = Field(default=None, max_length=2000)

    model_config = {"populate_by_name": True}


class SymptomOut(BaseModel):
    id: int
    pet_id: int
    datetime_: datetime = Field(alias="datetime")
    type: str
    severity: str
    notes: Optional[str]

    model_config = {"from_attributes": True, "populate_by_name": True}
