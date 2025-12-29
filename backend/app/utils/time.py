import datetime
from zoneinfo import ZoneInfo

TIME_ZONE_NAME = "Europe/Ljubljana"

def current_datetime() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)

def current_date() -> datetime.date:
    return datetime.datetime.now(datetime.timezone.utc).date()

def convert_to_utc_datetime(date: datetime.datetime):
    # If the input datetime is naive (without timezone), assume it is in local time
    if date.tzinfo is None:
        date = date.replace(tzinfo=datetime.timezone.utc)  # Assign UTC if naive
    return date.astimezone(datetime.timezone.utc)


def convert_utc_to_local(utc_datetime: datetime.datetime, offset_hours: int):
    if utc_datetime is None:
        return utc_datetime

    offset_hours = get_utc_offset_hours(utc_datetime, TIME_ZONE_NAME)

    # Only convert if tzinfo exists and is UTC
    if utc_datetime.tzinfo is not None and utc_datetime.tzinfo == datetime.timezone.utc:
        # Create the local timezone with the given offset
        local_timezone = datetime.timezone(datetime.timedelta(hours=offset_hours))
        # Convert to local time
        return utc_datetime.astimezone(local_timezone)

    # If tzinfo is None or not UTC, return unchanged
    return utc_datetime

def get_utc_offset_hours(dt: datetime.datetime, tz_name: str) -> int:
    """
    Get the UTC offset in hours for a given datetime and timezone.

    Args:
        dt (datetime): The datetime to check (can be naive or aware).
        tz_name (str): Timezone name, e.g., "Europe/Ljubljana".

    Returns:
        int: UTC offset in hours (e.g., 1 for winter, 2 for summer)
    """
    # If dt is naive, assume UTC
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=datetime.timezone.utc)

    local_dt = dt.astimezone(ZoneInfo(tz_name))
    offset_hours = int(local_dt.utcoffset().total_seconds() // 3600)
    return offset_hours