from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.alert import Alert
from app.models.animal import Animal
from app.models.device import Device
from app.models.health_reading import HealthReading
from app.models.user import User
from app.schemas.settings import AdminStats

router = APIRouter(prefix="/admin/stats", tags=["admin-stats"])


@router.get("", response_model=AdminStats)
def get_stats(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    return AdminStats(
        total_users=db.query(func.count(User.id)).scalar(),
        total_animals=db.query(func.count(Animal.id)).scalar(),
        total_devices=db.query(func.count(Device.id)).scalar(),
        active_devices=db.query(func.count(Device.id)).filter(Device.is_active == True).scalar(),
        active_alerts=db.query(func.count(Alert.id)).filter(Alert.is_resolved == False).scalar(),
        readings_today=db.query(func.count(HealthReading.id)).filter(HealthReading.recorded_at >= today_start).scalar(),
    )
