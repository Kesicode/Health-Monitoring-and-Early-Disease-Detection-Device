from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.animal import Animal
from app.models.user import User
from app.schemas.animal import AnimalOut, AnimalWithDevice

router = APIRouter(prefix="/admin/animals", tags=["admin-animals"])


@router.get("", response_model=list[AnimalWithDevice])
def list_all_animals(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    _: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return db.query(Animal).offset(skip).limit(limit).all()


@router.get("/{animal_id}", response_model=AnimalWithDevice)
def get_animal(animal_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    animal = db.get(Animal, animal_id)
    if not animal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    return animal


@router.delete("/{animal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_animal(animal_id: int, _: User = Depends(require_admin), db: Session = Depends(get_db)):
    animal = db.get(Animal, animal_id)
    if not animal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Animal not found")
    db.delete(animal)
    db.commit()
