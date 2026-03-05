from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_farmer
from app.models.device import Device
from app.models.user import User
from app.schemas.device import DeviceClaim, DeviceOut

router = APIRouter(prefix="/devices", tags=["devices"])


@router.get("", response_model=list[DeviceOut])
def list_my_devices(
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    return db.query(Device).filter(Device.owner_id == current_user.id).all()


@router.post("/claim", response_model=DeviceOut)
def claim_device(
    body: DeviceClaim,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    device = db.query(Device).filter(Device.serial_number == body.serial_number).first()
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    if device.is_claimed:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Device already claimed")
    if not device.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Device is inactive")

    # Confirm animal belongs to current user
    from app.models.animal import Animal
    animal = db.get(Animal, body.animal_id)
    if not animal or animal.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")

    device.owner_id = current_user.id
    device.animal_id = body.animal_id
    device.is_claimed = True
    db.commit()
    db.refresh(device)
    return device


@router.get("/{device_id}", response_model=DeviceOut)
def get_device(
    device_id: int,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    device = db.get(Device, device_id)
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    if device.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return device
