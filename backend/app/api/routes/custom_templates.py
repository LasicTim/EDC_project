from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import Select, and_, update
from sqlalchemy.orm import Session, joinedload, aliased

from app.api.schemas import schemas, companies, users, custom_templates
from app.api.schemas.custom_templates import CustomTemplateCreate
from app.core.auth import Authenticate
from app.core.hashing import hash_password, verify_password
from app.db.base import get_db
from app.db.models.models import UserModel, CompanyModel, CustomTemplateModel
from app.exceptions import raise_exception
from app.utils.sql_utils import SqlInsert, SqlExe, SqlExeAndCommit, SqlExeWithMapping
from app.utils.time import current_datetime, convert_to_utc_datetime, convert_utc_to_local

router = APIRouter(
    prefix="/custom_template",
    tags=["custom_template"],
)


@router.post("/create_custom_template", response_model=custom_templates.CustomTemplateCreate)
def create_worktime(custom_template: custom_templates.CustomTemplateCreate,
                  db: Session = Depends(get_db),
                  current_user: UserModel = Depends(Authenticate.get_current_user)) -> CustomTemplateModel:

    worktime_model = CustomTemplateModel(

        DateCreated = current_datetime(),
        DateChanged = current_datetime(),
        title = custom_template.title,
        content = custom_template.content,
        IdWorker = custom_template.IdWorker,
        )
    custom_template_created = SqlInsert(db, worktime_model)
    return custom_template_created


@router.post("/get_custom_template", response_model=list[custom_templates.CustomTemplatesBase])
def get_worktime(custom_template: custom_templates.CustomTemplateGet,
                 db: Session = Depends(get_db),
                 current_user: UserModel = Depends(Authenticate.get_current_user)) -> CustomTemplateModel:
    query = Select(
        *CustomTemplateModel.__table__.columns
    ).where(CustomTemplateModel.Id == custom_template.Id, CustomTemplateModel.Active == True,)
    custom_template = SqlExe(db, query)
    return custom_template


@router.post("/get_workers_custom_templates", response_model=list[custom_templates.CustomTemplatesBase])
def get_workers_worktime(work_time: custom_templates.WorkerCustomTemplateGet,
                db: Session = Depends(get_db),
                current_user: UserModel = Depends(Authenticate.get_current_user)) -> CustomTemplateModel:
    query = Select(*CustomTemplateModel.__table__.columns).where(
        CustomTemplateModel.IdWorker == work_time.IdWorker,
        CustomTemplateModel.Active == True,
    )
    custom_templates_found = SqlExe(db, query)
    if not custom_templates_found:
        raise_exception(status_code=404, detail="User not found")
    return custom_templates_found


@router.post("/update_custom_template", response_model=custom_templates.CustomTemplateUpdate)
def update_worktime(custom_template: custom_templates.CustomTemplateUpdate,
                    db: Session = Depends(get_db),
                    current_user: UserModel = Depends(Authenticate.get_current_user)) -> CustomTemplateModel:
    query = Select(CustomTemplateModel).where(CustomTemplateModel.Id == custom_template.Id)
    existing_template = db.execute(query).scalar_one_or_none()
    if not existing_template:
        raise_exception(status_code=404, detail="Template not found")
    # Prepare the update statement
    update_stmt = (
        update(CustomTemplateModel)
        .where(CustomTemplateModel.Id == custom_template.Id)
        .values(
            title=custom_template.title,
            content=custom_template.content,
            IdWorker=custom_template.IdWorker,
        )
        .execution_options(synchronize_session="fetch")
    )
    # Execute the update and commit the transaction
    SqlExeAndCommit(db,update_stmt)

    # Fetch and return the updated user
    updated_template = db.execute(query).scalar_one()
    return updated_template





@router.post("/delete_custom_template", response_model=custom_templates.CustomTemplateDelete)
def delete_worktime(custom_template: custom_templates.CustomTemplateDelete,
                    db: Session = Depends(get_db),
                    current_user: UserModel = Depends(Authenticate.get_current_user)) -> CustomTemplateModel:
    # Retrieve the existing user using the session's execute method
    query = Select(CustomTemplateModel).where(CustomTemplateModel.Id == custom_template.Id)
    existing_template = db.execute(query).scalar_one_or_none()
    if not existing_template:
        raise_exception(status_code=404, detail="Template not found")


    # Prepare the update statement
    update_stmt = (
        update(CustomTemplateModel)
        .where(CustomTemplateModel.Id == existing_template.Id)
        .values(
            Active=False,
        )
        .execution_options(synchronize_session="fetch")
    )
    # Execute the update and commit the transaction
    SqlExeAndCommit(db,update_stmt)

    # Fetch and return the updated worktime
    updated_custom_template = db.execute(query).scalar_one()
    return updated_custom_template