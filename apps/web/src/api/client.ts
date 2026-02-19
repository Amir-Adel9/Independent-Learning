import createClient from 'openapi-fetch';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiErrorBody } from '@/api/types';
import type { paths } from '@/api/schema';

const AUTH_LOGIN = '/api/auth/login';
const AUTH_REFRESH = '/api/auth/refresh';
const AUTH_REGISTER = '/api/auth/register';
/* Pathnames for 401 skip (full URL pathname still includes /api) */

const AUTH_PATHS = new Set([AUTH_LOGIN, AUTH_REFRESH, AUTH_REGISTER]);

function isAuthPath(url: string): boolean {
  try {
    const path = new URL(url).pathname;
    return AUTH_PATHS.has(path);
  } catch {
    return false;
  }
}

/** Base URL: origin + /api so paths in code are without /api (e.g. GET('/categories') -> /api/categories). */
const API_BASE =
  typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api';

let isRefreshing = false;
let refreshPromise: Promise<Response> | null = null;

const LOGIN_PATH = '/login';
const REGISTER_PATH = '/register';

function clearAndRedirect() {
  useAuthStore.getState().clearUser();
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path === LOGIN_PATH || path === REGISTER_PATH) return;
  }
  window.location.href = LOGIN_PATH;
}

async function doRefresh(): Promise<Response> {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  try {
    const res = await refreshPromise;
    return res;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

/**
 * Custom fetch: on 401 (except auth paths), refresh once then retry.
 * Clones request for first attempt so the original can be retried after refresh.
 */
async function fetchWithRefresh(input: Request): Promise<Response> {
  const cloned = input.clone();
  const response = await fetch(cloned);

  if (response.status !== 401 || isAuthPath(input.url)) {
    return response;
  }

  const refreshRes = await doRefresh();
  if (!refreshRes.ok) {
    clearAndRedirect();
    return response;
  }

  return fetch(input);
}

const client = createClient<paths>({
  baseUrl: API_BASE,
  credentials: 'include',
  fetch: fetchWithRefresh,
});

client.use({
  onResponse({ response }) {
    if (!response.ok) {
      const err = Object.assign(
        new Error(`${response.status} ${response.statusText}`),
        { response },
      ) as Error & { response: Response };
      throw err;
    }
  },
});

export const apiClient = client;

/**
 * Extract error message from API response. Backend returns
 * { success: false, statusCode, message } (see global-exception.filter.ts).
 */
export async function extractErrorMessage(
  err: unknown,
  fallback = 'Something went wrong',
): Promise<string> {
  if (err && typeof err === 'object' && 'response' in err) {
    try {
      const res = (err as { response: Response }).response;
      const body = (await res.clone().json()) as ApiErrorBody;
      return body.message ?? fallback;
    } catch {
      // body consumed or not JSON
      return fallback;
    }
  }
  return err instanceof Error ? err.message : fallback;
}
