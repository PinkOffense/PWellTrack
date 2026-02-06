from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class FeedingLog(Base):
    __tablename__ = "feeding_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    pet_id: Mapped[int] = mapped_column(ForeignKey("pets.id", ondelete="CASCADE"), index=True)
    datetime_: Mapped[datetime] = mapped_column(
        "datetime", DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    food_type: Mapped[str] = mapped_column(String(120))
    planned_amount_grams: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    actual_amount_grams: Mapped[float] = mapped_column(Float)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    pet = relationship("Pet", back_populates="feeding_logs")
