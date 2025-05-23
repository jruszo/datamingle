# WorkOS Flask Backend

This is a Flask API backend that implements WorkOS authentication for user management. Users authenticate through your NextJS frontend, and this backend validates their authentication status.

## Features

- **WorkOS Authentication Integration**: Full session-based authentication using WorkOS AuthKit
- **Authentication Wrapper**: `@require_auth` decorator to protect endpoints
- **Session Management**: Secure session handling with encrypted cookies
- **Test Endpoint**: `/test/auth` endpoint that returns user data for testing
- **Health Check**: `/health` endpoint for service monitoring

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy the example environment file and fill in your WorkOS credentials:

```bash
cp env.example .env
```

Edit `.env` with your actual values:

```env
# WorkOS Configuration
WORKOS_API_KEY=your_workos_api_key_here
WORKOS_CLIENT_ID=your_workos_client_id_here
WORKOS_COOKIE_PASSWORD=your_32_character_cookie_password_here
WORKOS_REDIRECT_URI=http://localhost:3000/auth/callback

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
```

### 3. WorkOS Dashboard Setup

1. In your WorkOS dashboard, go to **Redirects** and add:
   - `http://localhost:5000/auth/callback`
2. Go to **API Keys** and copy:
   - Client ID
   - Secret Key (API Key)
3. Generate a 32-character cookie password for session encryption

### 4. Run the Server

```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### Public Endpoints

- `GET /` - Hello world message
- `GET /health` - Health check and configuration status
- `GET /auth/login` - Get authorization URL for WorkOS login
- `GET /auth/callback` - Handle WorkOS authentication callback
- `POST /auth/logout` - Clear user session

### Protected Endpoints (Require Authentication)

- `GET /auth/user` - Get current user information
- `GET /test/auth` - Test endpoint that returns user object and session data

## Authentication Flow

1. **Frontend initiates login**: Call `GET /auth/login` to get authorization URL
2. **User authenticates**: Redirect user to the authorization URL
3. **Callback handling**: WorkOS redirects to `/auth/callback` with auth code
4. **Session creation**: Backend exchanges code for user info and creates session
5. **Protected requests**: Frontend can now call protected endpoints with session cookies

## Usage with NextJS Frontend

Your NextJS frontend should:

1. Call `/auth/login` to get the WorkOS authorization URL
2. Redirect users to that URL for authentication
3. Handle the callback (WorkOS will redirect to your backend)
4. Make authenticated requests to protected endpoints

Example frontend code:

```javascript
// Get login URL
const response = await fetch("http://localhost:5000/auth/login");
const { authorization_url } = await response.json();

// Redirect user to WorkOS
window.location.href = authorization_url;

// Later, make authenticated requests
const userResponse = await fetch("http://localhost:5000/test/auth", {
  credentials: "include", // Important: include cookies
});
const userData = await userResponse.json();
```

## Authentication Decorator

Use the `@require_auth` decorator to protect any endpoint:

```python
@app.route("/protected-endpoint")
@require_auth
def protected_endpoint():
    user = session['user']  # Access authenticated user data
    return jsonify({'message': f'Hello {user["email"]}!'})
```

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Authentication required",
  "message": "User must be authenticated to access this endpoint",
  "authenticated": false
}
```

## Security Notes

- Sessions are encrypted using the `WORKOS_COOKIE_PASSWORD`
- Use a strong, 32-character password for production
- Ensure HTTPS in production environments
- The backend validates sessions on each protected request

## Testing

Test the authentication flow:

1. Start the backend: `python app.py`
2. Visit `http://localhost:5000/health` to verify setup
3. Call `/auth/login` to get authorization URL
4. Complete authentication flow
5. Test `/test/auth` endpoint to verify user data

## Environment Variables

| Variable                 | Description                                                            | Required |
| ------------------------ | ---------------------------------------------------------------------- | -------- |
| `WORKOS_API_KEY`         | Your WorkOS API secret key                                             | Yes      |
| `WORKOS_CLIENT_ID`       | Your WorkOS client ID                                                  | Yes      |
| `WORKOS_COOKIE_PASSWORD` | 32-character password for session encryption                           | Yes      |
| `WORKOS_REDIRECT_URI`    | Callback URL for WorkOS (default: http://localhost:5000/auth/callback) | No       |
| `FLASK_ENV`              | Flask environment (development/production)                             | No       |
| `FLASK_DEBUG`            | Enable Flask debug mode                                                | No       |
