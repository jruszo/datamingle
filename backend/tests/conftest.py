import os
import pytest

# Set dummy environment variables for WorkOS and other sensitive keys before app import
os.environ['WORKOS_API_KEY'] = 'sk_test_dummy_api_key_xxxxxxxx'
os.environ['WORKOS_CLIENT_ID'] = 'client_test_dummy_client_id_xxxx'
os.environ['WORKOS_COOKIE_PASSWORD'] = 'test_cookie_password_very_secret'
os.environ['DB_ENCRYPTION_KEY'] = 'KMvzxmwOsW9PhU4YKCtsz4G-980cF2L808nLe4MihZ0=' # Valid key

from backend.app import app as flask_app
from backend.models.base import db
from backend.models import User, DatabaseInstance
from unittest.mock import MagicMock 
from functools import wraps
from flask import request, g # Import g

@pytest.fixture
def app():
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    flask_app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    flask_app.config['TESTING'] = True

    with flask_app.app_context():
        db.create_all()
        yield flask_app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def mock_auth(app): # Removed monkeypatch
    with app.app_context(): # app_context ensures 'g' is available
        test_user = User(
            workos_user_id="test_workos_id_123",
            email="test@example.com",
            first_name="Test",
            last_name="User"
        )
        db.session.add(test_user)
        db.session.commit()

        # Prepare mock WorkOS user and token details for request attributes
        mock_workos_user_obj = MagicMock()
        mock_workos_user_obj.id = test_user.workos_user_id
        mock_workos_user_obj.email = test_user.email
        mock_workos_user_obj.first_name = test_user.first_name
        mock_workos_user_obj.last_name = test_user.last_name
        mock_workos_user_obj.profile_picture_url = test_user.profile_picture_url
        mock_workos_user_obj.email_verified = True 
        mock_workos_user_obj.created_at = test_user.created_at.isoformat() if test_user.created_at else None
        mock_workos_user_obj.updated_at = test_user.updated_at.isoformat() if test_user.updated_at else None
        
        mock_token_obj = {
            'sub': test_user.workos_user_id,
            'email': test_user.email,
            'given_name': test_user.first_name,
            'family_name': test_user.last_name,
            'picture': test_user.profile_picture_url,
            'org_id': 'test_org_id_456' 
        }

        # Set attributes on 'g' for the with_auth decorator hook
        g._mock_auth_user_for_testing = test_user
        g._mock_workos_user_for_testing = mock_workos_user_obj
        g._mock_workos_token_for_testing = mock_token_obj
        g._mock_auth_source_for_testing = "mock_g_fixture"
            
        yield test_user # Test runs with g attributes set

        # Clean up g attributes
        # Important: Check existence before deleting, as g might be cleared between requests
        # or if app context was pushed/popped multiple times.
        if hasattr(g, '_mock_auth_user_for_testing'):
            del g._mock_auth_user_for_testing
        if hasattr(g, '_mock_workos_user_for_testing'):
            del g._mock_workos_user_for_testing
        if hasattr(g, '_mock_workos_token_for_testing'):
            del g._mock_workos_token_for_testing
        if hasattr(g, '_mock_auth_source_for_testing'):
            del g._mock_auth_source_for_testing
        
        db.session.delete(test_user)
        db.session.commit()
