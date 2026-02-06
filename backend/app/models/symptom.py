from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Symptom(Base):
    __tablename__ = "symptoms"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    pet_id: Mapped[int] = mapped_column(ForeignKey("pets.id", ondelete="CASCADE"), index=True)
    datetime_: Mapped[datetime] = mapped_column(
        "datetime", DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    type: Mapped[str] = mapped_column(String(100))  # vomiting, diarrhea, lethargy, itching, etc.
    severity: Mapped[str] = mapped_column(String(20))  # mild, moderate, severe
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    pet = relationship("Pet", back_populates="symptoms")
