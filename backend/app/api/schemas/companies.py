from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.api.schemas.base import BaseSchema


class CompanyBase(BaseModel):
    name: str
    email: str
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None

    class Config:
        from_attributes = True

class CompanyCreate(BaseModel):
    name: str
    email: str
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None

class GetCompany(BaseModel):
    name: str
    email: str
    
