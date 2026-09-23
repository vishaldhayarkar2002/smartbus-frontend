import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/common/StateBlocks";
import { StatusBadge, bookingStatusTone } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllBookings } from "@/services/bookingService";
import type { Booking, BookingStatus } from "@/types";
import { formatCurrency, formatShortDate } from "@/utils/format";

export const Route = createFileRoute("/admin/bookings")({
  head: () => ({
    meta: [
      { title: "All bookings — SmartBus admin" },
      { name: "description", content: "Search, filter and inspect every booking made on SmartBus." },
      { property: "og:title", content: "All bookings — SmartBus admin" },
      { property: "og:description", content: "Booking search with status filters and detail view." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminBookings,
});

function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<BookingStatus | "ALL">("ALL");
  const [sort, setSort] = useState<"NEWEST" | "AMOUNT">("NEWEST");
  const [selected, setSelected] = useState<Booking | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBookings(await getAllBookings());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = bookings.filter((booking) => {
      if (status !== "ALL" && booking.status !== status) return false;
      if (!term) return true;
      return (
        booking.bookingId.toLowerCase().includes(term) ||
        booking.customerName.toLowerCase().includes(term) ||
        booking.source.toLowerCase().includes(term) ||
        booking.destination.toLowerCase().includes(term)
      );
    });
    return [...filtered].sort((a, b) =>
      sort === "AMOUNT" ? b.fare.total - a.fare.total : b.bookedAt.localeCompare(a.bookedAt),
    );
  }, [bookings, query, status, sort]);

  return (
    <AdminShell title="Bookings" description="Every booking across all travellers.">
      <div className="surface-card mb-4 grid gap-4 p-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="booking-search">Search</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="booking-search"
              className="pl-9"
              placeholder="Booking ID, customer or city"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="booking-status">Status</Label>
          <Select value={status} onValueChange={(value) => setStatus(value as BookingStatus | "ALL")}>
            <SelectTrigger id="booking-status" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="booking-sort">Sort by</Label>
          <Select value={sort} onValueChange={(value) => setSort(value as "NEWEST" | "AMOUNT")}>
            <SelectTrigger id="booking-sort" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEWEST">Newest first</SelectItem>
              <SelectItem value="AMOUNT">Highest amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={3} height="h-16" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No bookings match"
          description="Try a different search term or clear the status filter."
        />
      ) : (
        <div className="surface-card overflow-x-auto p-5" tabIndex={0} role="region" aria-label="Scrollable data table">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th scope="col" className="py-2">Booking ID</th>
                <th scope="col" className="py-2">Customer</th>
                <th scope="col" className="py-2">Route</th>
                <th scope="col" className="py-2">Journey</th>
                <th scope="col" className="py-2">Seats</th>
                <th scope="col" className="py-2">Amount</th>
                <th scope="col" className="py-2">Status</th>
                <th scope="col" className="py-2 text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((booking) => (
                <tr key={booking.bookingId} className="border-b border-border/60">
                  <td className="py-2 font-medium">{booking.bookingId}</td>
                  <td className="py-2">{booking.customerName}</td>
                  <td className="py-2">
                    {booking.source} → {booking.destination}
                  </td>
                  <td className="py-2">{formatShortDate(booking.journeyDate)}</td>
                  <td className="py-2">{booking.seats.length}</td>
                  <td className="py-2">{formatCurrency(booking.fare.total)}</td>
                  <td className="py-2">
                    <StatusBadge label={booking.status} tone={bookingStatusTone(booking.status)} />
                  </td>
                  <td className="py-2 text-right">
                    <Button size="sm" variant="outline" onClick={() => setSelected(booking)}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking {selected?.bookingId}</DialogTitle>
          </DialogHeader>
          {selected ? (
            <div className="space-y-2 text-sm">
              <p>
                <strong>{selected.customerName}</strong> • {selected.paymentMethod}
              </p>
              <p className="text-muted-foreground">
                {selected.busName} • {selected.operator}
              </p>
              <p className="text-muted-foreground">
                {selected.source} → {selected.destination} • {formatShortDate(selected.journeyDate)} •{" "}
                {selected.departureTime}
              </p>
              <p className="text-muted-foreground">
                Boarding {selected.boardingPoint.name} • Dropping {selected.droppingPoint.name}
              </p>
              <ul className="mt-2 divide-y divide-border">
                {selected.passengers.map((passenger) => (
                  <li key={passenger.seatId} className="flex justify-between py-1.5">
                    <span>
                      {passenger.name} • {passenger.age} yrs
                    </span>
                    <span className="font-semibold">{passenger.seatNumber}</span>
                  </li>
                ))}
              </ul>
              <p className="pt-2 font-bold">Total {formatCurrency(selected.fare.total)}</p>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
