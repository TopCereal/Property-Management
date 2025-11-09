from pydantic import BaseModel, Field, AliasChoices
from pydantic import ConfigDict
from typing import Optional
from decimal import Decimal
from datetime import datetime


class PropertyBase(BaseModel):
    # Accept both backend and UI field names via validation aliases
    address: str = Field(validation_alias=AliasChoices("address", "lotNumber"))
    bedrooms: Optional[int] = Field(default=None, validation_alias=AliasChoices("bedrooms", "beds"))
    bathrooms: Optional[float] = Field(default=None, validation_alias=AliasChoices("bathrooms", "baths"))
    area: Optional[float] = Field(default=None, validation_alias=AliasChoices("area", "sqft"))
    rent_amount: Optional[Decimal] = Field(default=None, validation_alias=AliasChoices("rent_amount", "rent"))
    status: Optional[str] = None
    amenities: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(extra='ignore', populate_by_name=True)


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
    amenities: Optional[str] = None
    notes: Optional[str] = None


class PropertyRead(PropertyBase):
    id: int
    created_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


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

    model_config = ConfigDict(from_attributes=True)

