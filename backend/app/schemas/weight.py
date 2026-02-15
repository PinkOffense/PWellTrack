from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class WeightCreate(BaseModel):
    datetime_: Optional[datetime] = Field(alias="datetime", default=None)
    weight_kg: float = Field(gt=0)
    notes: Optional[str] = None

    model_config = {"populate_by_name": True}


class WeightUpdate(BaseModel):
    datetime_: Optional[datetime] = Field(alias="datetime", default=None)
    weight_kg: Optional[float] = None
    notes: Optional[str] = None

    model_config = {"populate_by_name": True}


class WeightOut(BaseModel):
    id: int
    pet_id: int
    datetime_: datetime = Field(alias="datetime")
    weight_kg: float
    notes: Optional[str]

    model_config = {"from_attributes": True, "populate_by_name": True}
