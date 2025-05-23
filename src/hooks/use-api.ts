"use client";

import { useAccessToken } from "@workos-inc/authkit-nextjs/components";
import { env } from "@/env";

export interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: any;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  ok: boolean;
}

/**
 * Custom hook for making authenticated API calls to the backend
 */
export function useAuthenticatedApi() {
  const { accessToken, loading: tokenLoading } = useAccessToken();

  /**
   * Make an authenticated API call to the backend
   * @param endpoint - The API endpoint (e.g., '/test/auth')
   * @param options - Request options
   * @returns Promise with the API response
   */
  const apiCall = async <T = any>(
    endpoint: string,
    options: ApiOptions = {},
  ): Promise<ApiResponse<T>> => {
    if (tokenLoading) {
      return {
        error: "Access token is still loading",
        status: 0,
        ok: false,
      };
    }

    if (!accessToken) {
      return {
        error: "No access token available. User may not be authenticated.",
        status: 401,
        ok: false,
      };
    }

    const { method = "GET", body, headers = {} } = options;
    const apiUrl = env.NEXT_PUBLIC_BACKEND_API;

    // Ensure endpoint starts with /
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${apiUrl}${cleanEndpoint}`;

    try {
      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...headers,
      };

      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (body && method !== "GET") {
        requestOptions.body = JSON.stringify(body);
      }

      console.log(`[API] ${method} ${url}`);
      if (body) {
        console.log(`[API] Request body:`, body);
      }

      const response = await fetch(url, requestOptions);

      let data: T | undefined;
      let error: string | undefined;

      try {
        const responseData = await response.json();
        if (response.ok) {
          data = responseData;
        } else {
          error =
            responseData.message ||
            responseData.error ||
            `HTTP ${response.status}`;
        }
      } catch (parseError) {
        if (response.ok) {
          // Response was successful but not JSON (e.g., plain text)
          data = (await response.text()) as T;
        } else {
          error = `HTTP ${response.status}: ${response.statusText}`;
        }
      }

      const result: ApiResponse<T> = {
        data,
        error,
        status: response.status,
        ok: response.ok,
      };

      if (response.ok) {
        console.log(`[API] Success:`, result.data);
      } else {
        console.error(`[API] Error:`, result.error);
      }

      return result;
    } catch (networkError) {
      const error =
        networkError instanceof Error
          ? networkError.message
          : "Network error occurred";

      console.error(`[API] Network error:`, error);

      return {
        error,
        status: 0,
        ok: false,
      };
    }
  };

  return {
    apiCall,
    isTokenLoading: tokenLoading,
    hasToken: !!accessToken,
  };
}

/**
 * Standalone utility for making authenticated API calls (for use outside of React components)
 * Note: This should only be used when you have access to the token directly
 */
export const createAuthenticatedApiCall = (accessToken: string) => {
  return async <T = any>(
    endpoint: string,
    options: ApiOptions = {},
  ): Promise<ApiResponse<T>> => {
    const { method = "GET", body, headers = {} } = options;
    const apiUrl = env.NEXT_PUBLIC_BACKEND_API;

    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = `${apiUrl}${cleanEndpoint}`;

    try {
      const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...headers,
      };

      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (body && method !== "GET") {
        requestOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, requestOptions);

      let data: T | undefined;
      let error: string | undefined;

      try {
        const responseData = await response.json();
        if (response.ok) {
          data = responseData;
        } else {
          error =
            responseData.message ||
            responseData.error ||
            `HTTP ${response.status}`;
        }
      } catch (parseError) {
        if (response.ok) {
          data = (await response.text()) as T;
        } else {
          error = `HTTP ${response.status}: ${response.statusText}`;
        }
      }

      return {
        data,
        error,
        status: response.status,
        ok: response.ok,
      };
    } catch (networkError) {
      const error =
        networkError instanceof Error
          ? networkError.message
          : "Network error occurred";

      return {
        error,
        status: 0,
        ok: false,
      };
    }
  };
};
