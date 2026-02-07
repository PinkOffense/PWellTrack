from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class FeedingCreate(BaseModel):
    datetime_: Optional[datetime] = Field(alias="datetime", default=None)
    food_type: str
    planned_amount_grams: Optional[float] = Field(default=None, ge=0)
    actual_amount_grams: float = Field(ge=0)
    notes: Optional[str] = None

    model_config = {"populate_by_name": True}


class FeedingUpdate(BaseModel):
    datetime_: Optional[datetime] = Field(alias="datetime", default=None)
    food_type: Optional[str] = None
    planned_amount_grams: Optional[float] = None
    actual_amount_grams: Optional[float] = None
    notes: Optional[str] = None

    model_config = {"populate_by_name": True}


class FeedingOut(BaseModel):
    id: int
    pet_id: int
    datetime_: datetime = Field(alias="datetime")
    food_type: str
    planned_amount_grams: Optional[float]
    actual_amount_grams: float
    notes: Optional[str]

    model_config = {"from_attributes": True, "populate_by_name": True}
