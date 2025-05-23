import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Base class for all models
Base = declarative_base()

class DatabaseConfig:
    """Database configuration class"""
    
    # SQLite configuration (current)
    SQLITE_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'db.sqlite')
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{SQLITE_DB_PATH}'
    
    # PostgreSQL configuration (for future use)
    # Uncomment and configure when switching to PostgreSQL
    # POSTGRES_USER = os.getenv('POSTGRES_USER', 'postgres')
    # POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'password')
    # POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'localhost')
    # POSTGRES_PORT = os.getenv('POSTGRES_PORT', '5432')
    # POSTGRES_DB = os.getenv('POSTGRES_DB', 'datamingle')
    # SQLALCHEMY_DATABASE_URI = f'postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}'
    
    # SQLAlchemy configuration
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = os.getenv('FLASK_ENV') == 'development'  # Show SQL queries in development
    
    @classmethod
    def get_database_uri(cls):
        """Get the database URI based on environment"""
        return cls.SQLALCHEMY_DATABASE_URI 