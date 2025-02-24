from fastapi import APIRouter, Depends
from sqlalchemy import Select
from sqlalchemy.orm import Session

from app.api.routes.auth import hastoken
from app.api.schemas import schemas
from app.core.hashing import hash_password
from app.db.base import get_db
from app.db.models.models import UserModel
from app.exceptions import raise_exception
from app.utils.sql_utils import SqlInsert, SqlExe

router = APIRouter(
    tags=["Users"]
)

@router.post("/create_user", response_model=schemas.UserCreate)
def create_user(user: schemas.UserBase, db: Session = Depends(get_db)) -> UserModel:
    query = Select(
        UserModel.username,
        UserModel.hashed_password
    )
    existing_user = SqlExe(db,query)
    if existing_user:
        raise_exception(status_code=400, detail="User already exists")

    user_model = UserModel(username=user.username, email=user.email, hashed_password=hash_password(user.password))
    user_created = SqlInsert(db, user_model)
    return user_created


@hastoken
@router.post("/get_user", response_model=schemas.UserBase)
def get_user(user: schemas.UserBase, db: Session = Depends(get_db)) -> UserModel:
    query = Select(
        UserModel.username,
        UserModel.email
    )
    query.where(UserModel.username == user.username)
    user_found = SqlExe(db, query)
    if not user_found:
        raise_exception(status_code=404, detail="User not found")
    return user_found