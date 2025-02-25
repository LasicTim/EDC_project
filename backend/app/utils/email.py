import re

def is_valid_email(email: str) -> bool:
    """
    Check if the given string is a valid email address.
    
    Args:
        email (str): The email address to validate.
    
    Returns:
        bool: True if valid, False otherwise.
    """
    # Basic regex pattern for validating email addresses
    pattern = r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)"
    return re.match(pattern, email) is not None

def is_valid_password(password: str) -> bool:
    """
    Check if the given string is a valid password.
    
    Args:
        password (str): The password to validate.
    
    Returns:
        bool: True if valid, False otherwise.
    """
    # Basic regex pattern for validating passwords
    pattern = r"(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
    return re.match(pattern, password) is not None
