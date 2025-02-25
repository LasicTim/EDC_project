from fastapi import APIRouter, Depends
from sqlalchemy import Select, update
from sqlalchemy.orm import Session

from app.api.schemas import schemas, companies, users
from app.core.auth import Authenticate
from app.core.hashing import hash_password
from app.db.base import get_db
from app.db.models.models import UserModel
from app.exceptions import raise_exception
from app.utils.sql_utils import SqlInsert, SqlExe, SqlExeAndCommit

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.post("/create_user", response_model=users.UserCreate)
def create_user(user: users.GetUser, db: Session = Depends(get_db)) -> UserModel:
    query = Select(
        UserModel.username,
        UserModel.hashed_password
    ).where(UserModel.username == user.username)
    existing_user = SqlExe(db, query)
    if existing_user:  # This means at least one user was found
        raise_exception(status_code=400, detail="User already exists")

    user_model = UserModel(username=user.username, email=user.email, hashed_password=hash_password(user.password))
    user_created = SqlInsert(db, user_model)
    return user_created


@router.post("/get_user", response_model=list[users.GetUser])
def get_user(user: users.UserCreate,
             db: Session = Depends(get_db),
             current_user: UserModel = Depends(Authenticate.get_current_user)) -> UserModel:
    query = Select(
        UserModel.username,
        UserModel.email
    ).where(UserModel.username == user.username)
    user_found = SqlExe(db, query)
    if not user_found:
        raise_exception(status_code=404, detail="User not found")
    return user_found 

@router.post("/update_user", response_model=users.UserCreate)
def update_user(user: users.GetUser,
                db: Session = Depends(get_db),
                current_user: UserModel = Depends(Authenticate.get_current_user)) -> UserModel:
    # Retrieve the existing user using the session's execute method
    query = Select(UserModel).where(UserModel.username == user.username)
    existing_user = db.execute(query).scalar_one_or_none()
    if not existing_user:
        raise_exception(status_code=404, detail="User not found")

    # Prepare the update statement
    update_stmt = (
        update(UserModel)
        .where(UserModel.Id == existing_user.Id)
        .values(
            email=user.email,
        )
        .execution_options(synchronize_session="fetch")
    )
    # Execute the update and commit the transaction
    SqlExeAndCommit(db,update_stmt)

    # Fetch and return the updated user
    updated_user = db.execute(query).scalar_one()
    return updated_user