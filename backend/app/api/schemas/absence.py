from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.api.schemas.base import BaseSchema


class AbsenceBase(BaseSchema):
    Reason: str
    DateFrom: Optional[datetime] = None
    DateTo: Optional[datetime] = None
    Comment: Optional[str] = None
    IdWorker: str

class AbsenceBaseWithUserData(BaseSchema):
    Reason: str
    DateFrom: Optional[datetime] = None
    DateTo: Optional[datetime] = None
    Comment: Optional[str] = None
    IdWorker: str
    Username: str


class AbsenceCreate(BaseModel):
    Reason: str
    DateFrom: Optional[datetime] = None
    DateTo: Optional[datetime] = None
    Comment: Optional[str] = None
    IdWorker: str


class AbsenceUpdate(BaseModel):
    Reason: str
    DateFrom: Optional[datetime] = None
    DateTo: Optional[datetime] = None
    Comment: Optional[str] = None
    IdWorker: str
    Id: str

class AbsenceDelete(BaseModel):
    Id: str

class AbsenceGet(BaseModel):
    Id: str

class WorkerAbsenceGet(BaseModel):
    IdWorker: str

class CompanyAbsenceGet(BaseModel):
    Id_user: str

