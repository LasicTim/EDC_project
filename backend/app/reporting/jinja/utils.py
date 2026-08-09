import os

from jinja2 import Environment, FileSystemLoader, select_autoescape
from dataclasses import asdict
from app.constants import TEMPLATES_DIR, STATS_DIR

BASE_TEMPLATES_DIR = os.path.join(os.path.dirname(__file__), TEMPLATES_DIR)
BASE_STATS_DIR = os.path.join(os.path.dirname(__file__), STATS_DIR)

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

def get_jinja_stat_path(stat_name: str) -> str:
    return os.path.join(BASE_STATS_DIR, stat_name)

def report_stats_to_json_rows(report_stats: list[dict]) -> list[dict]:
    rows = []
    for entry in report_stats:
        rows.append({
            "run": entry["run"],
            "multiplier": entry["multiplier"],
            "worker_count": entry["worker_count"],
            "phases": [asdict(phase) for phase in entry["metrics"].phases],
        })
    return rows