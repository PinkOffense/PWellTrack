import re
from datetime import date
from typing import Optional
from pydantic import BaseModel, Field, model_validator

_TIME_PATTERN = re.compile(r"^\d{2}:\d{2}$")


class MedicationCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    dosage: str = Field(min_length=1, max_length=100)
    frequency_per_day: int = Field(gt=0, le=24)
    start_date: date
    end_date: Optional[date] = None
    times_of_day: Optional[list[str]] = None
    notes: Optional[str] = Field(default=None, max_length=2000)

    @model_validator(mode="after")
    def validate_dates(self):
        if self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date must not be before start_date")
        if self.times_of_day:
            for t in self.times_of_day:
                if not _TIME_PATTERN.match(t):
                    raise ValueError(f"Invalid time format: {t}. Expected HH:MM")
        return self


class MedicationUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    dosage: Optional[str] = Field(default=None, min_length=1, max_length=100)
    frequency_per_day: Optional[int] = Field(default=None, gt=0, le=24)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    times_of_day: Optional[list[str]] = None
    notes: Optional[str] = Field(default=None, max_length=2000)

    @model_validator(mode="after")
    def validate_dates(self):
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("end_date must not be before start_date")
        if self.times_of_day:
            for t in self.times_of_day:
                if not _TIME_PATTERN.match(t):
                    raise ValueError(f"Invalid time format: {t}. Expected HH:MM")
        return self


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
