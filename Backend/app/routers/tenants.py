from fastapi import APIRouter, Depends, HTTPException, Query, Path, status, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from datetime import datetime
import logging

from ..database import get_db
from ..models.models import Tenant as TenantModel, Property as PropertyModel, Lease as LeaseModel
from ..schemas.schemas import TenantCreate, TenantRead, TenantPatch
from ..schemas.responses import APIError

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/tenants",
    tags=["Tenants"],
    responses={500: {"model": APIError, "description": "Internal server error"}}
)


@router.post("/",
    response_model=TenantRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create Tenant",
    description="""
    Create a new tenant in the system.
    
    Parameters:
    - first_name: Tenant's first name
    - last_name: Tenant's last name
    - email: Valid email address
    - phone: Contact phone number
    - status: Tenant status (active, inactive, applicant)
    
    Returns the created tenant with all fields including the assigned ID.
    """,
    responses={
        201: {"description": "Tenant created successfully"},
        422: {"description": "Validation error in request body"},
        500: {"description": "Database error"}
    }
)
def create_tenant(
    payload: TenantCreate = Body(..., description="Tenant information"),
    db: Session = Depends(get_db)
):
    """Create a new tenant with the provided details"""
    try:
        db_obj = TenantModel(**payload.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        
        # Convert SQLAlchemy object to dict with primitive types
        return {
            "id": db_obj.id,
            "first_name": db_obj.first_name,
            "last_name": db_obj.last_name,
            "email": db_obj.email,
            "phone": db_obj.phone,
            "status": db_obj.status,
            "created_at": db_obj.created_at.isoformat() if db_obj.created_at else None,
        }
    except Exception as e:
        logger.error(f"Error creating tenant: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating tenant"
        )


@router.get("/",
    response_model=Dict[str, Any],
    summary="List Tenants",
    description="""
    Retrieve a paginated list of tenants.
    
    Parameters:
    - skip: Number of records to skip (pagination offset)
    - limit: Maximum number of records to return
    - status: Optional filter by tenant status
    - search: Optional search by name or email
    
    Returns a dictionary containing:
    - total: Total number of tenants
    - tenants: List of tenant objects
    - page_info: Pagination metadata
    """,
    responses={
        200: {"description": "List of tenants retrieved successfully"},
        500: {"description": "Database error"}
    }
)
def list_tenants(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    status: str = Query(None, description="Filter by tenant status"),
    search: str = Query(None, description="Search by name or email"),
    db: Session = Depends(get_db)
):
    """Retrieve a paginated list of tenants with optional filters"""
    try:
        # Build base query
        query = db.query(TenantModel)
        
        # Apply filters
        if status:
            query = query.filter(TenantModel.status == status)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (TenantModel.first_name.ilike(search_term)) |
                (TenantModel.last_name.ilike(search_term)) |
                (TenantModel.email.ilike(search_term))
            )
            
        # Get total count
        total = query.count()
        
        # Apply pagination
        tenants = query.offset(skip).limit(limit).all()
        
        # Convert SQLAlchemy objects to dicts with primitive types
        tenant_list = []
        for t in tenants:
            tenant_list.append({
                "id": t.id,
                "first_name": t.first_name,
                "last_name": t.last_name,
                "email": t.email,
                "phone": t.phone,
                "status": t.status,
                "created_at": t.created_at.isoformat() if t.created_at else None,
            })
            
        return {
            "tenants": tenant_list,
            "total": total,
            "page_info": {
                "skip": skip,
                "limit": limit,
                "has_more": (skip + limit) < total
            },
            "filters": {
                "status": status,
                "search": search
            }
        }
    except Exception as e:
        logger.error(f"Error listing tenants: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving tenants"
        )


