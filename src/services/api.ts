/**
 * Single Axios instance for the whole app.
 *
 * The mock services below do not call the network yet, but every one of them
 * documents the endpoint it will call. When the Spring Boot API is ready,
 * replace the mock body with `api.get(...)` / `api.post(...)`.
 */
import axios from "axios";
import { API_BASE_URL, MOCK_LATENCY, STORAGE_KEYS } from "@/config/env";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

/** Attaches the JWT stored by authSlice to every outgoing request. */
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(STORAGE_KEYS.auth);
    if (raw) {
      try {
        const { token } = JSON.parse(raw) as { token?: string };
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } catch {
        // ignore malformed storage
      }
    }
  }
  return config;
});

/** Normalises API errors into a plain message the UI can display. */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ?? error?.message ?? "Something went wrong. Please retry.";
    return Promise.reject(new Error(message));
  },
);

/** Helper used by the mock services to imitate a network round trip. */
export function mockRequest<T>(data: T, delay = MOCK_LATENCY): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay));
}

export function mockFailure(message: string, delay = MOCK_LATENCY): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), delay));
}
