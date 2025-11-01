from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base

# Import routers here
# from .routers import properties, tenants, leases, maintenance, transactions, files

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
# app.include_router(properties.router)
# app.include_router(tenants.router)
# app.include_router(leases.router)
# app.include_router(maintenance.router)
# app.include_router(transactions.router)
# app.include_router(files.router)

@app.get("/")
async def root():
    return {"message": "Property Management API"}