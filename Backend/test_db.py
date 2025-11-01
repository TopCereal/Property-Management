import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def test_connection():
    try:
        # Connect to PostgreSQL server
        conn = psycopg2.connect(
            host="127.0.0.1",
            port="5432",
            user="postgres",
            password="seaotter123",
            database="pm_app"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        
        # Create a cursor
        cur = conn.cursor()
        
        # Create schema if it doesn't exist
        cur.execute('CREATE SCHEMA IF NOT EXISTS pm;')
        
        # Test query
        cur.execute('SELECT current_database(), current_schema;')
        result = cur.fetchone()
        print(f"Connected to database: {result[0]}, schema: {result[1]}")
        
        # Close cursor and connection
        cur.close()
        conn.close()
        print("Database connection test successful!")
        return True
    except Exception as e:
        print(f"Error connecting to database: {str(e)}")
        return False

if __name__ == "__main__":
    test_connection()