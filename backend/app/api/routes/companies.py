from fastapi import APIRouter, Depends
from sqlalchemy import Select, and_, join, update
from sqlalchemy.orm import Session, outerjoin

from app.api.schemas import schemas, companies
from app.core.auth import Authenticate
from app.core.hashing import hash_password
from app.db.base import get_db
from app.db.models.models import CompanyModel, UserModel
from app.exceptions import raise_exception
from app.utils.email import is_valid_email
from app.utils.sql_utils import SqlInsert, SqlExe, SqlExeAndCommit
from app.utils.time import current_datetime

router = APIRouter(
    prefix="/companies",
    tags=["companies"],
)

@router.post("/create_company", response_model=companies.Company)
def create_company(company: companies.CompanyCreate,
                   db: Session = Depends(get_db),
                   current_user: UserModel = Depends(Authenticate.get_current_user)) -> CompanyModel:
    query = (Select(
        CompanyModel.Id,
    ).select_from(
        outerjoin(UserModel, CompanyModel, UserModel.IdCompany == CompanyModel.Id)
    )
    .where(and_(
        UserModel.Id == company.IdUser,
        CompanyModel.Active == True
    ))
    )
    existing_company = SqlExe(db,query)
    if existing_company:
        raise_exception(status_code=400, detail="company already exists")



    company_model = CompanyModel(name=company.name, address=company.address, email=company.email)
    company_created = SqlInsert(db, company_model)
    if company_created:
        update_stmt = (
            update(UserModel)
            .where(UserModel.Id == company.IdUser)
            .values(
                IdCompany=company_created.Id
            )
            .execution_options(synchronize_session="fetch")
        )
        # Execute the update and commit the transaction
        SqlExeAndCommit(db, update_stmt)
    return company_created


@router.post("/get_company", response_model=list[companies.CompanyBase])
def get_company(company: companies.GetCompany,
             db: Session = Depends(get_db),
             current_user: UserModel = Depends(Authenticate.get_current_user)) -> CompanyModel:


    query = (Select(
        *CompanyModel.__table__.columns
    ).select_from(
        outerjoin(UserModel, CompanyModel, UserModel.IdCompany == CompanyModel.Id)
    )
    .where(and_(
        UserModel.Id == company.IdUser,
        CompanyModel.Active == True
        ))
    )

    company_found = SqlExe(db, query)
    if not company_found:
        raise_exception(status_code=404, detail="company not found")
    return company_found


@router.post("/update_company", response_model=companies.GetCompanyBase)
def update_company(company: companies.CompanyBase,
                db: Session = Depends(get_db),
                current_user: UserModel = Depends(Authenticate.get_current_user)) -> CompanyModel:
    # Retrieve the existing user using the session's execute method
    query = Select(CompanyModel).where(and_(CompanyModel.Id == company.Id, CompanyModel.Active == True))
    existing_company = db.execute(query).scalar_one_or_none()
    if not existing_company or not is_valid_email(company.email):
        raise_exception(status_code=404, detail="Company not found")

    # Prepare the update statement
    update_stmt = (
        update(CompanyModel)
        .where(CompanyModel.Id == existing_company.Id)
        .values(
            name=company.name,
            email=company.email,
            DateChanged=current_datetime(),
            phone_number=company.phone_number,
            address=company.address,
            city=company.city,
            country=company.country,
            postal_code=company.postal_code
        )
        .execution_options(synchronize_session="fetch")
    )
    # Execute the update and commit the transaction
    SqlExeAndCommit(db,update_stmt)

    # Fetch and return the updated user
    updated_company = db.execute(query).scalar_one()
    return updated_company
