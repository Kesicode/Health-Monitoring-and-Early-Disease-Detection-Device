from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_farmer, get_device_by_serial
from app.models.animal import Animal
from app.models.device import Device
from app.models.health_reading import HealthReading
from app.models.user import User
from app.schemas.health import HealthReadingCreate, HealthReadingManual, HealthReadingOut, HealthStats
from app.services.alert_service import evaluate_and_create_alerts
from app.services.ws_manager import ws_manager

router = APIRouter(prefix="/health", tags=["health"])


@router.post("/data", status_code=status.HTTP_201_CREATED)
async def receive_device_data(
    body: HealthReadingCreate,
    device: Device = Depends(get_device_by_serial),
    db: Session = Depends(get_db),
):
    """IoT device pushes health readings via X-Device-Serial header."""
    if not device.animal_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Device is not linked to an animal")

    reading = HealthReading(
        animal_id=device.animal_id,
        device_id=device.id,
        temperature=body.temperature,
        heart_rate=body.heart_rate,
        spo2=body.spo2,
        activity_level=body.activity_level,
        source="device",
    )
    db.add(reading)
    device.last_seen = datetime.now(timezone.utc)
    db.commit()
    db.refresh(reading)

    reading_out = HealthReadingOut.model_validate(reading)
    animal = db.get(Animal, device.animal_id)

    # Fire alerts
    new_alerts = evaluate_and_create_alerts(db, animal, reading_out)

    # Broadcast over WebSocket
    await ws_manager.broadcast_health(animal.id, reading_out.model_dump(mode="json"))
    if new_alerts:
        alert_data = [{"id": a.id, "alert_type": a.alert_type, "severity": a.severity, "message": a.message} for a in new_alerts]
        # Notify animal owner
        await ws_manager.broadcast_alert(animal.owner_id, {"alerts": alert_data})
        # Notify all admins
        from app.models.user import User as UserModel
        admin_ids = [u.id for u in db.query(UserModel).filter(UserModel.role == "admin").all()]
        for admin_id in admin_ids:
            await ws_manager.broadcast_alert(admin_id, {"alerts": alert_data})

    return {"status": "ok", "reading_id": reading.id}


@router.post("/manual", response_model=HealthReadingOut, status_code=status.HTTP_201_CREATED)
async def manual_entry(
    body: HealthReadingManual,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    animal = db.get(Animal, body.animal_id)
    if not animal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    if animal.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    reading = HealthReading(
        animal_id=body.animal_id,
        temperature=body.temperature,
        heart_rate=body.heart_rate,
        spo2=body.spo2,
        activity_level=body.activity_level,
        source="manual",
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)

    reading_out = HealthReadingOut.model_validate(reading)
    await ws_manager.broadcast_health(animal.id, reading_out.model_dump(mode="json"))
    evaluate_and_create_alerts(db, animal, reading_out)
    return reading_out


@router.get("/{animal_id}/readings", response_model=list[HealthReadingOut])
def get_readings(
    animal_id: int,
    hours: int = Query(24, ge=1, le=168),
    limit: int = Query(200, ge=1, le=1000),
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    animal = db.get(Animal, animal_id)
    if not animal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    if animal.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    since = datetime.now(timezone.utc) - timedelta(hours=hours)
    return (
        db.query(HealthReading)
        .filter(HealthReading.animal_id == animal_id, HealthReading.recorded_at >= since)
        .order_by(HealthReading.recorded_at.desc())
        .limit(limit)
        .all()
    )


@router.get("/{animal_id}/stats", response_model=HealthStats)
def get_stats(
    animal_id: int,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    animal = db.get(Animal, animal_id)
    if not animal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    if animal.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    since = datetime.now(timezone.utc) - timedelta(hours=24)
    rows = (
        db.query(HealthReading)
        .filter(HealthReading.animal_id == animal_id, HealthReading.recorded_at >= since)
        .all()
    )
    latest = (
        db.query(HealthReading)
        .filter(HealthReading.animal_id == animal_id)
        .order_by(HealthReading.recorded_at.desc())
        .first()
    )

    def safe_avg(values):
        clean = [v for v in values if v is not None]
        return sum(clean) / len(clean) if clean else None

    return HealthStats(
        animal_id=animal_id,
        latest=HealthReadingOut.model_validate(latest) if latest else None,
        avg_temp_24h=safe_avg([r.temperature for r in rows]),
        avg_hr_24h=safe_avg([r.heart_rate for r in rows]),
        avg_spo2_24h=safe_avg([r.spo2 for r in rows]),
        reading_count_24h=len(rows),
    )
