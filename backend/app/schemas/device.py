from pydantic import BaseModel
from datetime import datetime


class DeviceRegister(BaseModel):
    """Admin registers a new device serial into the system."""
    serial_number: str
    device_type: str = "collar"
    firmware_version: str | None = None


class DeviceClaim(BaseModel):
    """Farmer claims a device by serial, links to an animal."""
    serial_number: str
    animal_id: int


class DeviceUpdate(BaseModel):
    device_type: str | None = None
    firmware_version: str | None = None
    is_active: bool | None = None


class DeviceOut(BaseModel):
    id: int
    serial_number: str
    device_type: str
    firmware_version: str | None
    is_active: bool
    is_claimed: bool
    owner_id: int | None
    animal_id: int | None
    last_seen: datetime | None
    registered_at: datetime

    model_config = {"from_attributes": True}
