from sqlalchemy import create_engine, text

# Create engine
engine = create_engine("postgresql+psycopg2://postgres:seaotter123@127.0.0.1:5432/pm_app", echo=True)

try:
    # Try to connect
    with engine.connect() as connection:
        result = connection.execute(text("SELECT current_database(), current_schema"))
        print(result.fetchone())
        print("Successfully connected to the database!")
except Exception as e:
    print(f"Error connecting to database: {str(e)}")