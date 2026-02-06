from datetime import date
from typing import Optional
from sqlalchemy import String, Date, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Vaccine(Base):
    __tablename__ = "vaccines"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    pet_id: Mapped[int] = mapped_column(ForeignKey("pets.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(200))
    date_administered: Mapped[date] = mapped_column(Date)
    next_due_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    clinic: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    document_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    pet = relationship("Pet", back_populates="vaccines")
