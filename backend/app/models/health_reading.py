from sqlalchemy import Float, ForeignKey, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone

from app.core.database import Base


class HealthReading(Base):
    __tablename__ = "health_readings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    animal_id: Mapped[int] = mapped_column(ForeignKey("animals.id"))
    device_id: Mapped[int | None] = mapped_column(ForeignKey("devices.id"), nullable=True)
    temperature: Mapped[float | None] = mapped_column(Float, nullable=True)      # Celsius
    heart_rate: Mapped[float | None] = mapped_column(Float, nullable=True)        # bpm
    spo2: Mapped[float | None] = mapped_column(Float, nullable=True)             # % oxygen
    activity_level: Mapped[float | None] = mapped_column(Float, nullable=True)   # 0-100
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    source: Mapped[str] = mapped_column(String(20), default="device")            # device | manual

    animal: Mapped["Animal"] = relationship("Animal", back_populates="health_readings")
    device: Mapped["Device | None"] = relationship("Device", back_populates="health_readings")
