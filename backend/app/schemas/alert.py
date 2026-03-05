from pydantic import BaseModel
from datetime import datetime


class AlertOut(BaseModel):
    id: int
    animal_id: int
    alert_type: str
    severity: str
    message: str
    metric_value: float | None
    is_resolved: bool
    resolved_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class AlertResolve(BaseModel):
    alert_id: int
