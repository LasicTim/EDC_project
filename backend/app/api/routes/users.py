import json
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import Select, and_, update
from sqlalchemy.orm import Session

from app.api.schemas import  users
from app.core.auth import Authenticate
from app.core.hashing import hash_password
from app.db.base import get_db
from app.db.models.models import UserModel, CompanyModel
from app.exceptions import raise_exception
from app.utils.sql_utils import SqlInsert, SqlExe, SqlExeAndCommit
from app.utils.email import is_valid_email, is_valid_password
from app.utils.time import current_datetime, convert_utc_to_local

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.post("/create_user", response_model=users.UserNormalResponse)
def create_user(user: users.GetUser, db: Session = Depends(get_db)) -> UserModel:
    query = Select(
        UserModel.username,
        UserModel.hashed_password
    ).where(and_(UserModel.username == user.username, UserModel.Active == True))
    existing_user = SqlExe(db, query)
    # This means at least one user was found
    if existing_user or not is_valid_email(user.email) or not is_valid_password(user.password):
        raise_exception(status_code=400, detail="User already exists")

    user_model = UserModel(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        is_superuser=True
    )
    user_created = SqlInsert(db, user_model)
    return user_created

@router.post("/create_worker", response_model=users.UserNormalResponse)
def create_worker(user: users.WorkerCreate,
                  db: Session = Depends(get_db),
                  current_user: UserModel = Depends(Authenticate.get_current_user)) -> UserModel:
    query = Select(
        UserModel.username,
        UserModel.hashed_password
    ).where(and_(UserModel.username == user.username, UserModel.Active == True))
    existing_user = SqlExe(db, query)
    if existing_user or not is_valid_email(user.email):  # This means at least one user was found
        raise_exception(status_code=400, detail="User already exists")
    password = user.password
    if not password:
        password = 'geslo123@'

    user_model = UserModel(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(password),
        DateChanged = current_datetime(),
        DateCreated = current_datetime(),
        first_name = user.first_name,
        last_name = user.last_name,
        birth_date = user.birth_date,
        phone_number = user.phone_number,
        address = user.address,
        city = user.city,
        country = user.country,
        IdCompany = current_user.IdCompany,
        vacation_criteria = user.vacation_criteria
        )
    user_created = SqlInsert(db, user_model)
    return user_created


@router.post("/get_user", response_model=list[users.GetUser])
def get_user(user: users.UserNormalResponse,
             db: Session = Depends(get_db),
             current_user: UserModel = Depends(Authenticate.get_current_user)) -> UserModel:
    query = Select(
        UserModel.username,
        UserModel.email
    ).where(and_(UserModel.username == user.username, UserModel.Active == True))
    user_found = SqlExe(db, query)
    if not user_found:
        raise_exception(status_code=404, detail="User not found")
    return user_found

@router.post("/get_user_with_company", response_model=list[users.GeUserWithCompanyData])
def get_user_with_company(user: users.UserNormalResponse,
                          db: Session = Depends(get_db),
                          current_user: UserModel = Depends(Authenticate.get_current_user)) -> UserModel:
    query = (Select(
        UserModel.username,
        UserModel.email,
        CompanyModel.name.label("companyName"),
        CompanyModel.email.label("companyEmail")
    )
             .outerjoin(CompanyModel, CompanyModel.Id == UserModel.IdCompany)
             .where(and_(UserModel.username == user.username, UserModel.Active == True, CompanyModel.Active == True)))
    user_found = SqlExe(db,query)
    if not user_found:
        raise_exception(status_code=404, detail="User not found")
    return user_found

