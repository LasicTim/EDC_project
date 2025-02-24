from datetime import datetime
from typing import Optional, Union

from pydantic import BaseModel

from app.api.schemas.base import BaseSchema


class UserBase(BaseSchema):
    username: str
    email: str
    full_name: str = None
    first_name: str = None
    last_name: str = None
    birth_date: datetime.date = None
    phone_number: str = None
    address: str = None
    city: str = None
    country: str = None


class UserCreate(UserBase):
    username: str
    password: str


class UserUpdate(UserBase):
    username: str = None
    password: str = None


class CompanyBase(BaseSchema):
    name: str
    email: str
    phone_number: str = None
    address: str = None
    city: str = None
    country: str = None


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Union[str, None] = None
