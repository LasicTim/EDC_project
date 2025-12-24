import os

from app.core.config import settings

GENERATED_REPORTS_DIR = os.path.join(os.path.dirname(__file__), settings.reports_dir)
TEMPLATES_DIR = 'templates'

BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"