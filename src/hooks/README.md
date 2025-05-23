# Authenticated API Utility

This utility provides a convenient way to make authenticated API calls to your backend using JWT access tokens from WorkOS AuthKit.

## Features

- ✅ Automatic Bearer token handling
- ✅ TypeScript support with generics
- ✅ Error handling with detailed response info
- ✅ Automatic JSON parsing
- ✅ Loading state management
- ✅ Console logging for debugging

## Usage

### 1. Using the Hook (Recommended for React Components)

```tsx
import { useAuthenticatedApi } from "@/hooks/use-api";

export function MyComponent() {
  const { apiCall, isTokenLoading, hasToken } = useAuthenticatedApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);

    const result = await apiCall<MyDataType>("/my-endpoint");

    if (result.ok && result.data) {
      setData(result.data);
    } else {
      console.error("API Error:", result.error);
    }

    setLoading(false);
  };

  // Handle loading states
  if (isTokenLoading) return <div>Loading...</div>;
  if (!hasToken) return <div>Please log in</div>;

  return (
    <button onClick={fetchData} disabled={loading}>
      {loading ? "Loading..." : "Fetch Data"}
    </button>
  );
}
```

### 2. GET Requests

```tsx
// Simple GET request
const result = await apiCall("/users");

// GET with query parameters (add them to the endpoint)
const result = await apiCall("/users?page=1&limit=10");
```

### 3. POST Requests

```tsx
// POST with JSON body
const result = await apiCall("/users", {
  method: "POST",
  body: {
    name: "John Doe",
    email: "john@example.com",
  },
});
```

### 4. Other HTTP Methods

```tsx
// PUT request
const result = await apiCall("/users/123", {
  method: "PUT",
  body: { name: "Updated Name" },
});

// DELETE request
const result = await apiCall("/users/123", {
  method: "DELETE",
});

// PATCH request
const result = await apiCall("/users/123", {
  method: "PATCH",
  body: { status: "active" },
});
```

### 5. Custom Headers

```tsx
const result = await apiCall("/upload", {
  method: "POST",
  body: formData,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});
```

### 6. TypeScript Support

```tsx
interface User {
  id: string;
  email: string;
  name: string;
}

// Type the response
const result = await apiCall<User>("/users/123");

if (result.ok && result.data) {
  // result.data is now typed as User
  console.log(result.data.email);
}
```

## Response Format

All API calls return a standardized response object:

```tsx
interface ApiResponse<T = any> {
  data?: T; // Response data (if successful)
  error?: string; // Error message (if failed)
  status: number; // HTTP status code
  ok: boolean; // true if status 200-299
}
```

## Error Handling

```tsx
const result = await apiCall("/endpoint");

if (result.ok) {
  // Success - use result.data
  console.log("Success:", result.data);
} else {
  // Error - use result.error
  console.error("Error:", result.error);
  console.error("Status:", result.status);
}
```

## Advanced Usage

### Conditional API Calls

```tsx
const { apiCall, hasToken } = useAuthenticatedApi();

useEffect(() => {
  if (hasToken) {
    // Only make API call when token is available
    fetchUserData();
  }
}, [hasToken]);
```

### Standalone Function (Outside React)

```tsx
import { createAuthenticatedApiCall } from "@/hooks/use-api";
import { useAccessToken } from "@workos-inc/authkit-nextjs/components";

// In a React component
export function MyComponent() {
  const { accessToken } = useAccessToken();

  const handleClick = async () => {
    if (accessToken) {
      const apiCall = createAuthenticatedApiCall(accessToken);
      const result = await apiCall("/endpoint");
    }
  };
}
```

## Environment Configuration

The utility automatically uses the `NEXT_PUBLIC_BACKEND_API` environment variable for the base URL.

Make sure you have this set in your `.env.local`:

```env
NEXT_PUBLIC_BACKEND_API=http://localhost:5000
```

## Backend Integration

Your backend should expect requests with the `Authorization: Bearer <token>` header and implement JWT verification using WorkOS JWKS.

Example backend endpoint (Python/Flask):

```python
@app.route("/my-endpoint")
@with_auth  # Your JWT authentication decorator
def my_endpoint():
    user = request.workos_user  # User from JWT
    return jsonify({"message": f"Hello {user.email}!"})
```

## Debugging

The utility automatically logs all API calls to the console:

```
[API] GET http://localhost:5000/users
[API] Success: { users: [...] }
```

Or for errors:

```
[API] POST http://localhost:5000/users
[API] Error: Validation failed
```
