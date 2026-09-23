import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BusFront, IndianRupee, Ticket, Users } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { ErrorState, LoadingSkeleton } from "@/components/common/StateBlocks";
import { StatusBadge, bookingStatusTone } from "@/components/common/StatusBadge";
import { getAllBookings } from "@/services/bookingService";
import { listBuses, listUsers } from "@/services/adminService";
import type { Booking } from "@/types";
import { formatCurrency, formatShortDate } from "@/utils/format";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — SmartBus" },
      { name: "description", content: "SmartBus operations overview: users, buses, bookings, revenue." },
      { property: "og:title", content: "Admin dashboard — SmartBus" },
      { property: "og:description", content: "Key SmartBus operating numbers at a glance." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, buses: 0, todayBookings: 0, todayRevenue: 0 });
  const [recent, setRecent] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [users, buses, bookings] = await Promise.all([listUsers(), listBuses(), getAllBookings()]);
      const today = "2026-09-25";
      setStats({
        users: users.length,
        buses: buses.length,
        todayBookings: bookings.filter((b) => b.journeyDate === today).length,
        todayRevenue: bookings
          .filter((b) => b.journeyDate === today && b.status !== "CANCELLED")
          .reduce((sum, b) => sum + b.fare.total, 0),
      });
      setRecent(
        [...bookings].sort((a, b) => b.bookedAt.localeCompare(a.bookedAt)).slice(0, 5),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const tiles = [
    { label: "Registered users", value: String(stats.users), icon: Users },
    { label: "Buses in fleet", value: String(stats.buses), icon: BusFront },
    { label: "Bookings today", value: String(stats.todayBookings), icon: Ticket },
    { label: "Revenue today", value: formatCurrency(stats.todayRevenue), icon: IndianRupee },
  ];

  return (
    <AdminShell title="Dashboard" description="Live snapshot of SmartBus operations.">
      {loading ? (
        <LoadingSkeleton rows={2} height="h-28" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <div className="space-y-6">
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {tiles.map((tile) => {
              const Icon = tile.icon;
              return (
                <li key={tile.label} className="surface-card p-5">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-2xl font-extrabold">{tile.value}</p>
                  <p className="text-sm text-muted-foreground">{tile.label}</p>
                </li>
              );
            })}
          </ul>

          <section className="surface-card p-5">
            <h2 className="font-bold">Recent bookings</h2>
            <div className="mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label="Recent bookings table">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                    <th scope="col" className="py-2">Booking ID</th>
                    <th scope="col" className="py-2">Customer</th>
                    <th scope="col" className="py-2">Route</th>
                    <th scope="col" className="py-2">Journey</th>
                    <th scope="col" className="py-2">Amount</th>
                    <th scope="col" className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((booking) => (
                    <tr key={booking.bookingId} className="border-b border-border/60">
                      <td className="py-2 font-medium">{booking.bookingId}</td>
                      <td className="py-2">{booking.customerName}</td>
                      <td className="py-2">
                        {booking.source} → {booking.destination}
                      </td>
                      <td className="py-2">{formatShortDate(booking.journeyDate)}</td>
                      <td className="py-2">{formatCurrency(booking.fare.total)}</td>
                      <td className="py-2">
                        <StatusBadge
                          label={booking.status}
                          tone={bookingStatusTone(booking.status)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </AdminShell>
  );
}
