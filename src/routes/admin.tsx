import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { STORAGE_KEYS } from "@/config/env";
import type { AuthResponse } from "@/types";

/**
 * Role-based guard for every /admin/* page. Auth lives in the browser, so the
 * check runs client-side (ssr: false) before any admin page renders.
 * With Spring Boot, the API must also reject non-admin tokens (403).
 */
function readSession(): AuthResponse | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.auth);
    return raw ? (JSON.parse(raw) as AuthResponse) : null;
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: ({ location }) => {
    const session = readSession();
    if (!session?.token) {
      throw redirect({ to: "/access-denied", search: { reason: "signin", from: location.pathname } });
    }
    if (session.user.role !== "ADMIN") {
      throw redirect({ to: "/access-denied", search: { reason: "role", from: location.pathname } });
    }
  },
  component: () => <Outlet />,
});
