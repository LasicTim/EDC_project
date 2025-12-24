import os

from app.constants import TEMPLATES_DIR

BASE_TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), TEMPLATES_DIR)

def get_jinja_template_path(template_name: str) -> str:
    """
    Return the full path of a template file given its name.
    """
    return os.path.join(BASE_TEMPLATES_DIR, template_name)
