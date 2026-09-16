import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_site/forgot-password")({ component: () => <Outlet /> });
