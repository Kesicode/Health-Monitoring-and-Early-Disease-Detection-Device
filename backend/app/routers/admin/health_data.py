from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.health_reading import HealthReading
from app.models.user import User
from app.schemas.health import HealthReadingOut

router = APIRouter(prefix="/admin/health-data", tags=["admin-health"])


@router.get("", response_model=list[HealthReadingOut])
def list_all_readings(
    animal_id: int | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    q = db.query(HealthReading)
    if animal_id:
        q = q.filter(HealthReading.animal_id == animal_id)
    return q.order_by(HealthReading.recorded_at.desc()).offset(skip).limit(limit).all()
