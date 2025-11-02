from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException
import logging
import os
from dotenv import load_dotenv

# Configure logging
logger = logging.getLogger(__name__)

load_dotenv()

APP_TITLE = os.getenv("APP_TITLE", "Property Manager (Desktop)")
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:seaotter123@127.0.0.1:5432/pm_app")
DB_SCHEMA = os.getenv("DB_SCHEMA", "pm")

# Configure engine with connection pooling and retry settings
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # Enable connection health checks
    pool_size=5,  # Maximum number of connections in the pool
    max_overflow=10,  # Maximum number of connections that can be created beyond pool_size
    pool_timeout=30,  # Seconds to wait before giving up on getting a connection from the pool
    pool_recycle=1800,  # Recycle connections after 30 minutes
    echo=bool(os.getenv("SQL_ECHO", "False").lower() == "true"),
    connect_args={
        "connect_timeout": 10,  # Connection timeout in seconds
        "application_name": "property_manager_api"  # Identify app in pg_stat_activity
    }
)

metadata = MetaData(schema=DB_SCHEMA)
Base = declarative_base(metadata=metadata)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def get_db():
    """Get a database session with automatic cleanup.
    
    Usage:
        @app.get("/endpoint")
        def endpoint(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        # Test connection before yielding
        db.execute(text("SELECT 1"))
        yield db
    except Exception as e:
        logger.error(f"Database connection error: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail="Database connection error"
        )
    finally:
        db.close()