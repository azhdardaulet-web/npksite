import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token from Zustand store to every request.
// Import lazily to avoid circular dependency (store imports api, api imports store).
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

// On 401: try refresh once, then retry the original request.
// On refresh failure: redirect to /login.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<{ accessToken: string }>(
          `${BASE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuth();
        window.location.hash = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Lazy accessors — break circular dependency with authStore
function getAccessToken(): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state = (window as any).__AUTH_STORE__?.getState?.();
    return state?.accessToken ?? null;
  } catch {
    return null;
  }
}

function setAccessToken(token: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__AUTH_STORE__?.getState?.().setAccessToken(token);
  } catch {
    // noop
  }
}

function clearAuth() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__AUTH_STORE__?.getState?.().logout();
  } catch {
    // noop
  }
}
