import { API_BASE_URL } from '../config/api';
import {
    clearTokens,
    getAccessToken,
    getRefreshToken,
    saveTokens,
} from './tokenManager';

// ============================================================
// Types
// ============================================================

export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: string[];
  code?: string;
}

// ============================================================
// Concurrent refresh protection state
// ============================================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

let onUnauthorizedCallback: (() => void) | null = null;

// ============================================================
// Helpers
// ============================================================

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
}

function buildUrl(path: string, params?: Record<string, string>): string {
  const url = `${API_BASE_URL}${path}`;
  if (!params || Object.keys(params).length === 0) return url;
  const searchParams = new URLSearchParams(params);
  return `${url}?${searchParams.toString()}`;
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  try {
    const body = await response.json();
    return {
      message: body.message || `Request failed with status ${response.status}`,
      status: response.status,
      errors: body.errors,
      code: body.code,
    };
  } catch {
    return {
      message: `Request failed with status ${response.status}`,
      status: response.status,
    };
  }
}


async function refreshAccessToken(): Promise<string> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  const data = await response.json();
  await saveTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string>,
): Promise<ApiResponse<T>> {
  const url = buildUrl(path, params);
  const accessToken = await getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = { method, headers };
  if (body !== undefined && method !== 'GET' && method !== 'DELETE') {
    config.body = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (error) {
    throw {
      message: 'Không có kết nối mạng',
      status: 0,
    } as ApiError;
  }

  // Handle 401 — attempt token refresh (skip for auth endpoints)
  const isAuthEndpoint = path.startsWith('/auth/signin') || path.startsWith('/auth/refresh-token') || path.startsWith('/auth/reset-password');
  if (response.status === 401 && !isAuthEndpoint) {
    if (isRefreshing) {
      // Another refresh is in progress — queue this request
      const newToken = await new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
      // Retry with new token
      headers['Authorization'] = `Bearer ${newToken}`;
      const retryResponse = await fetch(url, { ...config, headers });
      if (!retryResponse.ok) {
        throw await parseErrorResponse(retryResponse);
      }
      const retryData = await retryResponse.json();
      return { data: retryData, status: retryResponse.status };
    }

    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();
      processQueue(null, newToken);

      // Retry original request with new token
      headers['Authorization'] = `Bearer ${newToken}`;
      const retryResponse = await fetch(url, { ...config, headers });
      if (!retryResponse.ok) {
        throw await parseErrorResponse(retryResponse);
      }
      const retryData = await retryResponse.json();
      return { data: retryData, status: retryResponse.status };
    } catch (refreshError) {
      processQueue(refreshError, null);
      await clearTokens();
      onUnauthorizedCallback?.();
      throw {
        message: 'Session expired. Please sign in again.',
        status: 401,
        code: 'TOKEN_EXPIRED',
      } as ApiError;
    } finally {
      isRefreshing = false;
    }
  }

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return { data: undefined as T, status: 204 };
  }

  const data = await response.json();
  return { data, status: response.status };
}

// ============================================================
// Public API
// ============================================================

export const apiClient = {
  get<T>(path: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    return request<T>('GET', path, undefined, params);
  },

  post<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>('POST', path, body);
  },

  put<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>('PUT', path, body);
  },

  patch<T>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return request<T>('PATCH', path, body);
  },

  delete<T>(path: string): Promise<ApiResponse<T>> {
    return request<T>('DELETE', path);
  },

  setOnUnauthorized(callback: () => void): void {
    onUnauthorizedCallback = callback;
  },
};

// Also export the helper for testing
export { buildUrl };
