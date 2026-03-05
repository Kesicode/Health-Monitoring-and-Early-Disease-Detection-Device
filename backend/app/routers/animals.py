from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_farmer
from app.models.animal import Animal
from app.models.user import User
from app.schemas.animal import AnimalCreate, AnimalUpdate, AnimalOut, AnimalWithDevice
from app.services.qr_service import generate_animal_qr

router = APIRouter(prefix="/animals", tags=["animals"])


@router.get("", response_model=list[AnimalWithDevice])
def list_my_animals(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    return db.query(Animal).filter(Animal.owner_id == current_user.id).offset(skip).limit(limit).all()


@router.post("", response_model=AnimalOut, status_code=status.HTTP_201_CREATED)
def create_animal(
    body: AnimalCreate,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    animal = Animal(**body.model_dump(), owner_id=current_user.id)
    db.add(animal)
    db.flush()
    animal.qr_code = generate_animal_qr(animal.id, animal.name)
    db.commit()
    db.refresh(animal)
    return animal


@router.get("/{animal_id}", response_model=AnimalWithDevice)
def get_animal(
    animal_id: int,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    animal = db.get(Animal, animal_id)
    if not animal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    if animal.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return animal


@router.patch("/{animal_id}", response_model=AnimalOut)
def update_animal(
    animal_id: int,
    body: AnimalUpdate,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    animal = db.get(Animal, animal_id)
    if not animal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    if animal.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(animal, field, value)
    db.commit()
    db.refresh(animal)
    return animal


@router.delete("/{animal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_animal(
    animal_id: int,
    current_user: User = Depends(require_farmer),
    db: Session = Depends(get_db),
):
    animal = db.get(Animal, animal_id)
    if not animal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    if animal.owner_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    db.delete(animal)
    db.commit()
