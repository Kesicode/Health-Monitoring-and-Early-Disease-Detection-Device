from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.alert_threshold import AlertThreshold
from app.models.user import User
from app.schemas.settings import ThresholdOut, ThresholdUpdate

router = APIRouter(prefix="/admin/settings", tags=["admin-settings"])

DEFAULT_THRESHOLDS = [
    {"animal_type": "cow",     "temp_min": 38.0, "temp_max": 39.5, "hr_min": 40,  "hr_max": 80,  "spo2_min": 94, "activity_min": 5},
    {"animal_type": "chicken", "temp_min": 40.6, "temp_max": 41.7, "hr_min": 250, "hr_max": 400, "spo2_min": 90, "activity_min": 5},
    {"animal_type": "goat",    "temp_min": 38.5, "temp_max": 40.0, "hr_min": 70,  "hr_max": 90,  "spo2_min": 94, "activity_min": 5},
    {"animal_type": "pig",     "temp_min": 38.7, "temp_max": 39.8, "hr_min": 60,  "hr_max": 80,  "spo2_min": 94, "activity_min": 5},
    {"animal_type": "dog",     "temp_min": 38.3, "temp_max": 39.2, "hr_min": 60,  "hr_max": 140, "spo2_min": 95, "activity_min": 5},
]


@router.get("/thresholds", response_model=list[ThresholdOut])
def get_thresholds(_: User = Depends(require_admin), db: Session = Depends(get_db)):
    rows = db.query(AlertThreshold).all()
    if not rows:
        # Seed defaults
        for t in DEFAULT_THRESHOLDS:
            db.add(AlertThreshold(**t))
        db.commit()
        rows = db.query(AlertThreshold).all()
    return rows


@router.patch("/thresholds/{animal_type}", response_model=ThresholdOut)
def update_threshold(
    animal_type: str,
    body: ThresholdUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    row = db.query(AlertThreshold).filter(AlertThreshold.animal_type == animal_type).first()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Threshold not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(row, field, value)
    db.commit()
    db.refresh(row)
    return row
