from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.api.schemas.base import BaseSchema
from app.api.schemas.companies import CompanyBase


class UserBase(BaseSchema):
    username: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birth_date: Optional[datetime] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    IdCompany: Optional[str] = None


class UserCreate(BaseModel):
    username: str
    IdCompany: Optional[str] = None

class WorkerCreate(BaseModel):
    username: str
    email: str
    password: Optional[str] = 'geslo123@'
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birth_date: Optional[datetime] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    IdCompany: Optional[str] = None



class UserUpdate(BaseSchema):
    username: Optional[str] = None


class GetUser(BaseModel):
    username: str
    email: str
    password: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    birth_date: Optional[datetime] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    IdCompany: Optional[str] = None
    company: CompanyBase | None = None
    
    class Config:
        from_attributes = True

class GeUserWithCompanyData(BaseModel):
    username: str
    email: str
    companyName: str
    companyEmail: str

class RequestUser(BaseModel):
    Id: str

class ResponseCompanyUser(BaseModel):
    Id: str
    username: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
