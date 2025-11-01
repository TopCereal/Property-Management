from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

APP_TITLE = os.getenv("APP_TITLE", "Property Manager (Desktop)")
DATABASE_URL = "postgresql+psycopg2://postgres:seaotter123@127.0.0.1:5432/pm_app"
DB_SCHEMA = os.getenv("DB_SCHEMA", "pm")

# Create the engine with explicit psycopg2 driver
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    echo=True  # Set to False in production
)

metadata = MetaData(schema=DB_SCHEMA)
Base = declarative_base(metadata=metadata)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()