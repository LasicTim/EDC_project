import os

from fastapi import FastAPI

from app.api.routes import users, auth, companies, worktime, absence, vacation, custom_templates  # Import your API routes
from app.api.routes.reports import user_reports
from app.constants import GENERATED_REPORTS_DIR, BACKEND_URL, FRONTEND_URL
from app.core.config import settings
from app.db.base import engine, Base
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

Base.metadata.create_all(bind=engine)  # Create the database tables

# Initialize FastAPI app
app = FastAPI(title="My FastAPI App", version="1.0.0")

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(companies.router)
app.include_router(worktime.router)
app.include_router(absence.router)
app.include_router(vacation.router)
app.include_router(user_reports.router)
app.include_router(custom_templates.router)

origins = [
    FRONTEND_URL,
    BACKEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
reports_dir = GENERATED_REPORTS_DIR
os.makedirs(reports_dir, exist_ok=True)
app.mount("/generated_reports", StaticFiles(directory="generated_reports"), name="generated_reports")


# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to My FastAPI App!"}