@router.post("/update_user", response_model=users.UserBase)
def update_user(user: users.UserBase,
                db: Session = Depends(get_db),
                current_user: UserModel = Depends(Authenticate.get_current_user)) -> UserModel:
    # Retrieve the existing user using the session's execute method
    query = Select(UserModel).where(and_(UserModel.Id == user.Id, UserModel.Active == True))
    existing_user = db.execute(query).scalar_one_or_none()
    if not existing_user or not is_valid_email(user.email):
        raise_exception(status_code=404, detail="User not found")

    if user.birth_date:
        user.birth_date = convert_utc_to_local(user.birth_date,2)
    # Prepare the update statement
    update_stmt = (
        update(UserModel)
        .where(UserModel.Id == existing_user.Id)
        .values(
            username=user.username,
            email=user.email,
            DateChanged=current_datetime(),
            first_name =user.first_name,
            last_name=user.last_name,
            birth_date=user.birth_date,
            phone_number=user.phone_number,
            address=user.address,
            city=user.city,
            country=user.country,
            IdCompany=user.IdCompany
        )
        .execution_options(synchronize_session="fetch")
    )
    # Execute the update and commit the transaction
    SqlExeAndCommit(db,update_stmt)

    # Fetch and return the updated user
    updated_user = db.execute(query).scalar_one()
    return updated_user

@router.post("/update_worker", response_model=users.WorkerUpdate)
def update_worker(user: users.WorkerUpdate,
                db: Session = Depends(get_db),
                current_user: UserModel = Depends(Authenticate.get_current_user)) -> UserModel:
    # Retrieve the existing user using the session's execute method
    query = Select(UserModel).where(and_(UserModel.Id == user.Id, UserModel.Active == True))
    existing_user = db.execute(query).scalar_one_or_none()
    if not existing_user or not is_valid_email(user.email):
        raise_exception(status_code=404, detail="User not found")

    if user.birth_date:
        user.birth_date = convert_utc_to_local(user.birth_date,2)
    # Prepare the update statement
    update_stmt = (
        update(UserModel)
        .where(UserModel.Id == existing_user.Id)
        .values(
            username=user.username,
            email=user.email,
            DateChanged=current_datetime(),
            first_name =user.first_name,
            last_name=user.last_name,
            birth_date=user.birth_date,
            phone_number=user.phone_number,
            address=user.address,
            city=user.city,
            country=user.country,
            IdCompany=current_user.IdCompany,
            vacation_criteria=json.dumps(user.vacation_criteria.model_dump()) if user.vacation_criteria else None
        )
        .execution_options(synchronize_session="fetch")
    )
    # Execute the update and commit the transaction
    SqlExeAndCommit(db,update_stmt)

    # Fetch and return the updated user
    updated_user = db.execute(query).scalar_one()
    if updated_user.vacation_criteria:
        try:
            updated_user.vacation_criteria = json.loads(updated_user.vacation_criteria)
        except json.JSONDecodeError:
            updated_user.vacation_criteria = None

    return updated_user



@router.post("/get_user_data", response_model=list[users.UserBase])
def get_user_data(user: users.RequestUser,
                db: Session = Depends(get_db),
                current_user: UserModel = Depends(Authenticate.get_current_user)) -> UserModel:
    query = Select(*UserModel.__table__.columns).where(
        and_(UserModel.Id == user.Id, UserModel.Active == True)
    )
    user_found = SqlExe(db, query)
    if not user_found:
        raise_exception(status_code=404, detail="User not found")

    if user_found and user_found[0].get("vacation_criteria"):
        try:
            user_found[0]["vacation_criteria"] = json.loads(user_found[0]["vacation_criteria"])
        except json.JSONDecodeError:
            user_found[0]["vacation_criteria"] = None
    return user_found


@router.post("/delete_user", response_model=users.UserBase)
def delete_user(user: users.RequestUser,
                db: Session = Depends(get_db),
                current_user: UserModel = Depends(Authenticate.get_current_user)) -> UserModel:
    # Retrieve the existing user using the session's execute method
    query = Select(UserModel).where(and_(UserModel.Id == user.Id, UserModel.Active == True))
    existing_user = db.execute(query).scalar_one_or_none()
    if not existing_user:
        raise_exception(status_code=404, detail="User not found")


    # Prepare the update statement
    update_stmt = (
        update(UserModel)
        .where(UserModel.Id == existing_user.Id)
        .values(
            Active=False,
        )
        .execution_options(synchronize_session="fetch")
    )
    # Execute the update and commit the transaction
    SqlExeAndCommit(db,update_stmt)

    # Fetch and return the updated user
    query = Select(UserModel).where(and_(UserModel.Id == user.Id))
    updated_user = db.execute(query).scalar_one()
    return updated_user