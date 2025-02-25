from fastapi import FastAPI

from app.api.routes import users, auth, companies  # Import your API routes
from app.db.base import engine, Base

Base.metadata.create_all(bind=engine)  # Create the database tables

# Initialize FastAPI app
app = FastAPI(title="My FastAPI App", version="1.0.0")

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(companies.router)


# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to My FastAPI App!"}
