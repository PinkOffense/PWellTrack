from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class WeightLog(Base):
    __tablename__ = "weight_logs_history"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    pet_id: Mapped[int] = mapped_column(ForeignKey("pets.id", ondelete="CASCADE"), index=True)
    datetime_: Mapped[datetime] = mapped_column(
        "datetime", DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    weight_kg: Mapped[float] = mapped_column(Float)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    pet = relationship("Pet", back_populates="weight_logs")
