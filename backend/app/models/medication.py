from datetime import date
from typing import Optional
from sqlalchemy import String, Integer, Date, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Medication(Base):
    __tablename__ = "medications"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    pet_id: Mapped[int] = mapped_column(ForeignKey("pets.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(200))
    dosage: Mapped[str] = mapped_column(String(100))  # e.g. "5 mg"
    frequency_per_day: Mapped[int] = mapped_column(Integer)
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    times_of_day: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)  # e.g. ["08:00","20:00"]
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    pet = relationship("Pet", back_populates="medications")
