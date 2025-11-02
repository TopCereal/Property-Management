from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models.models import Property as PropertyModel
from ..schemas.schemas import (
    PropertyCreate,
    PropertyRead,
    PropertyUpdate,
    PropertyPatch,
)

router = APIRouter(prefix="/properties", tags=["properties"])


@router.post("/", response_model=PropertyRead)
def create_property(payload: PropertyCreate, db: Session = Depends(get_db)):
    db_obj = PropertyModel(**payload.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


@router.get("/", response_model=dict)
def list_properties(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        props = db.query(PropertyModel).offset(skip).limit(limit).all()
        # Convert SQLAlchemy objects to Pydantic models for safe JSON serialization
        value = [PropertyRead.from_orm(p).dict() for p in props]
        return {"value": value, "Count": len(value)}
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print("Error in list_properties:", tb)
        # Return a detailed error for debugging tests
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(tb))


@router.get("/{property_id}", response_model=PropertyRead)
def get_property(property_id: int, db: Session = Depends(get_db)):
    prop = db.query(PropertyModel).filter(PropertyModel.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop


@router.put("/{property_id}", response_model=PropertyRead)
def update_property(property_id: int, payload: PropertyUpdate, db: Session = Depends(get_db)):
    db_property = db.query(PropertyModel).filter(PropertyModel.id == property_id).first()
    if db_property is None:
        raise HTTPException(status_code=404, detail="Property not found")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(db_property, field, value)

    db.commit()
    db.refresh(db_property)
    return db_property


@router.patch("/{property_id}", response_model=PropertyRead)
def patch_property(property_id: int, payload: PropertyPatch, db: Session = Depends(get_db)):
    db_property = db.query(PropertyModel).filter(PropertyModel.id == property_id).first()
    if db_property is None:
        raise HTTPException(status_code=404, detail="Property not found")

    for field, value in payload.dict(exclude_unset=True).items():
        if value is not None:
            setattr(db_property, field, value)

    db.commit()
    db.refresh(db_property)
    return db_property


@router.delete("/{property_id}")
def delete_property(property_id: int, db: Session = Depends(get_db)):
    db_property = db.query(PropertyModel).filter(PropertyModel.id == property_id).first()
    if db_property is None:
        raise HTTPException(status_code=404, detail="Property not found")

    db.delete(db_property)
    db.commit()
    return {"message": f"Property {property_id} deleted successfully"}