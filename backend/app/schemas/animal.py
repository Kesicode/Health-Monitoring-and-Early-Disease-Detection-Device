from pydantic import BaseModel
from datetime import datetime


class AnimalCreate(BaseModel):
    name: str
    animal_type: str
    breed: str | None = None
    age_months: int | None = None
    weight_kg: float | None = None
    gender: str | None = None
    tag_number: str | None = None
    notes: str | None = None


class AnimalUpdate(BaseModel):
    name: str | None = None
    breed: str | None = None
    age_months: int | None = None
    weight_kg: float | None = None
    gender: str | None = None
    tag_number: str | None = None
    notes: str | None = None


class AnimalOut(BaseModel):
    id: int
    name: str
    animal_type: str
    breed: str | None
    age_months: int | None
    weight_kg: float | None
    gender: str | None
    tag_number: str | None
    notes: str | None
    owner_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class AnimalWithDevice(AnimalOut):
    device: "DeviceOut | None" = None

    model_config = {"from_attributes": True}


from app.schemas.device import DeviceOut  # noqa: E402
AnimalWithDevice.model_rebuild()
