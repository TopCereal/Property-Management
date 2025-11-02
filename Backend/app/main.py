from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from sqlalchemy import text
from .database import get_db
from sqlalchemy.orm import Session

# Import routers
from .routers import properties as properties_router
from .routers import tenants as tenants_router
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Property Management API",
    description="API for managing properties and tenants",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    # Test database connection on startup
    try:
        db = next(get_db())
        db.execute(text("SELECT 1"))
        db.close()
        logger.info("Database connection successful")
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        raise

@app.on_event("startup")
async def startup_event():
    # Test database connection on startup
    try:
        db = next(get_db())
        db.execute(text("SELECT 1"))
        db.close()
        logger.info("Database connection successful")
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        raise
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers here
app.include_router(properties_router.router)
app.include_router(tenants_router.router)

@app.get("/")
async def root():
    return {"message": "Property Management API"}

@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
            "version": "1.0.0"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": str(e),
            "version": "1.0.0"
        }

@app.get("/debug/db", include_in_schema=False)
async def debug_db(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT version()")).scalar()
        return {"db_version": result}
    except Exception as e:
        return {"error": str(e)}


@app.get('/debug/db')
def debug_db(db: Session = Depends(get_db)):
    try:
        res = db.execute(text("SELECT 1")).scalar()
        return {"ok": True, "result": res}
    except Exception:
        import traceback
        tb = traceback.format_exc()
        return {"ok": False, "error": tb}