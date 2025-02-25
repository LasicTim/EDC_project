from fastapi import APIRouter, Depends
from sqlalchemy import Select, and_
from sqlalchemy.orm import Session

from app.api.schemas import schemas, companies
from app.core.auth import Authenticate
from app.core.hashing import hash_password
from app.db.base import get_db
from app.db.models.models import CompanyModel
from app.exceptions import raise_exception
from app.utils.sql_utils import SqlInsert, SqlExe

router = APIRouter(
    prefix="/companies",
    tags=["companies"],
)

@router.post("/create_company", response_model=companies.GetCompany)
def create_company(company: companies.CompanyCreate,
                   db: Session = Depends(get_db),
                   current_user: CompanyModel = Depends(Authenticate.get_current_user)) -> CompanyModel:
    query = Select(
        CompanyModel.Id,
        CompanyModel.name,
        CompanyModel.email
    ).where(and_(CompanyModel.name == company.name, CompanyModel.email == company.email, CompanyModel.Active == True))
    existing_company = SqlExe(db,query)
    if existing_company:
        raise_exception(status_code=400, detail="company already exists")

    company_model = CompanyModel(name=company.name, email=company.email)
    company_created = SqlInsert(db, company_model)
    return company_created


@router.post("/get_company", response_model=list[companies.CompanyBase])
def get_company(company: companies.GetCompany,
             db: Session = Depends(get_db),
             current_user: CompanyModel = Depends(Authenticate.get_current_user)) -> CompanyModel:
    query = Select(
        CompanyModel.name,
        CompanyModel.email,
        CompanyModel.phone_number,
        CompanyModel.address,
        CompanyModel.city,
        CompanyModel.country
    )

    query.where(and_(CompanyModel.name == company.name,CompanyModel.email == company.email, CompanyModel.Active == True)) 
    company_found = SqlExe(db, query)
    if not company_found:
        raise_exception(status_code=404, detail="company not found")
    return company_found