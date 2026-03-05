from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.alert import Alert
from app.models.user import User
from app.schemas.alert import AlertOut

router = APIRouter(prefix="/admin/alerts", tags=["admin-alerts"])


@router.get("", response_model=list[AlertOut])
def list_all_alerts(
    unresolved_only: bool = Query(False),
    animal_id: int | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    q = db.query(Alert).options(joinedload(Alert.animal))
    if unresolved_only:
        q = q.filter(Alert.is_resolved == False)
    if animal_id is not None:
        q = q.filter(Alert.animal_id == animal_id)
    return q.order_by(Alert.created_at.desc()).offset(skip).limit(limit).all()


@router.patch("/{alert_id}/resolve", response_model=AlertOut)
def resolve_alert(
    alert_id: int,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    from fastapi import HTTPException, status
    alert = db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found")
    alert.is_resolved = True
    alert.resolved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(alert)
    return alert
