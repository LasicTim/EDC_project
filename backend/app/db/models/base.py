from sqlalchemy import (
    Column,
    DateTime,
    Boolean
)

from app.db.base import Base
from app.utils.helpers import UUID, New_UUID
from app.utils.time import current_datetime


class BaseSQLModel(Base):
    __abstract__ = True  # This makes the class abstract and prevents it from being instantiated directly

    Id = Column(UUID(), primary_key=True, index=True)
    DateCreated = Column(DateTime, nullable=False)
    DateChanged = Column(DateTime, nullable=False)
    Active = Column(Boolean, nullable=False)
    UserCreated = Column(UUID(), nullable=True, index=True)
    UserChanged = Column(UUID(), nullable=True, index=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        setattr(self, 'Id', New_UUID())
        setattr(self, 'DateCreated', current_datetime())
        setattr(self, 'DateChanged', current_datetime())
        setattr(self, 'Active', True)
        setattr(self, 'UserCreated', None)
        setattr(self, 'UserChanged', None)



