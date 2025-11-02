from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict

from ..database import get_db
from ..models.models import Tenant as TenantModel
from ..schemas.schemas import TenantCreate, TenantRead, TenantPatch

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.post("/", response_model=TenantRead)
def create_tenant(payload: TenantCreate, db: Session = Depends(get_db)):
    try:
        db_obj = TenantModel(**payload.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    except Exception:
        import traceback
        tb = traceback.format_exc()
        print("Error in create_tenant:", tb)
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(tb))


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


@router.put("/{tenant_id}", response_model=TenantRead)
def update_tenant(tenant_id: int, payload: TenantCreate, db: Session = Depends(get_db)):
    db_tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if db_tenant is None:
        raise HTTPException(status_code=404, detail="Tenant not found")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(db_tenant, field, value)

    db.commit()
    db.refresh(db_tenant)
    return db_tenant


@router.patch("/{tenant_id}", response_model=TenantRead)
def patch_tenant(tenant_id: int, payload: TenantPatch, db: Session = Depends(get_db)):
    db_tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if db_tenant is None:
        raise HTTPException(status_code=404, detail="Tenant not found")

    for field, value in payload.dict(exclude_unset=True).items():
        if value is not None and hasattr(db_tenant, field):
            setattr(db_tenant, field, value)

    db.commit()
    db.refresh(db_tenant)
    return db_tenant


@router.delete("/{tenant_id}")
def delete_tenant(tenant_id: int, db: Session = Depends(get_db)):
    db_tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if db_tenant is None:
        raise HTTPException(status_code=404, detail="Tenant not found")

    db.delete(db_tenant)
    db.commit()
    return {"message": f"Tenant {tenant_id} deleted successfully"}
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict

from ..database import get_db
from ..models.models import Tenant as TenantModel
from ..schemas.schemas import TenantCreate, TenantRead

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.post("/", response_model=TenantRead)
def create_tenant(payload: TenantCreate, db: Session = Depends(get_db)):
    db_obj = TenantModel(**payload.dict())
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


@router.put("/{tenant_id}", response_model=TenantRead)
def update_tenant(tenant_id: int, payload: TenantCreate, db: Session = Depends(get_db)):
    db_tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if db_tenant is None:
        raise HTTPException(status_code=404, detail="Tenant not found")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(db_tenant, field, value)

    db.commit()
    db.refresh(db_tenant)
    return db_tenant


@router.patch("/{tenant_id}", response_model=TenantRead)
def patch_tenant(tenant_id: int, payload: Dict[str, object], db: Session = Depends(get_db)):
    db_tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if db_tenant is None:
        raise HTTPException(status_code=404, detail="Tenant not found")

    for field, value in payload.items():
        if hasattr(db_tenant, field):
            setattr(db_tenant, field, value)

    db.commit()
    db.refresh(db_tenant)
    return db_tenant


@router.delete("/{tenant_id}")
def delete_tenant(tenant_id: int, db: Session = Depends(get_db)):
    db_tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if db_tenant is None:
        raise HTTPException(status_code=404, detail="Tenant not found")

    db.delete(db_tenant)
    db.commit()
    return {"message": f"Tenant {tenant_id} deleted successfully"}
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict

from ..database import get_db
from ..models.models import Tenant as TenantModel
from ..schemas.schemas import TenantCreate, TenantRead

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.post("/", response_model=TenantRead)
def create_tenant(payload: TenantCreate, db: Session = Depends(get_db)):
    db_obj = TenantModel(**payload.dict())
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


@router.put("/{tenant_id}", response_model=TenantRead)
def update_tenant(tenant_id: int, payload: TenantCreate, db: Session = Depends(get_db)):
    db_tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if db_tenant is None:
        raise HTTPException(status_code=404, detail="Tenant not found")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(db_tenant, field, value)

    db.commit()
    db.refresh(db_tenant)
    return db_tenant


@router.patch("/{tenant_id}", response_model=TenantRead)
def patch_tenant(tenant_id: int, payload: Dict[str, object], db: Session = Depends(get_db)):
    db_tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if db_tenant is None:
        raise HTTPException(status_code=404, detail="Tenant not found")

    for field, value in payload.items():
        if hasattr(db_tenant, field):
            setattr(db_tenant, field, value)

    db.commit()
    db.refresh(db_tenant)
    return db_tenant


@router.delete("/{tenant_id}")
def delete_tenant(tenant_id: int, db: Session = Depends(get_db)):
    db_tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if db_tenant is None:
        raise HTTPException(status_code=404, detail="Tenant not found")

    db.delete(db_tenant)
    db.commit()
    return {"message": f"Tenant {tenant_id} deleted successfully"}
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict

from ..database import get_db
from ..models.models import Tenant as TenantModel
from ..schemas.schemas import TenantCreate, TenantRead

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.post("/", response_model=TenantRead)
def create_tenant(payload: TenantCreate, db: Session = Depends(get_db)):
    db_obj = TenantModel(**payload.dict())
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


@router.put("/{tenant_id}", response_model=TenantRead)
def update_tenant(tenant_id: int, payload: TenantCreate, db: Session = Depends(get_db)):
    db_tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if db_tenant is None:
        raise HTTPException(status_code=404, detail="Tenant not found")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(db_tenant, field, value)

    db.commit()
    db.refresh(db_tenant)
    return db_tenant


@router.patch("/{tenant_id}", response_model=TenantRead)
def patch_tenant(tenant_id: int, payload: Dict[str, object], db: Session = Depends(get_db)):
    db_tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if db_tenant is None:
        raise HTTPException(status_code=404, detail="Tenant not found")

    for field, value in payload.items():
        if hasattr(db_tenant, field):
            setattr(db_tenant, field, value)

    db.commit()
    db.refresh(db_tenant)
    return db_tenant


@router.delete("/{tenant_id}")
def delete_tenant(tenant_id: int, db: Session = Depends(get_db)):
    db_tenant = db.query(TenantModel).filter(TenantModel.id == tenant_id).first()
    if db_tenant is None:
        raise HTTPException(status_code=404, detail="Tenant not found")

    db.delete(db_tenant)
    db.commit()
    return {"message": f"Tenant {tenant_id} deleted successfully"}