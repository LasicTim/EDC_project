from datetime import timedelta
from typing import Optional, Annotated

import jwt
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jwt import PyJWTError, InvalidTokenError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.base import get_db
from app.exceptions import raise_401_exception
from app.utils.time import current_datetime
from ..db.models.models import UserModel


class Authenticate:

    SECRET_KEY = settings.secret_key
    ALGORITHM = settings.algorithm
    ACCESS_TOKEN_EXPIRE_MINUTES = timedelta(minutes=int(settings.access_token_expire_minutes))
    oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

    @classmethod
    def create_access_token(cls, data: dict, expires_delta: Optional[timedelta] = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
        to_encode = data.copy()
        expire = current_datetime() + expires_delta
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, cls.SECRET_KEY, algorithm=cls.ALGORITHM)
        return encoded_jwt

    @classmethod
    def refresh_access_token(cls, token: Annotated[str, Depends(oauth2_scheme)]) -> str:
        try:
            payload = jwt.decode(token, cls.SECRET_KEY, algorithms=[cls.ALGORITHM])
            username = payload.get("sub")
            if username is None:
                raise_401_exception()
        except PyJWTError:
            raise_401_exception()
        return cls.create_access_token(data={"sub": username})

    @classmethod
    def get_current_user(cls, token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
        try:
            payload = jwt.decode(token, cls.SECRET_KEY, algorithms=[cls.ALGORITHM])
            username = payload.get("sub")
            if username is None:
                raise_401_exception()
        except PyJWTError:
            raise_401_exception()
        user = db.query(UserModel).filter(UserModel.username == username).first()
        if user is None:
            raise_401_exception()
        return user
