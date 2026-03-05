from pydantic import BaseModel
from datetime import datetime


class HealthReadingCreate(BaseModel):
    """Pushed by IoT device via POST /health-data with X-Device-Serial header."""
    temperature: float | None = None
    heart_rate: float | None = None
    spo2: float | None = None
    activity_level: float | None = None


class HealthReadingManual(BaseModel):
    """Manual entry by farmer."""
    animal_id: int
    temperature: float | None = None
    heart_rate: float | None = None
    spo2: float | None = None
    activity_level: float | None = None


class HealthReadingOut(BaseModel):
    id: int
    animal_id: int
    device_id: int | None
    temperature: float | None
    heart_rate: float | None
    spo2: float | None
    activity_level: float | None
    recorded_at: datetime
    source: str

    model_config = {"from_attributes": True}


class HealthStats(BaseModel):
    animal_id: int
    latest: HealthReadingOut | None
    avg_temp_24h: float | None
    avg_hr_24h: float | None
    avg_spo2_24h: float | None
    reading_count_24h: int
