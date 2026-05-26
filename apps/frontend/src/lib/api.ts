import { auth } from './auth';

const API_BASE = '/api';

const PUBLIC_AUTH_PATHS = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/auth/reset-password',
] as const;

type RequestOptions = {
  skipSessionRedirect?: boolean;
};

type ApiErrorBody = {
  error?: string;
  issues?: Array<{ path: (string | number)[]; message: string }>;
};

export class ApiError extends Error {
  readonly status: number;
  readonly issues?: ApiErrorBody['issues'];

  constructor(
    status: number,
    message: string,
    issues?: ApiErrorBody['issues'],
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.issues = issues;
  }
}

const isPublicAuthPath = (path: string): boolean =>
  PUBLIC_AUTH_PATHS.some((p) => path === p || path.startsWith(`${p}?`));

const authHeaders = (): HeadersInit => {
  const token = auth.getToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleSessionExpiry = (
  status: number,
  path: string,
  options?: RequestOptions,
): void => {
  if (status !== 401) return;
  if (options?.skipSessionRedirect || isPublicAuthPath(path)) return;
  if (!auth.getToken()) return;

  auth.clearToken();
  window.location.assign('/login');
};

const parseErrorBody = async (res: Response): Promise<ApiErrorBody> => {
  try {
    return (await res.json()) as ApiErrorBody;
  } catch {
    return {};
  }
};

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const init: RequestInit = {
    method,
    headers: authHeaders(),
  };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, init);

  if (!res.ok) {
    const errorBody = await parseErrorBody(res);
    handleSessionExpiry(res.status, path, options);
    throw new ApiError(
      res.status,
      errorBody.error ?? `${method} ${path} failed: ${res.status}`,
      errorBody.issues,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

/**
 * Converts API errors to user-friendly messages.
 * Logs full error details to console for developers.
 */
export const getErrorMessage = (err: unknown): string => {
  // Log detailed error for developers
  if (err instanceof ApiError) {
    console.error(
      `[API Error] Status: ${err.status} | Original Message: ${err.message}`,
      err.issues,
    );
  } else if (err instanceof TypeError && err.message === 'Failed to fetch') {
    console.error('[Network Error]', err);
  } else {
    console.error('[Unknown Error]', err);
  }

  // Return user-friendly message
  if (err instanceof ApiError) {
    if (err.status === 401 || err.status === 403) {
      return 'Invalid email or password';
    }
    if (err.status === 409) {
      return 'Email already registered';
    }
    if (err.status === 400) {
      return 'Invalid request. Please check your details.';
    }
    if (err.status === 429) {
      return 'Too many attempts. Please try again later.';
    }
    if (err.status >= 500) {
      return 'Server error. Please try again later.';
    }
    return 'Something went wrong. Please try again.';
  }

  // Network error
  if (err instanceof TypeError && err.message === 'Failed to fetch') {
    return 'Network error. Please check your connection.';
  }

  return 'Something went wrong. Please try again.';
};

export const api = {
  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>('GET', path, undefined, options);
  },

  async post<T>(
    path: string,
    body: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return request<T>('POST', path, body, {
      skipSessionRedirect:
        options?.skipSessionRedirect ?? isPublicAuthPath(path),
      ...options,
    });
  },

  async patch<T>(
    path: string,
    body: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return request<T>('PATCH', path, body, options);
  },

  async delete(path: string, options?: RequestOptions): Promise<void> {
    return request<void>('DELETE', path, undefined, options);
  },
};
