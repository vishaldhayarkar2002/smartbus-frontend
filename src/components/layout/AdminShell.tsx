import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  BusFront,
  CalendarClock,
  LayoutDashboard,
  Map,
  Ticket,
  Users,
  Armchair,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/buses", label: "Buses", icon: BusFront, exact: false },
  { to: "/admin/routes", label: "Routes", icon: Map, exact: false },
  { to: "/admin/schedules", label: "Schedules", icon: CalendarClock, exact: false },
  { to: "/admin/seats", label: "Seat layouts", icon: Armchair, exact: false },
  { to: "/admin/bookings", label: "Bookings", icon: Ticket, exact: false },
  { to: "/admin/users", label: "Users", icon: Users, exact: false },
] as const;

export function AdminShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/40 lg:flex">
      <aside className="border-b border-border bg-card lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-2 px-4 py-4">
          <Link to="/" aria-label="SmartBus home">
            <Logo />
          </Link>
          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">
            Admin
          </span>
        </div>
        <nav aria-label="Admin navigation" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: link.exact }}
                activeProps={{ className: "bg-primary text-primary-foreground", "aria-current": "page" }}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 px-4 py-6 focus:outline-none lg:px-8">
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </header>
        {children}
      </main>
    </div>
  );
}
