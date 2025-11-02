from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .database import engine, Base, get_db
from sqlalchemy import text
from sqlalchemy.orm import Session
import logging
import time
import os
import threading
from tenacity import retry, stop_after_attempt, wait_exponential
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

# Global OpenAPI metadata and tag descriptions
app = FastAPI(
    title="Property Management API",
    description=(
        "Property Management System API providing property CRUD operations, "
        "tenant management, maintenance requests, and financial tracking."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    contact={"name": "API Support", "email": "support@example.com"},
    license_info={"name": "MIT"},
    servers=[{"url": "http://localhost:8000", "description": "Local development server"}],
    openapi_tags=[
        {"name": "System", "description": "Health, metrics and system-level endpoints."},
        {"name": "Properties", "description": "Manage properties: create, read, update, delete, and list."},
        {"name": "Tenants", "description": "Manage tenants and related operations."},
    ],
)


@app.on_event("shutdown")
async def shutdown_event():
    """Gracefully shutdown the application by disposing resources."""
    logger.info("Shutting down application...")
    try:
        # dispose() is synchronous for SQLAlchemy engines; use .dispose()
        engine.dispose()
        logger.info("Database connections closed")
    except Exception:
        logger.exception("Error while disposing engine during shutdown")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
    ],  # Restrict in production
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
    from tenacity import retry, stop_after_attempt, wait_exponential

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=10)
    )
    def check_db_connection():
        try:
            # Test the database connection
            with engine.connect() as connection:
                connection.execute(text("SELECT 1"))
                connection.commit()
            logger.info("Database connection successful")
            return True
        except Exception as e:
            logger.error(f"Database connection failed: {str(e)}")
            raise

    try:
        check_db_connection()
    except Exception as e:
        # Log error but allow the server to start
        logger.error(f"All database connection attempts failed: {str(e)}")
        # We'll handle individual request failures in the database session

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
         description="""
         Check the health status of the API and its dependencies.
         
         Returns:
         - status: 'healthy' if all systems are operational
         - version: current API version
         - database: connection status and latency
         - timestamp: time of the health check
         
         Use this endpoint for:
         - Monitoring system health
         - Load balancer checks
         - Deployment verification
         """,
         response_model=HealthCheck,
         responses={
             503: {"model": APIError, "description": "Service unavailable - Database connection failed"}
         },
         tags=["System"])
async def health_check(db: Session = Depends(get_db)):
    """Check API and database health status"""
    try:
        # Use retry for database check
        @retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, min=1, max=2))
        def check_db():
            start = time.time()
            db.execute(text("SELECT 1"))
            return (time.time() - start) * 1000

        db_latency = check_db()
        
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
         summary="API Performance Metrics",
         description="""
         Get detailed API performance metrics and system status.
         
         Returns:
         - uptime: seconds since server start
         - database_latency_ms: current database query latency
         - active_connections: number of active database connections
         - requests_per_minute: current request rate
         - status: detailed system metrics including:
           * process_id: current process ID
           * thread_count: active threads
           * pool_size: database connection pool size
         
         Use this endpoint for:
         - Performance monitoring
         - Resource usage tracking
         - Capacity planning
         """,
         response_model=Metrics,
         responses={
             500: {"model": APIError, "description": "Internal server error"}
         })
async def get_metrics(db: Session = Depends(get_db)):
    """Get API performance metrics"""
    try:
        # Test database latency with retry
        @retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, min=1, max=2))
        def check_db_latency():
            start_time = time.time()
            db.execute(text("SELECT 1"))
            return (time.time() - start_time) * 1000

        return Metrics(
            uptime=time.time() - START_TIME,
            database_latency_ms=check_db_latency(),
            active_connections=len(engine.pool.checkedin()) + len(engine.pool.checkedout()),
            requests_per_minute=REQUEST_COUNT,
            status={
                "process_id": os.getpid(),
                "thread_count": threading.active_count(),
                "pool_size": engine.pool.size()
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