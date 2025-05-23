import os
from workos import WorkOSClient
from flask import Flask, request, jsonify, session, redirect, url_for, make_response
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from functools import wraps
from dotenv import load_dotenv
import jwt
import requests
from jwt import PyJWKClient
from config.database import DatabaseConfig
from datetime import datetime

from models import User

# Load environment variables from ../.env
load_dotenv(
    os.path.join(os.path.dirname(__file__), '..', '.env')
)

app = Flask(__name__)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = DatabaseConfig.get_database_uri()
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = DatabaseConfig.SQLALCHEMY_TRACK_MODIFICATIONS
app.config['SQLALCHEMY_ECHO'] = DatabaseConfig.SQLALCHEMY_ECHO

# Initialize SQLAlchemy and Flask-Migrate
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Import models after db initialization to avoid circular imports
from models import User

# Configure CORS
CORS(app, 
     origins=["http://localhost:3000"],  # Your NextJS frontend URL
     supports_credentials=True,  # Important for cookies
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

workos = WorkOSClient(
    api_key=os.getenv("WORKOS_API_KEY"), client_id=os.getenv("WORKOS_CLIENT_ID")
)

cookie_password = os.getenv("WORKOS_COOKIE_PASSWORD")

# JWT verification setup with caching
WORKOS_JWKS_URL = workos.user_management.get_jwks_url()
# Cache JWKS keys and key set for better performance
# lifespan: cache the JWK set for 1 hour (3600 seconds)
# cache_keys: cache individual signing keys (LRU cache)
jwks_client = PyJWKClient(WORKOS_JWKS_URL, cache_keys=True, max_cached_keys=10, cache_jwk_set=True, lifespan=3600)

def get_or_create_user(workos_user, jwt_token):
    """
    Get existing user or create new user from WorkOS data
    """
    workos_user_id = workos_user.id if workos_user else jwt_token.get('sub')
    
    # Try to find existing user
    user = User.find_by_workos_id(workos_user_id)
    
    if not user and workos_user:
        # Create new user from WorkOS data
        user = User(
            workos_user_id=workos_user.id,
            email=workos_user.email,
            first_name=workos_user.first_name,
            last_name=workos_user.last_name,
            profile_picture_url=workos_user.profile_picture_url
        )
        db.session.add(user)
        db.session.commit()
    elif not user and jwt_token:
        # Create user from JWT token data if WorkOS user fetch failed
        user = User(
            workos_user_id=jwt_token.get('sub'),
            email=jwt_token.get('email'),
            first_name=jwt_token.get('given_name'),
            last_name=jwt_token.get('family_name'),
            profile_picture_url=jwt_token.get('picture')
        )
        db.session.add(user)
        db.session.commit()
    
    # Update last login
    if user:
        user.update_last_login()
    
    return user

def with_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get access token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({
                'error': 'Authentication required',
                'message': 'No Bearer token provided',
                'authenticated': False
            }), 401
        
        access_token = auth_header[7:]  # Remove 'Bearer ' prefix
        
        try:
            # Get the signing key from WorkOS JWKS (cached)
            signing_key = jwks_client.get_signing_key_from_jwt(access_token)
            
            # Verify and decode the JWT
            decoded_token = jwt.decode(
                access_token,
                signing_key.key,
                algorithms=["RS256"],
                options={"verify_exp": True}  # Verify expiration
            )
            
            # Extract user information from the token
            user_id = decoded_token.get('sub')
            org_id = decoded_token.get('org_id')
            
            # Get full user details from WorkOS API
            try:
                workos_user = workos.user_management.get_user(user_id)
                
                # Get or create user in local database
                local_user = get_or_create_user(workos_user, decoded_token)
                
                # Store user info in request context
                request.workos_user = workos_user
                request.local_user = local_user
                request.workos_token = decoded_token
                request.auth_source = "jwt"
                
                return f(*args, **kwargs)
                
            except Exception as user_fetch_error:
                # Still continue with basic token info and try to get/create local user
                local_user = get_or_create_user(None, decoded_token)
                
                request.local_user = local_user
                request.workos_token = decoded_token
                request.auth_source = "jwt"
                return f(*args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            return jsonify({
                'error': 'Token expired',
                'message': 'Access token has expired',
                'authenticated': False
            }), 401
        except jwt.InvalidTokenError as e:
            return jsonify({
                'error': 'Invalid token',
                'message': f'Token validation failed: {str(e)}',
                'authenticated': False
            }), 401
        except Exception as e:
            return jsonify({
                'error': 'Authentication error',
                'message': str(e),
                'authenticated': False
            }), 401

    return decorated_function

@app.route("/")
def hello_world():
    return "<p>Hello, World! WorkOS Flask Backend is running.</p>"

@app.route("/test/auth")
@with_auth
def test_auth():
    """
    Test endpoint that returns user object and authentication data using JWT tokens.
    """
    try:
        # Use the user information stored in request context by with_auth decorator
        current_user = getattr(request, 'workos_user', None)
        local_user = getattr(request, 'local_user', None)
        jwt_token = getattr(request, 'workos_token', None)
        auth_source = getattr(request, 'auth_source', 'unknown')
        
        # Get user data from WorkOS user object or JWT token
        if current_user:
            user_data = {
                'id': current_user.id,
                'email': current_user.email,
                'first_name': current_user.first_name,
                'last_name': current_user.last_name,
                'profile_picture_url': current_user.profile_picture_url,
                'email_verified': current_user.email_verified,
                'created_at': current_user.created_at,
                'updated_at': current_user.updated_at,
            }
        elif jwt_token:
            # Fallback to JWT token data if user fetch failed
            user_data = {
                'id': jwt_token.get('sub'),
                'email': jwt_token.get('email'),
                'first_name': jwt_token.get('given_name'),
                'last_name': jwt_token.get('family_name'),
                'profile_picture_url': jwt_token.get('picture'),
                'source': 'jwt_only'
            }
        else:
            user_data = None
        
        # Include local user data if available
        local_user_data = local_user.to_dict() if local_user else None
        
        # Prepare response with all available data
        response_data = {
            'authenticated': True,
            'message': 'JWT Authentication test successful',
            'workos_user': user_data,
            'local_user': local_user_data,
            'auth_source': auth_source,
            'jwt_info': {
                'user_id': jwt_token.get('sub') if jwt_token else None,
                'organization_id': jwt_token.get('org_id') if jwt_token else None,
                'issued_at': jwt_token.get('iat') if jwt_token else None,
                'expires_at': jwt_token.get('exp') if jwt_token else None,
            }
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({
            'error': 'Failed to retrieve user data',
            'message': str(e),
            'authenticated': True  # Still authenticated, just failed to get data
        }), 500

@app.route("/health")
def health_check():
    """
    Health check endpoint to verify the service is running.
    """
    return jsonify({
        'status': 'healthy',
        'service': 'WorkOS Flask Backend',
        'workos_configured': bool(workos.api_key and workos.client_id),
        'cors_enabled': True,
        'database_configured': bool(app.config.get('SQLALCHEMY_DATABASE_URI'))
    })

# Database management commands
@app.cli.command()
def init_db():
    """Initialize the database with tables."""
    db.create_all()
    print("Database tables created successfully!")

@app.cli.command()
def reset_db():
    """Reset the database by dropping and recreating all tables."""
    db.drop_all()
    db.create_all()
    print("Database reset successfully!")

if __name__ == "__main__":
    # Create tables if they don't exist
    with app.app_context():
        db.create_all()
    
    app.run(debug=True, host='0.0.0.0', port=5000)