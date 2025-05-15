from datetime import datetime

from fastapi import APIRouter, Depends
from fastapi.openapi.models import Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import Select, and_, update
from sqlalchemy.orm import Session, joinedload, aliased

from app.api.schemas import schemas, companies, users, absence
from app.core.auth import Authenticate
from app.core.hashing import hash_password, verify_password
from app.db.base import get_db
from app.db.models.models import UserModel, CompanyModel, AbsenceModel
from app.exceptions import raise_exception
from app.utils.sql_utils import SqlInsert, SqlExe, SqlExeAndCommit, SqlExeWithMapping
from app.utils.time import current_datetime, convert_to_utc_datetime, convert_utc_to_local

router = APIRouter(
    prefix="/absence",
    tags=["absence"],
)


@router.post("/create_absence", response_model=absence.AbsenceCreate)
def create_absence(absence_: absence.AbsenceCreate,
                  db: Session = Depends(get_db),
                  current_user: UserModel = Depends(Authenticate.get_current_user)) -> AbsenceModel:

    absence_model = AbsenceModel(
        Reason=absence_.Reason,
        DateFrom=convert_utc_to_local(absence_.DateFrom,2),
        DateTo=convert_utc_to_local(absence_.DateTo,2),
        Comment=absence_.Comment,
        IdWorker = absence_.IdWorker,
        )
    absence_created = SqlInsert(db, absence_model)
    return absence_created


@router.post("/get_absence", response_model=list[absence.AbsenceBase])
def get_absence(absence_: absence.AbsenceGet,
             db: Session = Depends(get_db),
             current_user: UserModel = Depends(Authenticate.get_current_user)) -> AbsenceModel:
    query = Select(
        *AbsenceModel.__table__.columns
    ).where(and_(AbsenceModel.Id == absence_.Id, AbsenceModel.Active == True))
    absence_found = SqlExe(db, query)
    if not absence_found:
        raise_exception(status_code=404, detail="Absence not found")
    return absence_found


@router.post("/get_workers_absence", response_model=list[absence.AbsenceBase])
def get_workers_absence(absence_: absence.WorkerAbsenceGet,
                db: Session = Depends(get_db),
                current_user: UserModel = Depends(Authenticate.get_current_user)) -> AbsenceModel:
    query = Select(*AbsenceModel.__table__.columns).where(
        and_(AbsenceModel.IdWorker == absence_.IdWorker, AbsenceModel.Active == True)
    )
    absence_found = SqlExe(db, query)
    if not absence_found:
        raise_exception(status_code=404, detail="User not found")
    return absence_found

@router.post("/get_company_workers_absences", response_model=list[absence.AbsenceBaseWithUserData])
def get_company_workers_absences(absence_: absence.CompanyAbsenceGet,
                db: Session = Depends(get_db),
                current_user: UserModel = Depends(Authenticate.get_current_user)) -> AbsenceModel:
    CompanyUserAlias = aliased(UserModel)
    query = (Select(*AbsenceModel.__table__.columns,UserModel.username.label("Username"))
    .outerjoin(UserModel, UserModel.Id == AbsenceModel.IdWorker)
    .outerjoin(CompanyUserAlias, CompanyUserAlias.Id == absence_.Id_user)
    .where(
        and_(UserModel.IdCompany == CompanyUserAlias.IdCompany,
             AbsenceModel.Active == True,
             UserModel.Active == True,
             CompanyUserAlias.Active == True)
    ))
    absence_found = SqlExe(db, query)
    return absence_found


@router.post("/update_absence", response_model=absence.AbsenceUpdate)
def update_absence(absence_: absence.AbsenceUpdate,
                db: Session = Depends(get_db),
                current_user: UserModel = Depends(Authenticate.get_current_user)) -> UserModel:
    # Retrieve the existing user using the session's execute method
    query = Select(AbsenceModel).where(and_(AbsenceModel.Id == absence_.Id, AbsenceModel.Active == True))
    existing_absence = db.execute(query).scalar_one_or_none()
    if not existing_absence:
        raise_exception(status_code=404, detail="Worktime not found")

    # Prepare the update statement
    update_stmt = (
        update(AbsenceModel)
        .where(AbsenceModel.Id == absence_.Id)
        .values(
            Reason=absence_.Reason,
            DateFrom=convert_utc_to_local(absence_.DateFrom, 2),
            DateTo=convert_utc_to_local(absence_.DateTo, 2),
            Comment=absence_.Comment,
            IdWorker=absence_.IdWorker,
        )
        .execution_options(synchronize_session="fetch")
    )
    # Execute the update and commit the transaction
    SqlExeAndCommit(db,update_stmt)

    # Fetch and return the updated user
    updated_user = db.execute(query).scalar_one()
    return updated_user





@router.post("/delete_absence", response_model=absence.AbsenceBase)
def delete_absence(absence_: absence.AbsenceDelete,
                db: Session = Depends(get_db),
                current_user: UserModel = Depends(Authenticate.get_current_user)) -> AbsenceModel:
    # Retrieve the existing user using the session's execute method
    query = Select(AbsenceModel).where(and_(AbsenceModel.Id == absence_.Id, AbsenceModel.Active == True))
    existing_absence = db.execute(query).scalar_one_or_none()
    if not existing_absence:
        raise_exception(status_code=404, detail="User not found")


    # Prepare the update statement
    update_stmt = (
        update(AbsenceModel)
        .where(AbsenceModel.Id == existing_absence.Id)
        .values(
            Active=False,
        )
        .execution_options(synchronize_session="fetch")
    )
    # Execute the update and commit the transaction
    SqlExeAndCommit(db,update_stmt)

    # Fetch and return the updated absence
    query = Select(AbsenceModel).where(and_(AbsenceModel.Id == absence_.Id))
    updated_absence = db.execute(query).scalar_one()
    return updated_absence