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
from fastapi.encoders import jsonable_encoder

router = APIRouter(prefix="/properties", tags=["properties"])


@router.post("/", response_model=PropertyRead)
def create_property(payload: PropertyCreate, db: Session = Depends(get_db)):
    db_obj = PropertyModel(**payload.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    # Return a plain dict with primitive types to avoid ORM->Pydantic issues
    return {
        "id": db_obj.id,
        "address": db_obj.address,
        "bedrooms": db_obj.bedrooms,
        "bathrooms": db_obj.bathrooms,
        "area": db_obj.area,
        "rent_amount": str(db_obj.rent_amount) if db_obj.rent_amount is not None else None,
        "status": db_obj.status,
        "created_at": db_obj.created_at.isoformat() if db_obj.created_at else None,
    }


@router.get("/", response_model=dict)
def list_properties(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    try:
        props = db.query(PropertyModel).offset(skip).limit(limit).all()
        # Convert SQLAlchemy objects to plain dicts with primitive types
        value = []
        for p in props:
            value.append({
                "id": p.id,
                "address": p.address,
                "bedrooms": p.bedrooms,
                "bathrooms": p.bathrooms,
                "area": p.area,
                "rent_amount": str(p.rent_amount) if p.rent_amount is not None else None,
                "status": p.status,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            })
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
    return {
        "id": prop.id,
        "address": prop.address,
        "bedrooms": prop.bedrooms,
        "bathrooms": prop.bathrooms,
        "area": prop.area,
        "rent_amount": str(prop.rent_amount) if prop.rent_amount is not None else None,
        "status": prop.status,
        "created_at": prop.created_at.isoformat() if prop.created_at else None,
    }


@router.put("/{property_id}", response_model=PropertyRead)
def update_property(property_id: int, payload: PropertyUpdate, db: Session = Depends(get_db)):
    db_property = db.query(PropertyModel).filter(PropertyModel.id == property_id).first()
    if db_property is None:
        raise HTTPException(status_code=404, detail="Property not found")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(db_property, field, value)

    db.commit()
    db.refresh(db_property)
    return {
        "id": db_property.id,
        "address": db_property.address,
        "bedrooms": db_property.bedrooms,
        "bathrooms": db_property.bathrooms,
        "area": db_property.area,
        "rent_amount": str(db_property.rent_amount) if db_property.rent_amount is not None else None,
        "status": db_property.status,
        "created_at": db_property.created_at.isoformat() if db_property.created_at else None,
    }


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
    return {
        "id": db_property.id,
        "address": db_property.address,
        "bedrooms": db_property.bedrooms,
        "bathrooms": db_property.bathrooms,
        "area": db_property.area,
        "rent_amount": str(db_property.rent_amount) if db_property.rent_amount is not None else None,
        "status": db_property.status,
        "created_at": db_property.created_at.isoformat() if db_property.created_at else None,
    }


@router.delete("/{property_id}")
def delete_property(property_id: int, db: Session = Depends(get_db)):
    db_property = db.query(PropertyModel).filter(PropertyModel.id == property_id).first()
    if db_property is None:
        raise HTTPException(status_code=404, detail="Property not found")

    db.delete(db_property)
    db.commit()
    return {"message": f"Property {property_id} deleted successfully"}