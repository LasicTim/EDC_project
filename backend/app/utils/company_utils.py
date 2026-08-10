import datetime
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

def get_company_report_data(user_id: str, db: Any) -> dict:
    """
    Returns the company and all active users belonging to it.
    """

    query = select(
        CompanyModel.Id.label("company_id"),
        CompanyModel.name.label("company_name"),
        CompanyModel.email.label("company_email"),
        CompanyModel.phone_number.label("company_phone_number"),
        CompanyModel.address.label("company_address"),
        CompanyModel.city.label("company_city"),
        CompanyModel.country.label("company_country"),
        CompanyModel.postal_code.label("company_postal_code"),
        UserModel.Id.label("user_id"),
        UserModel.username,
        UserModel.email.label("user_email"),
        UserModel.first_name,
        UserModel.last_name,
        UserModel.phone_number.label("user_phone_number"),
        UserModel.city.label("user_city"),
        UserModel.country.label("user_country"),
        UserModel.birth_date,
        UserModel.is_superuser,
    ).select_from(
        CompanyModel
    ).join(
        UserModel,
        UserModel.IdCompany == CompanyModel.Id
    ).where(
        and_(
            CompanyModel.Active == True,
            CompanyModel.Id == (
                select(UserModel.IdCompany)
                .where(UserModel.Id == user_id)
                .scalar_subquery()
            ),
            UserModel.Active == True,
        )
    )

    rows = SqlExe(db, query)

    if not rows:
        raise_exception(status_code=404, detail="company not found")

    company = {
        "id": rows[0]["company_id"],
        "name": rows[0]["company_name"],
        "email": rows[0]["company_email"],
        "phone_number": rows[0]["company_phone_number"],
        "address": rows[0]["company_address"],
        "city": rows[0]["company_city"],
        "country": rows[0]["company_country"],
        "postal_code": rows[0]["company_postal_code"],
        "users": [],
    }

    for row in rows:
        company["users"].append({
            "id": row["user_id"],
            "username": row["username"],
            "email": row["user_email"],
            "first_name": row["first_name"],
            "last_name": row["last_name"],
            "phone_number": row["user_phone_number"],
            "city": row["user_city"],
            "country": row["user_country"],
            "birth_date": row["birth_date"].strftime("%Y-%m-%d") if isinstance(row["birth_date"], datetime.datetime) else None,
            "is_superuser": row["is_superuser"],
        })

    return company