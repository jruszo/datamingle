"use client";

import { useState } from "react";
import { useAuthenticatedApi } from "@/hooks/use-api";

/**
 * Example component demonstrating different ways to use the authenticated API utility
 */
export function ApiExample() {
  const { apiCall, isTokenLoading, hasToken } = useAuthenticatedApi();
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleApiCall = async (
    key: string,
    endpoint: string,
    options?: any,
  ) => {
    setLoading((prev) => ({ ...prev, [key]: true }));

    const result = await apiCall(endpoint, options);

    setResults((prev) => ({ ...prev, [key]: result }));
    setLoading((prev) => ({ ...prev, [key]: false }));
  };

  if (isTokenLoading) {
    return <div>Loading authentication...</div>;
  }

  if (!hasToken) {
    return <div>No authentication token available</div>;
  }

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-xl font-bold">API Usage Examples</h2>

      {/* GET Request Example */}
      <div className="rounded border p-4">
        <h3 className="mb-2 font-semibold">GET Request - Test Auth</h3>
        <button
          onClick={() => handleApiCall("auth", "/test/auth")}
          disabled={loading.auth}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading.auth ? "Loading..." : "Test Authentication"}
        </button>
        {results.auth && (
          <pre className="mt-2 overflow-auto bg-gray-100 p-2 text-sm">
            {JSON.stringify(results.auth, null, 2)}
          </pre>
        )}
      </div>

      {/* POST Request Example */}
      <div className="rounded border p-4">
        <h3 className="mb-2 font-semibold">POST Request Example</h3>
        <button
          onClick={() =>
            handleApiCall("post", "/api/data", {
              method: "POST",
              body: { message: "Hello from frontend!" },
            })
          }
          disabled={loading.post}
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading.post ? "Loading..." : "Send POST Request"}
        </button>
        {results.post && (
          <pre className="mt-2 overflow-auto bg-gray-100 p-2 text-sm">
            {JSON.stringify(results.post, null, 2)}
          </pre>
        )}
      </div>

      {/* Health Check Example */}
      <div className="rounded border p-4">
        <h3 className="mb-2 font-semibold">Health Check (No Auth Needed)</h3>
        <button
          onClick={() => handleApiCall("health", "/health")}
          disabled={loading.health}
          className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:bg-gray-400"
        >
          {loading.health ? "Loading..." : "Check Health"}
        </button>
        {results.health && (
          <pre className="mt-2 overflow-auto bg-gray-100 p-2 text-sm">
            {JSON.stringify(results.health, null, 2)}
          </pre>
        )}
      </div>

      <div className="mt-6 rounded bg-blue-50 p-4">
        <h3 className="mb-2 font-semibold">How to use in your components:</h3>
        <pre className="rounded bg-white p-2 text-sm">
          {`import { useAuthenticatedApi } from "@/hooks/use-api";

export function MyComponent() {
  const { apiCall, isTokenLoading, hasToken } = useAuthenticatedApi();
  
  const fetchData = async () => {
    const result = await apiCall('/my-endpoint');
    
    if (result.ok) {
      console.log('Success:', result.data);
    } else {
      console.error('Error:', result.error);
    }
  };
  
  const postData = async () => {
    const result = await apiCall('/my-endpoint', {
      method: 'POST',
      body: { key: 'value' }
    });
  };
  
  // Use the functions...
}`}
        </pre>
      </div>
    </div>
  );
}
