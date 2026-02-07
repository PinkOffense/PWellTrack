from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class WaterCreate(BaseModel):
    datetime_: Optional[datetime] = Field(alias="datetime", default=None)
    amount_ml: float = Field(gt=0)
    daily_goal_ml: Optional[float] = Field(default=None, gt=0)

    model_config = {"populate_by_name": True}


class WaterUpdate(BaseModel):
    datetime_: Optional[datetime] = Field(alias="datetime", default=None)
    amount_ml: Optional[float] = None
    daily_goal_ml: Optional[float] = None

    model_config = {"populate_by_name": True}


class WaterOut(BaseModel):
    id: int
    pet_id: int
    datetime_: datetime = Field(alias="datetime")
    amount_ml: float
    daily_goal_ml: Optional[float]

    model_config = {"from_attributes": True, "populate_by_name": True}
