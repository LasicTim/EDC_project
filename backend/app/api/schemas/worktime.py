from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.api.schemas.base import BaseSchema


class WorkTimeBase(BaseSchema):
    WorkType: Optional[str] = None
    BreakTimeFrom: Optional[datetime] = None
    BreakTimeTo: Optional[datetime] = None
    WorkTimeFrom: Optional[datetime] = None
    WorkTimeTo: Optional[datetime] = None
    HasBreakTime: bool
    Comment: Optional[str] = None
    WorkDate: datetime
    PlaceOfWork: Optional[str] = None
    IdWorker: str

class WorkTimeBaseWithUserData(BaseSchema):
    WorkType: Optional[str] = None
    BreakTimeFrom: Optional[datetime] = None
    BreakTimeTo: Optional[datetime] = None
    WorkTimeFrom: Optional[datetime] = None
    WorkTimeTo: Optional[datetime] = None
    HasBreakTime: bool
    Comment: Optional[str] = None
    WorkDate: datetime
    PlaceOfWork: Optional[str] = None
    IdWorker: str
    username: str


class WorkTimeCreate(BaseModel):
    WorkType: Optional[str] = None
    BreakTimeFrom: Optional[datetime] = None
    BreakTimeTo: Optional[datetime] = None
    WorkTimeFrom: Optional[datetime] = None
    WorkTimeTo: Optional[datetime] = None
    HasBreakTime: bool
    Comment: Optional[str] = None
    WorkDate: datetime
    PlaceOfWork: Optional[str] = None
    IdWorker: str


class WorkTimeUpdate(BaseModel):
    WorkType: Optional[str] = None
    BreakTimeFrom: Optional[datetime] = None
    BreakTimeTo: Optional[datetime] = None
    WorkTimeFrom: Optional[datetime] = None
    WorkTimeTo: Optional[datetime] = None
    HasBreakTime: bool
    Comment: Optional[str] = None
    WorkDate: datetime
    PlaceOfWork: Optional[str] = None
    IdWorker: str
    Id: str

class WorkTimeDelete(BaseModel):
    Id: str

class WorkTimeGet(BaseModel):
    Id: str

class WorkerWorkTimeGet(BaseModel):
    IdWorker: str

class CompanyWorkTimeGet(BaseModel):
    Id_user: str

