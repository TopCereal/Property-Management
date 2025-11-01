import os
import sys
from sqlalchemy import create_engine, text

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Base
from app.models import models  # This imports all models

def create_tables():
    print("Creating database tables...")
    
    # Create engine with explicit configuration
    engine = create_engine(
        "postgresql+psycopg2://postgres:seaotter123@127.0.0.1:5432/pm_app",
        echo=True,
        pool_pre_ping=True
    )
    
    # Create schema if it doesn't exist
    with engine.connect() as connection:
        connection.execute(text("CREATE SCHEMA IF NOT EXISTS pm;"))
        connection.commit()
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    create_tables()