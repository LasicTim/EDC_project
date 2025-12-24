from typing import Dict, List, Any

from sqlalchemy import and_, select, outerjoin

from app.api.schemas import users
from app.db.models.models import UserModel, CompanyModel
from app.exceptions import raise_exception
from app.utils.sql_utils import SqlExe


def get_company_workers(user_id: str, db: Any) -> list[users.ResponseCompanyUser]:
    """

    Args:
        user_id: the user id
        db: connection to the database

    Returns:
        all workers for the users company
    """
    query = select(
        *CompanyModel.__table__.columns
    ).select_from(
        outerjoin(UserModel, CompanyModel, UserModel.IdCompany == CompanyModel.Id)
    ).where(
        and_(
            UserModel.Id == user_id,
            CompanyModel.Active == True
        )
    )

    company_found = SqlExe(db, query)
    if not company_found:
        raise_exception(status_code=404, detail="company not found")
    company_id = company_found[0]["Id"]
    query = select(
        UserModel.Id,
        UserModel.username,
        UserModel.email,
        UserModel.first_name,
        UserModel.last_name
    ).where(
        and_(
            UserModel.IdCompany == company_id,
            UserModel.Active == True
        )
    )

    workers = SqlExe(db, query)

    return workers