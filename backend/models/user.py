from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text

# We'll import db from app when needed to avoid circular imports
# The Base will be db.Model from Flask-SQLAlchemy

class User:
    """
    User model that stores additional user data beyond what WorkOS provides.
    This supplements the WorkOS user data with application-specific information.
    """
    __tablename__ = 'users'
    
    # Primary key
    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # WorkOS user ID (this should match the 'sub' claim in JWT tokens)
    workos_user_id = Column(String(255), unique=True, nullable=False, index=True)
    
    # User information (can be synced from WorkOS or stored locally)
    email = Column(String(255), nullable=False, unique=True, index=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    profile_picture_url = Column(Text)
    
    # Application-specific fields
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    
    # Preferences and settings
    timezone = Column(String(50), default='UTC')
    language = Column(String(10), default='en')
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login_at = Column(DateTime)
    
    def __repr__(self):
        return f'<User {self.email}>'
    
    def to_dict(self):
        """Convert user to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'workos_user_id': self.workos_user_id,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'profile_picture_url': self.profile_picture_url,
            'is_active': self.is_active,
            'is_admin': self.is_admin,
            'timezone': self.timezone,
            'language': self.language,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_login_at': self.last_login_at.isoformat() if self.last_login_at else None,
        }
    
    @classmethod
    def find_by_workos_id(cls, workos_user_id):
        """Find user by WorkOS user ID"""
        return cls.query.filter_by(workos_user_id=workos_user_id).first()
    
    @classmethod
    def find_by_email(cls, email):
        """Find user by email"""
        return cls.query.filter_by(email=email).first()
    
    def update_last_login(self):
        """Update the last login timestamp"""
        from app import db
        self.last_login_at = datetime.utcnow()
        db.session.commit() 