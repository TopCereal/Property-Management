from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
import logging

# Configure logger
logger = logging.getLogger(__name__)

from ..database import get_db
from ..models.models import Property as PropertyModel
from ..schemas.schemas import (
    PropertyCreate,
    PropertyRead,
    PropertyUpdate,
    PropertyPatch,
)
from ..schemas.responses import APIError
from fastapi.encoders import jsonable_encoder

router = APIRouter(
    prefix="/properties",
    tags=["Properties"],
    responses={500: {"model": APIError, "description": "Internal server error"}},
)


@router.post("/",
    response_model=PropertyRead,
    summary="Create Property",
    description="""
    Create a new property in the system.
    
    Parameters:
    - address: Full property address
    - bedrooms: Number of bedrooms
    - bathrooms: Number of bathrooms
    - area: Property area in square feet
    - rent_amount: Monthly rent amount
    - status: Property status (available, rented, maintenance)
    
    Returns the created property with all fields including the assigned ID.
    """,
    responses={
        201: {"description": "Property created successfully"},
        422: {"description": "Validation error in request body"}
    },
    status_code=201
)
def create_property(
    payload: PropertyCreate, 
    db: Session = Depends(get_db)
):
    """Create a new property with the provided details"""
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


@router.get("/",
    response_model=Dict[str, Any],
    summary="List Properties",
    description="""
    Retrieve a paginated list of properties.
    
    Parameters:
    - skip: Number of records to skip (pagination offset)
    - limit: Maximum number of records to return
    - status: Optional filter by property status
    
    Returns a dictionary containing:
    - total: Total number of properties
    - properties: List of property objects
    - page_info: Pagination metadata
    """,
    responses={
        200: {"description": "List of properties retrieved successfully"},
        500: {"description": "Database error"}
    }
)
def list_properties(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    status: str = Query(None, description="Filter by property status"),
    db: Session = Depends(get_db)
):
    """Retrieve a paginated list of properties with optional status filter"""
    try:
        # Build query with optional status filter
        query = db.query(PropertyModel)
        if status:
            query = query.filter(PropertyModel.status == status)
            
        # Get total count
        total = query.count()
        
        # Apply pagination
        props = query.offset(skip).limit(limit).all()
        
        # Convert SQLAlchemy objects to plain dicts with primitive types
        properties = []
        for p in props:
            properties.append({
                "id": p.id,
                "address": p.address,
                "bedrooms": p.bedrooms,
                "bathrooms": p.bathrooms,
                "area": p.area,
                "rent_amount": str(p.rent_amount) if p.rent_amount is not None else None,
                "status": p.status,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            })
        return {
            "properties": properties,
            "total": total,
            "page_info": {
                "skip": skip,
                "limit": limit,
                "has_more": (skip + limit) < total
            },
            "filters": {
                "status": status
            }
        }
    except Exception as e:
        logger.error(f"Error listing properties: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error retrieving properties"
        )


@router.get("/{property_id}",
    response_model=PropertyRead,
    summary="Get Property Details",
    description="""
    Retrieve detailed information about a specific property.
    
    Parameters:
    - property_id: Unique identifier of the property
    
    Returns a single property with all its details.
    """,
    responses={
        200: {"description": "Property details retrieved successfully"},
        404: {"description": "Property not found"},
        500: {"description": "Database error"}
    }
)
def get_property(
    property_id: int = Path(..., title="Property ID", description="The ID of the property to retrieve"),
    db: Session = Depends(get_db)
):
    """Retrieve a specific property by its ID"""
    try:
        prop = db.query(PropertyModel).filter(PropertyModel.id == property_id).first()
        if not prop:
            raise HTTPException(status_code=404, detail="Property not found")
            
        # Convert SQLAlchemy object to dict with primitive types
        result = {
            "id": prop.id,
            "address": prop.address,
            "bedrooms": prop.bedrooms,
            "bathrooms": prop.bathrooms,
            "area": prop.area,
            "rent_amount": str(prop.rent_amount) if prop.rent_amount is not None else None,
            "status": prop.status,
            "created_at": prop.created_at.isoformat() if prop.created_at else None,
        }
        return result
    except Exception as e:
        logger.error(f"Error retrieving property {property_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error retrieving property details"
        )


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