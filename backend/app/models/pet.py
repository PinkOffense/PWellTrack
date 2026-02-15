from datetime import date, datetime, timezone
from typing import Optional
from sqlalchemy import String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Pet(Base):
    __tablename__ = "pets"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(120))
    species: Mapped[str] = mapped_column(String(50))  # dog, cat, exotic, etc.
    breed: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    date_of_birth: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    sex: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    weight_kg: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    photo_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    owner = relationship("User", back_populates="pets")
    feeding_logs = relationship("FeedingLog", back_populates="pet", cascade="all, delete-orphan")
    water_logs = relationship("WaterLog", back_populates="pet", cascade="all, delete-orphan")
    vaccines = relationship("Vaccine", back_populates="pet", cascade="all, delete-orphan")
    medications = relationship("Medication", back_populates="pet", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="pet", cascade="all, delete-orphan")
    symptoms = relationship("Symptom", back_populates="pet", cascade="all, delete-orphan")
    weight_logs = relationship("WeightLog", back_populates="pet", cascade="all, delete-orphan")
