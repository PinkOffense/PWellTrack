from datetime import date
from typing import Optional
from pydantic import BaseModel, Field, model_validator


class VaccineCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    date_administered: date
    next_due_date: Optional[date] = None
    clinic: Optional[str] = Field(default=None, max_length=200)
    notes: Optional[str] = Field(default=None, max_length=2000)
    document_url: Optional[str] = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def validate_dates(self):
        if self.next_due_date and self.next_due_date < self.date_administered:
            raise ValueError("next_due_date must not be before date_administered")
        return self


class VaccineUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    date_administered: Optional[date] = None
    next_due_date: Optional[date] = None
    clinic: Optional[str] = Field(default=None, max_length=200)
    notes: Optional[str] = Field(default=None, max_length=2000)
    document_url: Optional[str] = Field(default=None, max_length=500)

    @model_validator(mode="after")
    def validate_dates(self):
        if (self.date_administered and self.next_due_date
                and self.next_due_date < self.date_administered):
            raise ValueError("next_due_date must not be before date_administered")
        return self


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
