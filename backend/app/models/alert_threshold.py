from sqlalchemy import String, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AlertThreshold(Base):
    """Per-animal-type thresholds that admins can configure."""
    __tablename__ = "alert_thresholds"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    animal_type: Mapped[str] = mapped_column(String(30), unique=True, index=True)
    temp_min: Mapped[float] = mapped_column(Float)
    temp_max: Mapped[float] = mapped_column(Float)
    hr_min: Mapped[float] = mapped_column(Float)
    hr_max: Mapped[float] = mapped_column(Float)
    spo2_min: Mapped[float] = mapped_column(Float)
    activity_min: Mapped[float] = mapped_column(Float, default=5.0)
