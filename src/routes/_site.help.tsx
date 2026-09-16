import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_site/help")({ component: () => <Outlet /> });
