from datetime import datetime

from fastapi import APIRouter, Depends
from fastapi.openapi.models import Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import Select, and_, update
from sqlalchemy.orm import Session, joinedload, aliased

from app.api.schemas import schemas, companies, users, vacation
from app.core.auth import Authenticate
from app.core.hashing import hash_password, verify_password
from app.db.base import get_db
from app.db.models.models import UserModel, CompanyModel, VacationModel
from app.exceptions import raise_exception
from app.utils.sql_utils import SqlInsert, SqlExe, SqlExeAndCommit, SqlExeWithMapping
from app.utils.time import current_datetime, convert_to_utc_datetime, convert_utc_to_local

router = APIRouter(
    prefix="/vacation",
    tags=["vacation"],
)


@router.post("/create_vacation", response_model=vacation.VacationCreate)
def create_vacation(vacation_: vacation.VacationCreate,
                  db: Session = Depends(get_db),
                  current_user: UserModel = Depends(Authenticate.get_current_user)) -> VacationModel:

    vacation_model = VacationModel(
        DateFrom=convert_utc_to_local(vacation_.DateFrom,2),
        DateTo=convert_utc_to_local(vacation_.DateTo,2),
        Comment=vacation_.Comment,
        IdWorker = vacation_.IdWorker,
        )
    vacation_created = SqlInsert(db, vacation_model)

    return vacation_created


@router.post("/get_vacation", response_model=list[vacation.VacationBase])
def get_vacation(vacation_: vacation.VacationGet,
             db: Session = Depends(get_db),
             current_user: UserModel = Depends(Authenticate.get_current_user)) -> VacationModel:
    query = Select(
        *VacationModel.__table__.columns
    ).where(and_(VacationModel.Id == vacation_.Id, VacationModel.Active == True))
    vacation_found = SqlExe(db, query)
    if not vacation_found:
        raise_exception(status_code=404, detail="vacation not found")
    return vacation_found


@router.post("/get_workers_vacation", response_model=list[vacation.VacationBase])
def get_workers_vacation(vacation_: vacation.WorkerVacationGet,
                db: Session = Depends(get_db),
                current_user: UserModel = Depends(Authenticate.get_current_user)) -> VacationModel:
    query = Select(*VacationModel.__table__.columns).where(
        and_(VacationModel.IdWorker == vacation_.IdWorker, VacationModel.Active == True)
    )
    vacation_found = SqlExe(db, query)
    if not vacation_found:
        raise_exception(status_code=404, detail="User not found")
    return vacation_found

@router.post("/get_company_workers_vacations", response_model=list[vacation.VacationBaseWithUserData])
def get_company_workers_vacations(vacation_: vacation.CompanyVacationGet,
                db: Session = Depends(get_db),
                current_user: UserModel = Depends(Authenticate.get_current_user)) -> VacationModel:
    CompanyUserAlias = aliased(UserModel)
    query = (Select(*VacationModel.__table__.columns,UserModel.username.label("Username"))
    .outerjoin(UserModel, UserModel.Id == VacationModel.IdWorker)
    .outerjoin(CompanyUserAlias, CompanyUserAlias.Id == vacation_.Id_user)
    .where(
        and_(UserModel.IdCompany == CompanyUserAlias.IdCompany,
             VacationModel.Active == True,
             UserModel.Active == True,
             CompanyUserAlias.Active == True)
    ))
    vacation_found = SqlExe(db, query)
    return vacation_found


@router.post("/update_vacation", response_model=vacation.VacationUpdate)
def update_vacation(vacation_: vacation.VacationUpdate,
                db: Session = Depends(get_db),
                current_user: UserModel = Depends(Authenticate.get_current_user)) -> UserModel:
    # Retrieve the existing user using the session's execute method
    query = Select(VacationModel).where(and_(VacationModel.Id == vacation_.Id, VacationModel.Active == True))
    existing_vacation = db.execute(query).scalar_one_or_none()
    if not existing_vacation:
        raise_exception(status_code=404, detail="Worktime not found")

    # Prepare the update statement
    update_stmt = (
        update(VacationModel)
        .where(VacationModel.Id == vacation_.Id)
        .values(
            DateFrom=convert_utc_to_local(vacation_.DateFrom, 2),
            DateTo=convert_utc_to_local(vacation_.DateTo, 2),
            Comment=vacation_.Comment,
            IdWorker=vacation_.IdWorker,
        )
        .execution_options(synchronize_session="fetch")
    )
    # Execute the update and commit the transaction
    SqlExeAndCommit(db,update_stmt)

    # Fetch and return the updated user
    updated_user = db.execute(query).scalar_one()
    return updated_user





@router.post("/delete_vacation", response_model=vacation.VacationBase)
def delete_vacation(vacation_: vacation.VacationDelete,
                db: Session = Depends(get_db),
                current_user: UserModel = Depends(Authenticate.get_current_user)) -> VacationModel:
    # Retrieve the existing user using the session's execute method
    query = Select(VacationModel).where(and_(VacationModel.Id == vacation_.Id, VacationModel.Active == True))
    existing_vacation = db.execute(query).scalar_one_or_none()
    if not existing_vacation:
        raise_exception(status_code=404, detail="User not found")


    # Prepare the update statement
    update_stmt = (
        update(VacationModel)
        .where(VacationModel.Id == existing_vacation.Id)
        .values(
            Active=False,
        )
        .execution_options(synchronize_session="fetch")
    )
    # Execute the update and commit the transaction
    SqlExeAndCommit(db,update_stmt)

    # Fetch and return the updated vacation
    query = Select(VacationModel).where(and_(VacationModel.Id == vacation_.Id))
    updated_vacation = db.execute(query).scalar_one()
    return updated_vacation