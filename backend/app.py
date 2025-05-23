import os
from workos import WorkOSClient
from flask import Flask, request, jsonify, session, redirect, url_for, make_response
from flask_cors import CORS
from functools import wraps
from dotenv import load_dotenv
import jwt
import requests
from jwt import PyJWKClient

# Load environment variables from ../.env
load_dotenv(
    os.path.join(os.path.dirname(__file__), '..', '.env')
)

app = Flask(__name__)

# Configure CORS
CORS(app, 
     origins=["http://localhost:3000"],  # Your NextJS frontend URL (corrected port)
     supports_credentials=True,  # Important for cookies
     allow_headers=["Content-Type", "Authorization"],  # Uncommented this line
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

workos = WorkOSClient(
    api_key=os.getenv("WORKOS_API_KEY"), client_id=os.getenv("WORKOS_CLIENT_ID")
)

cookie_password = os.getenv("WORKOS_COOKIE_PASSWORD")

# JWT verification setup
WORKOS_JWKS_URL = workos.user_management.get_jwks_url()
jwks_client = PyJWKClient(WORKOS_JWKS_URL)

def with_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        print("=== JWT AUTH VERIFICATION ===")
        
        # Get access token from Authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return jsonify({
                'error': 'Authentication required',
                'message': 'No Bearer token provided',
                'authenticated': False
            }), 401
        
        access_token = auth_header[7:]  # Remove 'Bearer ' prefix
        print("Access token received:", access_token[:50] + "..." if len(access_token) > 50 else access_token)
        
        try:
            # Get the signing key from WorkOS JWKS
            signing_key = jwks_client.get_signing_key_from_jwt(access_token)
            
            # Verify and decode the JWT
            decoded_token = jwt.decode(
                access_token,
                signing_key.key,
                algorithms=["RS256"],
                options={"verify_exp": True}  # Verify expiration
            )
            
            print("JWT decoded successfully:", decoded_token)
            
            # Extract user information from the token
            user_id = decoded_token.get('sub')
            org_id = decoded_token.get('org_id')
            
            print("User ID:", user_id)
            print("Organization ID:", org_id)
            
            # Get full user details from WorkOS API
            try:
                user = workos.user_management.get_user(user_id)
                print("User fetched from API:", user.email)
                
                # Store user info in request context
                request.workos_user = user
                request.workos_token = decoded_token
                request.auth_source = "jwt"
                
                return f(*args, **kwargs)
                
            except Exception as user_fetch_error:
                print("Error fetching user details:", str(user_fetch_error))
                # Still continue with basic token info
                request.workos_token = decoded_token
                request.auth_source = "jwt"
                return f(*args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            print("JWT token has expired")
            return jsonify({
                'error': 'Token expired',
                'message': 'Access token has expired',
                'authenticated': False
            }), 401
        except jwt.InvalidTokenError as e:
            print("JWT validation failed:", str(e))
            return jsonify({
                'error': 'Invalid token',
                'message': f'Token validation failed: {str(e)}',
                'authenticated': False
            }), 401
        except Exception as e:
            print("Authentication error:", str(e))
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
        
        # Prepare response with all available data
        response_data = {
            'authenticated': True,
            'message': 'JWT Authentication test successful',
            'user': user_data,
            'auth_source': auth_source,
            'jwt_info': {
                'user_id': jwt_token.get('sub') if jwt_token else None,
                'organization_id': jwt_token.get('org_id') if jwt_token else None,
                'issued_at': jwt_token.get('iat') if jwt_token else None,
                'expires_at': jwt_token.get('exp') if jwt_token else None,
            },
            'workos_config': {
                'client_id': workos.client_id,
                'jwks_url': WORKOS_JWKS_URL
            }
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        print("Error in test_auth:", e)
        return jsonify({
            'error': 'Failed to retrieve user data',
            'message': str(e),
            'authenticated': True  # Still authenticated, just failed to get data
        }), 500

@app.route("/debug/config")
def debug_config():
    """
    Debug endpoint to show WorkOS configuration details
    """
    return jsonify({
        'workos_config': {
            'client_id': workos.client_id,
            'api_key_prefix': os.getenv("WORKOS_API_KEY")[:10] + "..." if os.getenv("WORKOS_API_KEY") else "None",
            'cookie_password_length': len(cookie_password) if cookie_password else 0,
            'cookie_password_prefix': cookie_password[:10] + "..." if cookie_password else "None",
            'backend_env_file': os.path.join(os.path.dirname(__file__), '..', '.env'),
            'env_vars_loaded': {
                'WORKOS_API_KEY': bool(os.getenv("WORKOS_API_KEY")),
                'WORKOS_CLIENT_ID': bool(os.getenv("WORKOS_CLIENT_ID")),
                'WORKOS_COOKIE_PASSWORD': bool(os.getenv("WORKOS_COOKIE_PASSWORD"))
            }
        }
    })

@app.route("/health")
def health_check():
    """
    Health check endpoint to verify the service is running.
    """
    return jsonify({
        'status': 'healthy',
        'service': 'WorkOS Flask Backend',
        'workos_configured': bool(workos.api_key and workos.client_id),
        'cors_enabled': True
    })

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)