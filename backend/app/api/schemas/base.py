from datetime import datetime

from pydantic import BaseModel


class BaseSchema(BaseModel):
    Id: str
    DateCreated: datetime
    DateChanged: datetime
    Active: bool

    class Config:
        arbitrary_types_allowed = True
        from_attributes = True
