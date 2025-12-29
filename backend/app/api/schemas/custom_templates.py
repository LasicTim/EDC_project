from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.api.schemas.base import BaseSchema


class CustomTemplatesBase(BaseSchema):
    title: str
    content: str
    IdWorker: str

class CustomTemplateWithUserData(BaseSchema):
    title: str
    content: str
    IdWorker: str
    username: str


class CustomTemplateCreate(BaseModel):
    title: str
    content: str
    IdWorker: str


class CustomTemplateUpdate(BaseModel):
    title: str
    content: str
    IdWorker: str
    Id: str

class CustomTemplateDelete(BaseModel):
    Id: str

class CustomTemplateGet(BaseModel):
    Id: str

class WorkerCustomTemplateGet(BaseModel):
    IdWorker: str

