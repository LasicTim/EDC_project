import datetime

def current_datetime() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)

def current_date() -> datetime.date:
    return datetime.datetime.now(datetime.timezone.utc).date()

def convert_to_utc_datetime(date: datetime):
    # If the input datetime is naive (without timezone), assume it is in local time
    if date.tzinfo is None:
        date = date.replace(tzinfo=datetime.timezone.utc)  # Assign UTC if naive
    return date.astimezone(datetime.timezone.utc)


def convert_utc_to_local(utc_datetime: datetime, offset_hours: int):
    if utc_datetime is None:
        return utc_datetime

    # Only convert if tzinfo exists and is UTC
    if utc_datetime.tzinfo is not None and utc_datetime.tzinfo == datetime.timezone.utc:
        # Create the local timezone with the given offset
        local_timezone = datetime.timezone(datetime.timedelta(hours=offset_hours))
        # Convert to local time
        return utc_datetime.astimezone(local_timezone)

    # If tzinfo is None or not UTC, return unchanged
    return utc_datetime