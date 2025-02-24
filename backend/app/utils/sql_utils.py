from sqlalchemy import Engine, table, column, insert
from sqlalchemy.orm import Session

from app.db.models.base import BaseSQLModel


# querry a sql alchemy select with joins and where's IT IS NOT A STRING
def SqlExe(db: Session, query):
    result = db.execute(query)
    return result.fetchall()



# Insert data using SQLAlchemy
def SqlInsert(db: Session, new_data: BaseSQLModel):
    db.add(new_data)
    db.commit()
    db.refresh(new_data)
    return new_data

