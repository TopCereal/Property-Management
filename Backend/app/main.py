from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base

# Import routers
from .routers import properties as properties_router
from .routers import tenants as tenants_router

app = FastAPI(title="Property Management API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Include routers here
app.include_router(properties_router.router)
app.include_router(tenants_router.router)

@app.get("/")
async def root():
    return {"message": "Property Management API"}