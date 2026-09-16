/** Central place for environment configuration. Never hardcode URLs elsewhere. */
export const API_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "http://localhost:8080/api";

/** Simulated network latency for mock services (ms). */
export const MOCK_LATENCY = 450;

/** How long a seat stays reserved for the user, in seconds. */
export const SEAT_LOCK_SECONDS = 300;

export const STORAGE_KEYS = {
  auth: "smartbus.auth",
  booking: "smartbus.booking",
};
