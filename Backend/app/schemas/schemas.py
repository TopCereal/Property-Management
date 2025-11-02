from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from datetime import datetime


class PropertyBase(BaseModel):
    address: str
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    area: Optional[float] = None
    rent_amount: Optional[Decimal] = None
    status: Optional[str] = None


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(PropertyBase):
    pass


class PropertyPatch(BaseModel):
    address: Optional[str] = None
    bedrooms: Optional[int] = None
    bathrooms: Optional[float] = None
    area: Optional[float] = None
    rent_amount: Optional[Decimal] = None
    status: Optional[str] = None


class PropertyRead(PropertyBase):
    id: int
    created_at: Optional[datetime]

    class Config:
        orm_mode = True


class TenantBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None


class TenantCreate(TenantBase):
    pass


class TenantUpdate(TenantBase):
    pass


class TenantPatch(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None


class TenantRead(TenantBase):
    id: int
    created_at: Optional[datetime]

    class Config:
        orm_mode = True

