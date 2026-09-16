import { Link } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card no-print">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Book intercity bus tickets across India with live seat availability and instant
            confirmation.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Book
          </h2>
          <Link to="/search" className="block text-sm hover:text-primary">
            Search Buses
          </Link>
          <Link to="/my-bookings" className="block text-sm hover:text-primary">
            My Bookings
          </Link>
          <Link to="/profile" className="block text-sm hover:text-primary">
            My Profile
          </Link>
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Company
          </h2>
          <Link to="/help" className="block text-sm hover:text-primary">
            Help &amp; Support
          </Link>
          <Link to="/login" className="block text-sm hover:text-primary">
            Sign in
          </Link>
          <Link to="/register" className="block text-sm hover:text-primary">
            Create account
          </Link>
        </div>
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Contact
          </h2>
          <p className="flex items-center gap-2 text-sm">
            <Phone className="size-4 text-primary" aria-hidden="true" /> 1800 123 4567
          </p>
          <p className="flex items-center gap-2 text-sm">
            <Mail className="size-4 text-primary" aria-hidden="true" /> support@smartbus.in
          </p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © 2026 SmartBus. Demo project built with mock data.
      </div>
    </footer>
  );
}
