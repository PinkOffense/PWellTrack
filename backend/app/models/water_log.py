from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class WaterLog(Base):
    __tablename__ = "water_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    pet_id: Mapped[int] = mapped_column(ForeignKey("pets.id", ondelete="CASCADE"), index=True)
    datetime_: Mapped[datetime] = mapped_column(
        "datetime", DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True
    )
    amount_ml: Mapped[float] = mapped_column(Float)
    daily_goal_ml: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    pet = relationship("Pet", back_populates="water_logs")
