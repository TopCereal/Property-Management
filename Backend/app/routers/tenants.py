from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import Tenant as TenantModel
from app.schemas.schemas import TenantCreate, TenantRead

router = APIRouter(prefix="/tenants", tags=["tenants"])

@router.post("/", response_model=TenantRead)
def create_tenant(payload: TenantCreate, db: Session = Depends(get_db)):
    db_obj = TenantModel(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        phone=payload.phone,
        status=payload.status
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/", response_model=List[TenantRead])
def list_tenants(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tenants = db.query(TenantModel).offset(skip).limit(limit).all()
    return tenants

@router.get("/{tenant_id}", response_model=TenantRead)
def get_tenant(tenant_id: int, db: Session = Depends(get_db)):
    t = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return t