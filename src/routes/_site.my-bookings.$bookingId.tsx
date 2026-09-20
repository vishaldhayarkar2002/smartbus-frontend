import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { FareSummary } from "@/components/booking/FareSummary";
import { ErrorState, LoadingSkeleton } from "@/components/common/StateBlocks";
import { RequireAuth } from "@/components/common/RequireAuth";
import { StatusBadge, bookingStatusTone } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { getBookingById } from "@/services/bookingService";
import type { Booking } from "@/types";
import { busTypeLabel, formatDateTime, formatLongDate } from "@/utils/format";

export const Route = createFileRoute("/_site/my-bookings/$bookingId")({
  head: () => ({
    meta: [
      { title: "Booking details — SmartBus" },
      { name: "description", content: "Full details of your SmartBus booking and passengers." },
      { property: "og:title", content: "Booking details — SmartBus" },
      { property: "og:description", content: "Journey, passengers, payment and fare details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <BookingDetailPage />
    </RequireAuth>
  ),
});

function BookingDetailPage() {
  const { bookingId } = Route.useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBooking(await getBookingById(bookingId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this booking.");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <LoadingSkeleton rows={2} height="h-36" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <ErrorState message={error ?? "Booking not found."} onRetry={() => void load()} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-8">
      <Button asChild variant="ghost" size="sm">
        <Link to="/my-bookings">
          <ArrowLeft className="mr-1 size-4" aria-hidden="true" /> All bookings
        </Link>
      </Button>

      <header className="surface-card p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-extrabold tracking-tight">
            {booking.source} → {booking.destination}
          </h1>
          <StatusBadge label={booking.status} tone={bookingStatusTone(booking.status)} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Booking ID {booking.bookingId} • booked {formatDateTime(booking.bookedAt)}
        </p>
      </header>

      <section className="surface-card p-5">
        <h2 className="font-bold">Journey</h2>
        <p className="mt-2 text-sm">
          <strong>{booking.busName}</strong> • {booking.operator} • {busTypeLabel(booking.busType)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatLongDate(booking.journeyDate)} • departs {booking.departureTime} from{" "}
          {booking.boardingPoint.name} • arrives {booking.arrivalTime} at {booking.droppingPoint.name}
        </p>
      </section>

      <section className="surface-card p-5">
        <h2 className="font-bold">Passengers</h2>
        <ul className="mt-2 divide-y divide-border">
          {booking.passengers.map((passenger) => (
            <li key={passenger.seatId} className="flex items-center justify-between py-2 text-sm">
              <span>
                {passenger.name} • {passenger.age} yrs •{" "}
                <span className="capitalize">{passenger.gender.toLowerCase()}</span>
              </span>
              <span className="font-semibold">{passenger.seatNumber}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface-card p-5">
        <h2 className="font-bold">Payment</h2>
        <p className="mt-2 text-sm text-muted-foreground">Paid via {booking.paymentMethod}</p>
        <div className="mt-3 border-t border-border pt-3">
          <FareSummary fare={booking.fare} seatCount={booking.seats.length} />
        </div>
      </section>

      <Button asChild>
        <Link to="/ticket/$bookingId" params={{ bookingId: booking.bookingId }}>
          View e-ticket
        </Link>
      </Button>
    </div>
  );
}
