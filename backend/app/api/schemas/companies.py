from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.api.schemas.base import BaseSchema


class CompanyBase(BaseSchema):
    name: str
    email: str
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None

class GetCompanyBase(BaseModel):
    name: str
    email: str
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None

class CompanyCreate(BaseModel):
    name: str
    address: str
    email: str
    IdUser: Optional[str] = None
    phone_number: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None

class Company(BaseModel):
    name: str
    address: str
    phone_number: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None

class GetCompany(BaseModel):
    IdUser: str

class RequestCompany(BaseModel):
    Id: str

