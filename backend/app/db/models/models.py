from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship

from app.db.models.base import BaseSQLModel
from app.utils.time import current_date


class UserModel(BaseSQLModel):
    __tablename__ = "users"
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_superuser = Column(Boolean, default=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    birth_date = Column(DateTime)
    phone_number = Column(String(20))
    address = Column(String(100))
    city = Column(String(50))
    country = Column(String(50))
    vacation_used = Column(Integer)
    vacation_criteria = Column(Text)
    IdCompany = Column(String(36), ForeignKey('companies.Id'), nullable=True, index=True)

    # Relationships
    company = relationship("CompanyModel", back_populates="users")

class CompanyModel(BaseSQLModel):
    __tablename__ = "companies"
    name = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone_number = Column(String(20))
    address = Column(String(100))
    city = Column(String(50))
    country = Column(String(50))
    postal_code = Column(String(100))

    # Relationships
    users = relationship("UserModel", back_populates="company")

class AbsenceModel(BaseSQLModel):
    __tablename__ = 'absences'
    DateFrom = Column(DateTime)
    DateTo = Column(DateTime)
    Reason = Column(String(100))
    Comment = Column(Text)
    IdWorker = Column(String(36), ForeignKey('users.Id'), nullable=True, index=True)

    # Relationships
    user = relationship("UserModel", viewonly=True)

class VacationModel(BaseSQLModel):
    __tablename__ = 'vacations'
    DateFrom = Column(DateTime)
    DateTo = Column(DateTime)
    Comment = Column(Text)
    OldVacation = Column(Integer)
    CurVacation = Column(Integer)
    Criteria = Column(Text) # json of criteria  name and value in days
    IdWorker = Column(String(36), ForeignKey('users.Id'), nullable=True, index=True)

    # Relationships
    user = relationship("UserModel", viewonly=True)

class WorkTimeModel(BaseSQLModel):
    __tablename__ = 'worktime'
    WorkType = Column(String(20)) # DELO,DELO OD DOMA ,TEREN
    BreakTimeFrom = Column(DateTime)
    BreakTimeTo = Column(DateTime)
    HasBreakTime = Column(Boolean)
    Comment = Column(Text)
    WorkDate = Column(DateTime)
    PlaceOfWork = Column(String(100))
    WorkTimeFrom = Column(DateTime)
    WorkTimeTo = Column(DateTime)
    IdWorker = Column(String(36), ForeignKey('users.Id'), nullable=True, index=True)

    # Relationships
    user = relationship("UserModel", viewonly=True)
