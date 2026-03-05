"""Evaluate a new health reading against alert thresholds and create alerts."""
import asyncio
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.alert import Alert
from app.models.alert_threshold import AlertThreshold
from app.models.animal import Animal
from app.schemas.health import HealthReadingOut


# Default thresholds when none are in DB
DEFAULT_THRESHOLDS: dict[str, dict] = {
    "cow":     {"temp_min": 38.0, "temp_max": 39.5, "hr_min": 40,  "hr_max": 80,  "spo2_min": 94, "activity_min": 5},
    "chicken": {"temp_min": 40.6, "temp_max": 41.7, "hr_min": 250, "hr_max": 400, "spo2_min": 90, "activity_min": 5},
    "goat":    {"temp_min": 38.5, "temp_max": 40.0, "hr_min": 70,  "hr_max": 90,  "spo2_min": 94, "activity_min": 5},
    "pig":     {"temp_min": 38.7, "temp_max": 39.8, "hr_min": 60,  "hr_max": 80,  "spo2_min": 94, "activity_min": 5},
    "dog":     {"temp_min": 38.3, "temp_max": 39.2, "hr_min": 60,  "hr_max": 140, "spo2_min": 95, "activity_min": 5},
}


def _get_thresholds(db: Session, animal_type: str) -> dict:
    row = db.query(AlertThreshold).filter(AlertThreshold.animal_type == animal_type).first()
    if row:
        return {
            "temp_min": row.temp_min, "temp_max": row.temp_max,
            "hr_min": row.hr_min,     "hr_max": row.hr_max,
            "spo2_min": row.spo2_min, "activity_min": row.activity_min,
        }
    return DEFAULT_THRESHOLDS.get(animal_type, DEFAULT_THRESHOLDS["cow"])


def evaluate_and_create_alerts(
    db: Session,
    animal: Animal,
    reading_out: HealthReadingOut,
) -> list[Alert]:
    """Check reading against thresholds; create & return new Alert rows."""
    thresholds = _get_thresholds(db, animal.animal_type)
    new_alerts: list[Alert] = []

    checks = [
        ("temperature", reading_out.temperature, "fever",        "high",     thresholds["temp_max"], ">",  f"High temperature {reading_out.temperature}°C"),
        ("temperature", reading_out.temperature, "hypothermia",  "high",     thresholds["temp_min"], "<",  f"Low temperature {reading_out.temperature}°C"),
        ("heart_rate",  reading_out.heart_rate,  "tachycardia",  "high",     thresholds["hr_max"],   ">",  f"High heart rate {reading_out.heart_rate} bpm"),
        ("heart_rate",  reading_out.heart_rate,  "bradycardia",  "high",     thresholds["hr_min"],   "<",  f"Low heart rate {reading_out.heart_rate} bpm"),
        ("spo2",        reading_out.spo2,        "low_spo2",     "critical", thresholds["spo2_min"], "<",  f"Low SpO2 {reading_out.spo2}%"),
        ("activity_level", reading_out.activity_level, "inactivity", "medium", thresholds["activity_min"], "<", f"Low activity level {reading_out.activity_level}"),
    ]

    for field, value, alert_type, severity, threshold, op, message in checks:
        if value is None:
            continue
        triggered = (op == ">" and value > threshold) or (op == "<" and value < threshold)
        if triggered:
            alert = Alert(
                animal_id=animal.id,
                alert_type=alert_type,
                severity=severity,
                message=message,
                metric_value=value,
                created_at=datetime.now(timezone.utc),
            )
            db.add(alert)
            new_alerts.append(alert)

    if new_alerts:
        db.commit()
        for alert in new_alerts:
            db.refresh(alert)

    return new_alerts
