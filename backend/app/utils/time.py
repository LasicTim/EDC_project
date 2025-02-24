import datetime


def current_datetime() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)

def current_date() -> datetime.date:
    return datetime.datetime.now(datetime.timezone.utc).date()
