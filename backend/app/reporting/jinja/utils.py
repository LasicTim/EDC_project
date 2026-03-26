import os

from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.constants import TEMPLATES_DIR

BASE_TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), TEMPLATES_DIR)

def get_jinja_template_path(template_name: str) -> str:
    """
    Return the full path of a template file given its name.
    """
    return os.path.join(BASE_TEMPLATES_DIR, template_name)

def get_jinja_environment():
    env = Environment(
        loader=FileSystemLoader(BASE_TEMPLATES_DIR),
        autoescape=select_autoescape(['html', 'xml'])
    )
    return env