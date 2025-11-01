from logging.config import fileConfig
import os
import sys
from dotenv import load_dotenv

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

# Import the SQLAlchemy metadata object from your models
from app.database import Base, DB_SCHEMA
from app.models import models  # This imports all models

# Load environment variables
load_dotenv()

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Override sqlalchemy.url with environment variable if exists
db_url = os.getenv("DATABASE_URL")
if db_url:
    config.set_main_option("sqlalchemy.url", db_url)

# Update the SQLAlchemy URL from environment variable
db_url = os.getenv("DATABASE_URL", "postgresql://postgres:seaotter123@127.0.0.1:5432/pm_app")
config.set_main_option("sqlalchemy.url", db_url)

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        version_table_schema=DB_SCHEMA,
        include_schemas=True
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    from sqlalchemy import create_engine, text
    
    # Create the engine with explicit configuration
    connectable = create_engine(
        "postgresql+psycopg2://postgres:seaotter123@127.0.0.1:5432/pm_app",
        echo=True,
        pool_pre_ping=True
    )
    
    # Create schema if it doesn't exist
    with connectable.connect() as connection:
        connection.execute(text("CREATE SCHEMA IF NOT EXISTS pm;"))

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata,
            version_table_schema=DB_SCHEMA,
            include_schemas=True
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()