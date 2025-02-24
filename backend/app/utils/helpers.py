import uuid

from sqlalchemy import String


def UUID():
    return String(36)


def New_UUID():
    return str(uuid.uuid4())
