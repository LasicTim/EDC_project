# this file is for authentication purposes
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api.schemas import schemas
from app.core.auth import Authenticate
from app.core.hashing import verify_password
from app.db.base import get_db
from app.db.models.models import UserModel
from app.exceptions import raise_exception
from fastapi.responses import RedirectResponse

router = APIRouter(
    tags=["Auth"]
)
def hastoken(func):
    def wrapper(*args, **kwargs):
        token = kwargs.get('token')
        if not token:
            return RedirectResponse(url="/token")
        return func(*args, **kwargs)
    return wrapper

@router.post("/token", response_model=schemas.Token)
def login_for_token(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(UserModel).filter(UserModel.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise_exception(status_code=401, detail="Incorrect username or password")
    access_token = Authenticate.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}
