import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RequireAuth } from "@/components/common/RequireAuth";

export const Route = createFileRoute("/admin")({
  component: () => (
    <RequireAuth adminOnly>
      <Outlet />
    </RequireAuth>
  ),
});
