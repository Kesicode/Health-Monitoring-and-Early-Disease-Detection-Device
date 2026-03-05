from pydantic import BaseModel


class ThresholdOut(BaseModel):
    id: int
    animal_type: str
    temp_min: float
    temp_max: float
    hr_min: float
    hr_max: float
    spo2_min: float
    activity_min: float

    model_config = {"from_attributes": True}


class ThresholdUpdate(BaseModel):
    temp_min: float | None = None
    temp_max: float | None = None
    hr_min: float | None = None
    hr_max: float | None = None
    spo2_min: float | None = None
    activity_min: float | None = None


class AdminStats(BaseModel):
    total_users: int
    total_animals: int
    total_devices: int
    active_devices: int
    active_alerts: int
    readings_today: int
