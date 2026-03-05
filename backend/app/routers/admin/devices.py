from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.device import Device
from app.models.user import User
from app.schemas.device import DeviceRegister, DeviceUpdate, DeviceOut

router = APIRouter(prefix="/admin/devices", tags=["admin-devices"])


@router.get("", response_model=list[DeviceOut])
def list_all_devices(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return db.query(Device).offset(skip).limit(limit).all()


@router.post("", response_model=DeviceOut, status_code=status.HTTP_201_CREATED)
def register_device(
    body: DeviceRegister,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    if db.query(Device).filter(Device.serial_number == body.serial_number).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Serial number already exists")
    device = Device(**body.model_dump())
    db.add(device)
    db.commit()
    db.refresh(device)
    return device


@router.get("/{device_id}", response_model=DeviceOut)
def get_device(device_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    device = db.get(Device, device_id)
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    return device


@router.patch("/{device_id}", response_model=DeviceOut)
def update_device(
    device_id: int,
    body: DeviceUpdate,
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    device = db.get(Device, device_id)
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(device, field, value)
    db.commit()
    db.refresh(device)
    return device


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_device(device_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    device = db.get(Device, device_id)
    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Device not found")
    db.delete(device)
    db.commit()
