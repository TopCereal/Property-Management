from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import Property as PropertyModel
from app.schemas.schemas import PropertyCreate, PropertyRead

router = APIRouter(prefix="/properties", tags=["properties"])

@router.post("/", response_model=PropertyRead)
def create_property(payload: PropertyCreate, db: Session = Depends(get_db)):
    db_obj = PropertyModel(
        address=payload.address,
        bedrooms=payload.bedrooms,
        bathrooms=payload.bathrooms,
        area=payload.area,
        rent_amount=payload.rent_amount,
        status=payload.status
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/", response_model=List[PropertyRead])
def list_properties(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    props = db.query(PropertyModel).offset(skip).limit(limit).all()
    return props

@router.get("/{property_id}", response_model=PropertyRead)
def get_property(property_id: int, db: Session = Depends(get_db)):
    prop = db.query(PropertyModel).filter(PropertyModel.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop