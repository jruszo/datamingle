"use client";

import { useState, useEffect } from "react";
import { env } from "@/env";
import { useAccessToken } from "@workos-inc/authkit-nextjs/components";
import { useAuth } from "@workos-inc/authkit-nextjs/components";

interface ApiResponse {
  message?: string;
  status?: string;
  data?: any;
  error?: string;
  authenticated?: boolean;
  user?: any;
  auth_source?: string;
  jwt_info?: any;
}

export default function BackendTestPage() {
  const { user } = useAuth({ ensureSignedIn: true });
  const { accessToken, loading: tokenLoading } = useAccessToken();
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testBackendAuth = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    if (!accessToken) {
      setError("No access token available");
      setLoading(false);
      return;
    }

    try {
      const apiUrl = env.NEXT_PUBLIC_BACKEND_API;
      console.log("Backend API URL:", apiUrl);
      console.log("Access token available:", !!accessToken);
      console.log(
        "Access token (first 50 chars):",
        accessToken.substring(0, 50) + "...",
      );

      const response = await fetch(`${apiUrl}/test/auth`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `HTTP ${response.status}: ${errorData.message || "Unknown error"}`,
        );
      }

      const data = await response.json();
      setResponse(data);
      console.log("Backend response:", data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Backend test error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Automatically test the endpoint when access token becomes available
    if (accessToken && !loading && !response) {
      testBackendAuth();
    }
  }, [accessToken]);

  if (tokenLoading) {
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
            <strong>Access Token Available:</strong>{" "}
            {accessToken ? "Yes" : "No"}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={testBackendAuth}
          disabled={loading || !accessToken}
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
          <strong>Note:</strong> This test now uses JWT access tokens instead of
          session cookies for authentication.
        </p>
        <p>
          The backend verifies the JWT using WorkOS JWKS and extracts user
          information.
        </p>
      </div>
    </div>
  );
}
