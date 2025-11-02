from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .database import engine, Base, get_db
from sqlalchemy import text
from sqlalchemy.orm import Session
import logging
import time
import psutil
from datetime import datetime

# Import routers
from .routers import properties as properties_router
from .routers import tenants as tenants_router
from .schemas.responses import HealthCheck, APIError, Metrics

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Track API start time for uptime calculation
START_TIME = time.time()
REQUEST_COUNT = 0
LAST_REQUEST_TIME = time.time()

app = FastAPI(
    title="Property Management API",
    description="""
    Property Management System API
    
    Features:
    * Property CRUD operations
    * Tenant management
    * Maintenance requests
    * Financial tracking
    * Document storage
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    contact={
        "name": "API Support",
        "email": "support@example.com",
    },
    license_info={
        "name": "MIT",
    }
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    global REQUEST_COUNT, LAST_REQUEST_TIME
    REQUEST_COUNT += 1
    LAST_REQUEST_TIME = time.time()
    
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    
    logger.info(
        f"Method: {request.method} Path: {request.url.path} "
        f"Status: {response.status_code} Duration: {process_time:.2f}ms"
    )
    
    return response

@app.on_event("startup")
async def startup_event():
    """Initialize application state and verify database connection"""
    try:
        # Test the database connection without using get_db
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            connection.commit()
        logger.info("Database connection successful")
    except Exception as e:
        logger.error(f"Database connection failed: {str(e)}")
        # Log error but don't raise to allow the API to start
        pass

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions with consistent error format"""
    return JSONResponse(
        status_code=exc.status_code,
        content=APIError(
            error=exc.detail,
            path=request.url.path
        ).dict()
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle unexpected exceptions with consistent error format"""
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=APIError(
            error="Internal server error",
            detail=str(exc),
            path=request.url.path
        ).dict()
    )

# Include routers
app.include_router(properties_router.router)
app.include_router(tenants_router.router)

@app.get("/", 
         summary="API Root",
         description="Returns basic API information",
         response_model=dict)
async def root():
    """Get basic API information"""
    return {
        "message": "Property Management API",
        "version": "1.0.0",
        "status": "running",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

@app.get("/health",
         summary="Health Check",
         description="Check the health status of the API and its dependencies",
         response_model=HealthCheck,
         responses={
             503: {"model": APIError, "description": "Service unavailable"}
         })
async def health_check(db: Session = Depends(get_db)):
    """Check API and database health"""
    try:
        start_time = time.time()
        db.execute(text("SELECT 1"))
        db_latency = (time.time() - start_time) * 1000

        if db_latency > 1000:  # Alert if DB latency > 1 second
            logger.warning(f"High database latency: {db_latency:.2f}ms")

        return HealthCheck(
            status="healthy",
            version="1.0.0",
            database=f"connected (latency: {db_latency:.2f}ms)",
            timestamp=datetime.now()
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Service unhealthy: {str(e)}"
        )

@app.get("/metrics",
         summary="API Metrics",
         description="Get detailed API performance metrics",
         response_model=Metrics,
         responses={
             500: {"model": APIError, "description": "Internal server error"}
         })
async def get_metrics(db: Session = Depends(get_db)):
    """Get API performance metrics"""
    try:
        # Test database latency
        start_time = time.time()
        db.execute(text("SELECT 1"))
        db_latency = (time.time() - start_time) * 1000

        # Calculate requests per minute
        elapsed_time = max(1, time.time() - LAST_REQUEST_TIME) / 60
        rpm = REQUEST_COUNT / elapsed_time if elapsed_time > 0 else 0

        return Metrics(
            uptime=time.time() - START_TIME,
            database_latency_ms=db_latency,
            active_connections=len(psutil.Process().connections()),
            requests_per_minute=rpm,
            status={
                "cpu_percent": psutil.cpu_percent(),
                "memory_percent": psutil.Process().memory_percent(),
                "thread_count": psutil.Process().num_threads()
            }
        )
    except Exception as e:
        logger.error(f"Error getting metrics: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/debug/db",
         include_in_schema=False,
         description="Debug database connection (development only)")
async def debug_db(db: Session = Depends(get_db)):
    """Debug database connection (development only)"""
    try:
        result = db.execute(text("SELECT version()")).scalar()
        return {"db_version": result}
    except Exception as e:
        logger.error(f"Database debug failed: {str(e)}")
        return {"error": str(e)}