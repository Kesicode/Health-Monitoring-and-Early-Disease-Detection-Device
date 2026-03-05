from sqlalchemy import String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone

from app.core.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    animal_id: Mapped[int] = mapped_column(ForeignKey("animals.id"))
    alert_type: Mapped[str] = mapped_column(String(30))    # fever, bradycardia, tachycardia, low_spo2, inactivity
    severity: Mapped[str] = mapped_column(String(10))      # low, medium, high, critical
    message: Mapped[str] = mapped_column(Text)
    metric_value: Mapped[float | None] = mapped_column(nullable=True)
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    animal: Mapped["Animal"] = relationship("Animal", back_populates="alerts")
