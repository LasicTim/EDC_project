from datetime import datetime

from fastapi import APIRouter, Depends
from fastapi.openapi.models import Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import Select, and_, update
from sqlalchemy.orm import Session, joinedload, aliased

from app.api.schemas import schemas, companies, users, worktime
from app.core.auth import Authenticate
from app.core.hashing import hash_password, verify_password
from app.db.base import get_db
from app.db.models.models import UserModel, CompanyModel, WorkTimeModel
from app.exceptions import raise_exception
from app.utils.sql_utils import SqlInsert, SqlExe, SqlExeAndCommit, SqlExeWithMapping
from app.utils.time import current_datetime, convert_to_utc_datetime, convert_utc_to_local

router = APIRouter(
    prefix="/worktime",
    tags=["worktime"],
)


@router.post("/create_worktime", response_model=worktime.WorkTimeCreate)
def create_worktime(work_time: worktime.WorkTimeCreate,
                  db: Session = Depends(get_db),
                  current_user: UserModel = Depends(Authenticate.get_current_user)) -> WorkTimeModel:

    worktime_model = WorkTimeModel(
        WorkType=work_time.WorkType,
        BreakTimeFrom=convert_utc_to_local(work_time.BreakTimeFrom,2),
        BreakTimeTo=convert_utc_to_local(work_time.BreakTimeTo,2),
        WorkTimeFrom=convert_utc_to_local(work_time.WorkTimeFrom,2),
        WorkTimeTo=convert_utc_to_local(work_time.WorkTimeTo,2),
        HasBreakTime = work_time.HasBreakTime,
        DateCreated = current_datetime(),
        DateChanged = current_datetime(),
        Comment = work_time.Comment,
        WorkDate = convert_utc_to_local(work_time.WorkDate,2),
        PlaceOfWork = work_time.PlaceOfWork,
        IdWorker = work_time.IdWorker,
        )
    worktime_created = SqlInsert(db, worktime_model)
    return worktime_created


@router.post("/get_worktime", response_model=list[worktime.WorkTimeBase])
def get_worktime(work_time: worktime.WorkTimeGet,
             db: Session = Depends(get_db),
             current_user: UserModel = Depends(Authenticate.get_current_user)) -> WorkTimeModel:
    query = Select(
        *WorkTimeModel.__table__.columns
    ).where(and_(WorkTimeModel.Id == work_time.Id, WorkTimeModel.Active == True))
    worktime_found = SqlExe(db, query)
    if not worktime_found:
        raise_exception(status_code=404, detail="WorkTime not found")
    return worktime_found


@router.post("/get_workers_worktime", response_model=list[worktime.WorkTimeBase])
def get_workers_worktime(work_time: worktime.WorkerWorkTimeGet,
                db: Session = Depends(get_db),
                current_user: UserModel = Depends(Authenticate.get_current_user)) -> WorkTimeModel:
    query = Select(*WorkTimeModel.__table__.columns).where(
        and_(WorkTimeModel.IdWorker == work_time.IdWorker, WorkTimeModel.Active == True)
    )
    worktime_found = SqlExe(db, query)
    if not worktime_found:
        raise_exception(status_code=404, detail="User not found")
    return worktime_found

@router.post("/get_company_workers_worktime", response_model=list[worktime.WorkTimeBaseWithUserData])
def get_company_workers_worktime(work_time: worktime.CompanyWorkTimeGet,
                db: Session = Depends(get_db),
                current_user: UserModel = Depends(Authenticate.get_current_user)) -> WorkTimeModel:
    CompanyUserAlias = aliased(UserModel)
    query = (Select(*WorkTimeModel.__table__.columns,UserModel.username)
    .outerjoin(UserModel, UserModel.Id == WorkTimeModel.IdWorker)
    .outerjoin(CompanyUserAlias, CompanyUserAlias.Id == work_time.Id_user)
    .where(
        and_(UserModel.IdCompany == CompanyUserAlias.IdCompany,
             WorkTimeModel.Active == True,
             UserModel.Active == True,
             CompanyUserAlias.Active == True)
    ))
    worktime_found = SqlExe(db, query)
    return worktime_found


@router.post("/update_worktime", response_model=worktime.WorkTimeUpdate)
def update_worktime(work_time: worktime.WorkTimeUpdate,
                db: Session = Depends(get_db),
                current_user: UserModel = Depends(Authenticate.get_current_user)) -> UserModel:
    # Retrieve the existing user using the session's execute method
    query = Select(WorkTimeModel).where(and_(WorkTimeModel.Id == work_time.Id, WorkTimeModel.Active == True))
    existing_worktime = db.execute(query).scalar_one_or_none()
    if not existing_worktime:
        raise_exception(status_code=404, detail="Worktime not found")

    # Prepare the update statement
    update_stmt = (
        update(WorkTimeModel)
        .where(WorkTimeModel.Id == work_time.Id)
        .values(
            WorkType=work_time.WorkType,
            BreakTimeFrom=convert_utc_to_local(work_time.BreakTimeFrom,2),
            BreakTimeTo=convert_utc_to_local(work_time.BreakTimeTo,2),
            WorkTimeFrom=convert_utc_to_local(work_time.WorkTimeFrom,2),
            WorkTimeTo=convert_utc_to_local(work_time.WorkTimeTo,2),
            HasBreakTime=work_time.HasBreakTime,
            DateChanged=current_datetime(),
            Comment=work_time.Comment,
            WorkDate=convert_utc_to_local(work_time.WorkDate,2),
            PlaceOfWork=work_time.PlaceOfWork,
            IdWorker=work_time.IdWorker,
        )
        .execution_options(synchronize_session="fetch")
    )
    # Execute the update and commit the transaction
    SqlExeAndCommit(db,update_stmt)

    # Fetch and return the updated user
    updated_user = db.execute(query).scalar_one()
    return updated_user





@router.post("/delete_worktime", response_model=worktime.WorkTimeBase)
def delete_worktime(work_time: worktime.WorkTimeDelete,
                db: Session = Depends(get_db),
                current_user: UserModel = Depends(Authenticate.get_current_user)) -> WorkTimeModel:
    # Retrieve the existing user using the session's execute method
    query = Select(WorkTimeModel).where(and_(WorkTimeModel.Id == work_time.Id, WorkTimeModel.Active == True))
    existing_worktime = db.execute(query).scalar_one_or_none()
    if not existing_worktime:
        raise_exception(status_code=404, detail="User not found")


    # Prepare the update statement
    update_stmt = (
        update(WorkTimeModel)
        .where(WorkTimeModel.Id == existing_worktime.Id)
        .values(
            Active=False,
        )
        .execution_options(synchronize_session="fetch")
    )
    # Execute the update and commit the transaction
    SqlExeAndCommit(db,update_stmt)

    # Fetch and return the updated worktime
    query = Select(WorkTimeModel).where(and_(WorkTimeModel.Id == work_time.Id))
    updated_worktime = db.execute(query).scalar_one()
    return updated_worktime