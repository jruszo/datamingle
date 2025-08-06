const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

interface ApiOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

export async function fetchBackend(
  path: string,
  options: ApiOptions = {}
): Promise<Response> {
  const { params, ...fetchOptions } = options;
  
  // Construct URL with query parameters if provided
  let url = `${API_BASE_URL}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }

  // Set default headers
  const headers = new Headers(fetchOptions.headers);
  if (!headers.has('Content-Type') && fetchOptions.body) {
    headers.set('Content-Type', 'application/json');
  }

  // Create the final options object
  const finalOptions: RequestInit = {
    ...fetchOptions,
    headers,
  };

  // Make the request
  return fetch(url, finalOptions);
}

// Convenience methods for common HTTP verbs
export function get(path: string, options?: Omit<ApiOptions, 'method' | 'body'>) {
  return fetchBackend(path, { ...options, method: 'GET' });
}

export function post(
  path: string,
  body?: any,
  options?: Omit<ApiOptions, 'method' | 'body'>
) {
  return fetchBackend(path, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function put(
  path: string,
  body?: any,
  options?: Omit<ApiOptions, 'method' | 'body'>
) {
  return fetchBackend(path, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function del(path: string, options?: Omit<ApiOptions, 'method' | 'body'>) {
  return fetchBackend(path, { ...options, method: 'DELETE' });
}
