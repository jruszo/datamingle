# WorkOS Authentication Setup Guide

This project uses WorkOS AuthKit for authentication. Follow these steps to set up authentication:

## 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# WorkOS Configuration
WORKOS_CLIENT_ID="client_..." # retrieved from the WorkOS dashboard
WORKOS_API_KEY="sk_test_..." # retrieved from the WorkOS dashboard
WORKOS_COOKIE_PASSWORD="your-32-character-secret-password-here" # generate a secure password here
NEXT_PUBLIC_WORKOS_REDIRECT_URI="http://localhost:3000/auth/callback" # configured in the WorkOS dashboard

# Optional: Set a default logout URI in your WorkOS dashboard settings under "Redirects"
# WORKOS_LOGOUT_URI="http://localhost:3000"
```

## 2. Generate a Secure Cookie Password

The `WORKOS_COOKIE_PASSWORD` must be at least 32 characters long. You can generate one using:

```bash
# Using OpenSSL
openssl rand -base64 24

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 3. WorkOS Dashboard Configuration

1. Go to your [WorkOS Dashboard](https://dashboard.workos.com/)
2. Create a new application or use an existing one
3. Configure the following settings:

### Redirect URIs

- Add `http://localhost:3000/auth/callback` for development
- Add your production callback URL for production

### Logout URIs (Optional)

- Add `http://localhost:3000` for development
- Add your production home URL for production

## 4. Get Your Credentials

From your WorkOS Dashboard:

1. Copy the **Client ID** (starts with `client_`)
2. Copy the **API Key** (starts with `sk_test_` for test environment)

## 5. Features Implemented

- ✅ Middleware-based authentication
- ✅ Protected routes (dashboard)
- ✅ Public routes (landing page)
- ✅ Sign in/Sign up buttons
- ✅ User session management
- ✅ Sign out functionality
- ✅ Impersonation support
- ✅ Client-side auth hooks

## 6. Usage Examples

### Server Components

```tsx
import { withAuth } from "@workos-inc/authkit-nextjs";

export default async function ProtectedPage() {
  const { user } = await withAuth({ ensureSignedIn: true });
  return <div>Hello {user.firstName}!</div>;
}
```

### Client Components

```tsx
"use client";
import { useAuth } from "@/hooks/use-auth";

export default function ClientComponent() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not signed in</div>;

  return <div>Hello {user.firstName}!</div>;
}
```

### Getting Auth URLs

```tsx
import { getSignInUrl, getSignUpUrl } from "@workos-inc/authkit-nextjs";

export default async function AuthButtons() {
  const signInUrl = await getSignInUrl();
  const signUpUrl = await getSignUpUrl();

  return (
    <div>
      <a href={signInUrl}>Sign In</a>
      <a href={signUpUrl}>Sign Up</a>
    </div>
  );
}
```

## 7. Troubleshooting

### Common Issues

1. **NEXT_REDIRECT error**: Don't wrap `withAuth({ ensureSignedIn: true })` in try/catch blocks
2. **Module build failed**: Don't import server-side WorkOS functions in client components
3. **Session not persisting**: Make sure `WORKOS_COOKIE_PASSWORD` is set and at least 32 characters

### Debug Mode

Enable debug logging in development by setting the middleware debug flag (already configured):

```tsx
export default authkitMiddleware({
  debug: process.env.NODE_ENV === "development",
});
```

## 8. Production Deployment

1. Update environment variables with production values
2. Configure production redirect URIs in WorkOS Dashboard
3. Use production API keys (starts with `sk_live_`)
4. Set up proper domain configuration

For more information, visit the [WorkOS AuthKit Documentation](https://workos.com/docs/authkit).
