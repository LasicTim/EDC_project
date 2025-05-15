from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.api.schemas.base import BaseSchema


class VacationBase(BaseSchema):
    DateFrom: Optional[datetime] = None
    DateTo: Optional[datetime] = None
    Comment: Optional[str] = None
    IdWorker: str

class VacationBaseWithUserData(BaseSchema):
    DateFrom: Optional[datetime] = None
    DateTo: Optional[datetime] = None
    Comment: Optional[str] = None
    IdWorker: str
    Username: str


class VacationCreate(BaseModel):
    DateFrom: Optional[datetime] = None
    DateTo: Optional[datetime] = None
    Comment: Optional[str] = None
    IdWorker: str


class VacationUpdate(BaseModel):
    DateFrom: Optional[datetime] = None
    DateTo: Optional[datetime] = None
    Comment: Optional[str] = None
    IdWorker: str
    Id: str

class VacationDelete(BaseModel):
    Id: str

class VacationGet(BaseModel):
    Id: str

class WorkerVacationGet(BaseModel):
    IdWorker: str

class CompanyVacationGet(BaseModel):
    Id_user: str

