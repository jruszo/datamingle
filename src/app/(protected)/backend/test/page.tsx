"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useAuthenticatedApi } from "@/hooks/use-api";

interface AuthTestResponse {
  authenticated: boolean;
  message: string;
  user?: any;
  auth_source?: string;
  jwt_info?: any;
  workos_config?: any;
}

export default function BackendTestPage() {
  const { user } = useAuth({ ensureSignedIn: true });
  const { apiCall, isTokenLoading, hasToken } = useAuthenticatedApi();
  const [response, setResponse] = useState<AuthTestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testBackendAuth = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    console.log("Testing backend authentication...");

    const result = await apiCall<AuthTestResponse>("/test/auth");

    if (result.ok && result.data) {
      setResponse(result.data);
      console.log("Backend authentication successful:", result.data);
    } else {
      setError(result.error || "Unknown error occurred");
      console.error("Backend authentication failed:", result.error);
    }

    setLoading(false);
  };

  useEffect(() => {
    // Automatically test the endpoint when token becomes available
    if (hasToken && !loading && !response) {
      testBackendAuth();
    }
  }, [hasToken]);

  if (isTokenLoading) {
    return (
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-bold">Backend Authentication Test</h1>
        <div className="text-blue-600">Loading access token...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">
        Backend Authentication Test (JWT)
      </h1>

      <div className="mb-6">
        <h2 className="mb-2 text-lg font-semibold">Frontend User Info</h2>
        <div className="rounded bg-gray-100 p-4">
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Name:</strong> {user?.firstName} {user?.lastName}
          </p>
          <p>
            <strong>User ID:</strong> {user?.id}
          </p>
          <p>
            <strong>Access Token Available:</strong> {hasToken ? "Yes" : "No"}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={testBackendAuth}
          disabled={loading || !hasToken}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? "Testing..." : "Test Backend Authentication"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 p-4 text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div className="rounded border border-green-400 bg-green-100 p-4 text-green-700">
          <h3 className="mb-2 font-bold">Backend Response:</h3>
          <pre className="overflow-auto rounded bg-white p-2 text-sm">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <p>
          <strong>Note:</strong> This test uses the{" "}
          <code>useAuthenticatedApi</code> hook which automatically handles JWT
          access tokens for all backend API calls.
        </p>
        <p>
          The backend verifies the JWT using WorkOS JWKS and extracts user
          information.
        </p>
      </div>
    </div>
  );
}