@router.get("/{tenant_id}",
    response_model=TenantRead,
    summary="Get Tenant Details",
    description="""
    Retrieve detailed information about a specific tenant.
    
    Parameters:
    - tenant_id: Unique identifier of the tenant
    
    Returns a single tenant with all their details.
    """,
    responses={
        200: {"description": "Tenant details retrieved successfully"},
        404: {"description": "Tenant not found"},
        500: {"description": "Database error"}
    }
)
def get_tenant(
    tenant_id: int = Path(..., title="Tenant ID", description="The ID of the tenant to retrieve"),
    db: Session = Depends(get_db)
):
    """Retrieve a specific tenant by their ID"""
    try:
        t = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
        if not t:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tenant not found"
            )
            
        # Convert SQLAlchemy object to dict with primitive types
        return {
            "id": t.id,
            "first_name": t.first_name,
            "last_name": t.last_name,
            "email": t.email,
            "phone": t.phone,
            "status": t.status,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        }
    except Exception as e:
        logger.error(f"Error retrieving tenant {tenant_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error retrieving tenant details"
        )


@router.put("/{tenant_id}", response_model=TenantRead)
def update_tenant(tenant_id: int, payload: TenantCreate, db: Session = Depends(get_db)):
    db_tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if db_tenant is None:
        raise HTTPException(status_code=404, detail="Tenant not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(db_tenant, field, value)

    db.commit()
    db.refresh(db_tenant)
    return {
        "id": db_tenant.id,
        "first_name": db_tenant.first_name,
        "last_name": db_tenant.last_name,
        "email": db_tenant.email,
        "phone": db_tenant.phone,
        "status": db_tenant.status,
        "created_at": db_tenant.created_at.isoformat() if db_tenant.created_at else None,
    }


@router.patch("/{tenant_id}", response_model=TenantRead)
def patch_tenant(tenant_id: int, payload: TenantPatch, db: Session = Depends(get_db)):
    db_tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if db_tenant is None:
        raise HTTPException(status_code=404, detail="Tenant not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        if value is not None and hasattr(db_tenant, field):
            setattr(db_tenant, field, value)

    db.commit()
    db.refresh(db_tenant)
    return {
        "id": db_tenant.id,
        "first_name": db_tenant.first_name,
        "last_name": db_tenant.last_name,
        "email": db_tenant.email,
        "phone": db_tenant.phone,
        "status": db_tenant.status,
        "created_at": db_tenant.created_at.isoformat() if db_tenant.created_at else None,
    }


@router.delete("/{tenant_id}")
def delete_tenant(tenant_id: int, db: Session = Depends(get_db)):
    db_tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if db_tenant is None:
        raise HTTPException(status_code=404, detail="Tenant not found")

    db.delete(db_tenant)
    db.commit()
    return {"message": f"Tenant {tenant_id} deleted successfully"}


@router.post("/{tenant_id}/assign/{property_id}", summary="Approve applicant and assign to property")
def approve_and_assign_tenant(
    tenant_id: int,
    property_id: int,
    db: Session = Depends(get_db)
):
    """Approve an applicant tenant, create an active lease, and mark property rented.
    Returns updated tenant data including property assignment."""
    tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    prop = db.query(PropertyModel).filter(PropertyModel.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    # Basic checks (property availability)
    if prop.status and prop.status.lower() in ["rented", "occupied"]:
        raise HTTPException(status_code=400, detail="Property already rented")

    # Update tenant status to active
    tenant.status = "active"
    # Update property status to rented
    prop.status = "rented"

    # Create lease record
    lease = LeaseModel(
        property_id=prop.id,
        tenant_id=tenant.id,
        start_date=datetime.utcnow().date(),
        end_date=None,
        rent_amount=prop.rent_amount,
        status="active"
    )
    db.add(lease)
    db.commit()
    db.refresh(tenant)
    db.refresh(prop)
    db.refresh(lease)

    return {
        "id": tenant.id,
        "first_name": tenant.first_name,
        "last_name": tenant.last_name,
        "email": tenant.email,
        "phone": tenant.phone,
        "status": tenant.status,
        "property_id": prop.id,
        "created_at": tenant.created_at.isoformat() if tenant.created_at else None,
    }