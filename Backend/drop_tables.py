from app.database import engine, Base
from app.models.models import *  # This imports all models

def drop_tables():
    Base.metadata.drop_all(bind=engine)

if __name__ == "__main__":
    drop_tables()
    print("Tables dropped successfully")