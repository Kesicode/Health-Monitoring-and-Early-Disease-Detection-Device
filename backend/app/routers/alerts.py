from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.dependencies import require_farmer
from app.models.alert import Alert
from app.models.animal import Animal
from app.models.user import User
from app.schemas.alert import AlertOut

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=list[AlertOut])
def list_my_alerts(
    unresolved_only: bool = Query(False),
    animal_id: int | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    my_animal_ids = [a.id for a in db.query(Animal).filter(Animal.owner_id == current_user.id).all()]
    q = db.query(Alert).options(joinedload(Alert.animal)).filter(Alert.animal_id.in_(my_animal_ids))
    if animal_id is not None:
        q = q.filter(Alert.animal_id == animal_id)
    if unresolved_only:
        q = q.filter(Alert.is_resolved == False)
    return q.order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()


@router.patch("/{alert_id}/resolve", response_model=AlertOut)
def resolve_alert(
    alert_id: int,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    alert = db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    animal = db.get(Animal, alert.animal_id)
    if animal.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    alert.is_resolved = True
    alert.resolved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(alert)
    return alert
