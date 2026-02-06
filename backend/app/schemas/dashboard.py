from typing import Optional
from pydantic import BaseModel

from app.schemas.event import EventOut
from app.schemas.medication import MedicationOut


class FeedingSummary(BaseModel):
    total_actual_grams: float
    total_planned_grams: Optional[float]
    entries_count: int


class WaterSummary(BaseModel):
    total_ml: float
    daily_goal_ml: Optional[float]
    entries_count: int


class PetDashboard(BaseModel):
    feeding: FeedingSummary
    water: WaterSummary
    upcoming_events: list[EventOut]
    active_medications: list[MedicationOut]
