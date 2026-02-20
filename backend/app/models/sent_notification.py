from datetime import date, datetime, timezone
from sqlalchemy import String, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class SentNotification(Base):
    __tablename__ = "sent_notifications"
    __table_args__ = (
        UniqueConstraint("user_id", "notification_key", "sent_date", name="uq_sent_notification"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    notification_key: Mapped[str] = mapped_column(String(255))
    sent_date: Mapped[date] = mapped_column(Date, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
