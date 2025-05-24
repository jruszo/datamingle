from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from cryptography.fernet import Fernet
import os
import base64
from .base import db

class DatabaseInstance(db.Model):
    """
    Model to store database instance connection details.
    Supports multiple database types (MySQL, PostgreSQL, etc.).
    Passwords are encrypted for security.
    """
    __tablename__ = 'database_instances'
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign key to user
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    
    # Database type and instance details
    database_type = Column(String(50), nullable=False)  # 'mysql', 'postgresql', 'sqlite', etc.
    name = Column(String(255), nullable=False)  # Display name for the instance
    hostname = Column(String(255), nullable=False)  # Server hostname/IP
    port = Column(Integer, nullable=False)  # Database port (default depends on type)
    username = Column(String(255), nullable=False)  # Database username
    password_encrypted = Column(Text, nullable=False)  # Encrypted password
    database_name = Column(String(255))  # Optional default database name
    
    # Connection settings
    ssl_enabled = Column(Boolean, default=False, nullable=False)
    connection_timeout = Column(Integer, default=30)  # Connection timeout in seconds
    
    # Status and metadata
    is_active = Column(Boolean, default=True, nullable=False)
    last_tested_at = Column(DateTime)  # Last time connection was tested
    connection_status = Column(String(50))  # 'connected', 'failed', 'untested'
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def __repr__(self):
        return f'<DatabaseInstance {self.name}@{self.hostname} ({self.database_type})>'
    
    @property
    def password(self):
        """Decrypt and return the password"""
        if not self.password_encrypted:
            return None
        
        encryption_key = self._get_encryption_key()
        if not encryption_key:
            raise ValueError("Encryption key not configured")
        
        fernet = Fernet(encryption_key)
        return fernet.decrypt(self.password_encrypted.encode()).decode()
    
    @password.setter
    def password(self, value):
        """Encrypt and store the password"""
        if not value:
            self.password_encrypted = None
            return
        
        encryption_key = self._get_encryption_key()
        if not encryption_key:
            raise ValueError("Encryption key not configured")
        
        fernet = Fernet(encryption_key)
        self.password_encrypted = fernet.encrypt(value.encode()).decode()
    
    def _get_encryption_key(self):
        """Get or generate encryption key"""
        key = os.getenv('DB_ENCRYPTION_KEY')
        if not key:
            # Generate a new key if not set (for development)
            # In production, this should be set as an environment variable
            key = Fernet.generate_key().decode()
            print(f"WARNING: Generated new encryption key. Set DB_ENCRYPTION_KEY={key} in your .env file")
        return key.encode() if isinstance(key, str) else key
    
    def get_default_port(self):
        """Get the default port for the database type"""
        defaults = {
            'mysql': 3306,
            'postgresql': 5432,
            'mssql': 1433,
            'oracle': 1521,
            'mongodb': 27017
        }
        return defaults.get(self.database_type.lower(), 3306)
    
    def to_dict(self, include_password=False):
        """Convert instance to dictionary for JSON serialization"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'database_type': self.database_type,
            'name': self.name,
            'hostname': self.hostname,
            'port': self.port,
            'username': self.username,
            'database_name': self.database_name,
            'ssl_enabled': self.ssl_enabled,
            'connection_timeout': self.connection_timeout,
            'is_active': self.is_active,
            'last_tested_at': self.last_tested_at.isoformat() if self.last_tested_at else None,
            'connection_status': self.connection_status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        
        if include_password:
            data['password'] = self.password
        
        return data
    
    @classmethod
    def find_by_user(cls, user_id):
        """Find all database instances for a user"""
        return cls.query.filter_by(user_id=user_id, is_active=True).all()
    
    @classmethod
    def find_by_id_and_user(cls, instance_id, user_id):
        """Find a specific database instance by ID and user"""
        return cls.query.filter_by(id=instance_id, user_id=user_id, is_active=True).first()
    
    @classmethod
    def find_by_type_and_user(cls, database_type, user_id):
        """Find all database instances of a specific type for a user"""
        return cls.query.filter_by(database_type=database_type, user_id=user_id, is_active=True).all()
    
    def test_connection(self):
        """Test the database connection based on database type"""
        try:
            if self.database_type.lower() == 'mysql':
                return self._test_mysql_connection()
            elif self.database_type.lower() == 'postgresql':
                return self._test_postgresql_connection()
            else:
                return False, f"Database type '{self.database_type}' not yet supported for connection testing"
        except Exception as e:
            self.connection_status = 'failed'
            return False, f"Connection Error: {str(e)}"
        finally:
            # Update the database with the test results
            # Use the db imported at the module level from .base
            db.session.commit()
    
    def _test_mysql_connection(self):
        """Test MySQL connection"""
        import mysql.connector
        from mysql.connector import Error
        
        try:
            connection = mysql.connector.connect(
                host=self.hostname,
                port=self.port,
                user=self.username,
                password=self.password,
                database=self.database_name if self.database_name else None,
                connection_timeout=self.connection_timeout,
                use_ssl=self.ssl_enabled
            )
            
            if connection.is_connected():
                connection.close()
                self.connection_status = 'connected'
                self.last_tested_at = datetime.utcnow()
                return True, "MySQL connection successful"
            else:
                self.connection_status = 'failed'
                return False, "Failed to connect to MySQL"
                
        except Error as e:
            self.connection_status = 'failed'
            return False, f"MySQL Error: {str(e)}"
    
    def _test_postgresql_connection(self):
        """Test PostgreSQL connection"""
        try:
            import psycopg2
            
            connection = psycopg2.connect(
                host=self.hostname,
                port=self.port,
                user=self.username,
                password=self.password,
                database=self.database_name if self.database_name else 'postgres',
                connect_timeout=self.connection_timeout,
                sslmode='require' if self.ssl_enabled else 'prefer'
            )
            
            connection.close()
            self.connection_status = 'connected'
            self.last_tested_at = datetime.utcnow()
            return True, "PostgreSQL connection successful"
            
        except Exception as e:
            self.connection_status = 'failed'
            return False, f"PostgreSQL Error: {str(e)}"
    
    def soft_delete(self):
        """Soft delete the instance"""
        self.is_active = False
        self.updated_at = datetime.utcnow() 