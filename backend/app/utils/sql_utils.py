from sqlalchemy.orm import Session
from sqlalchemy.sql import ClauseElement

from app.db.models.base import BaseSQLModel


# querry a sql alchemy select with joins and where's IT IS NOT A STRING
def SqlExe(db: Session, query: ClauseElement):
    result = db.execute(query)
    # Convert results to list of dictionaries
    return [dict(row._mapping) for row in result]





# Insert data using SQLAlchemy
def SqlInsert(db: Session, new_data: BaseSQLModel):
    db.add(new_data)
    db.commit()
    db.refresh(new_data)
    return new_data

def SqlExeAndCommit(db: Session, query: ClauseElement):
    result = db.execute(query)
    db.commit()
    return result


def SqlExeWithMapping(db: Session, query: ClauseElement):
    result = db.execute(query).mappings().all()
    return result