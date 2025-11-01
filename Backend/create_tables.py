import os
import sys
from sqlalchemy import create_engine, text

# Get the absolute path of the Backend directory and add it to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
print(f"Current directory: {current_dir}")
sys.path.insert(0, current_dir)
print(f"Python path: {sys.path}")

try:
    from app.database import Base
    from app.models import models  # This imports all models
    print("Successfully imported app modules")
except Exception as e:
    print(f"Error importing modules: {str(e)}")
    print(f"Looking for app in: {os.path.join(current_dir, 'app')}")
    print(f"Does app directory exist? {os.path.exists(os.path.join(current_dir, 'app'))}")
    if os.path.exists(os.path.join(current_dir, 'app')):
        print("Contents of app directory:")
        print(os.listdir(os.path.join(current_dir, 'app')))

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