import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { ErrorState, LoadingSkeleton } from "@/components/common/StateBlocks";
import { QRCodePlaceholder } from "@/components/common/QRCodePlaceholder";
import { RequireAuth } from "@/components/common/RequireAuth";
import { StatusBadge, bookingStatusTone } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { getBookingById } from "@/services/bookingService";
import type { Booking } from "@/types";
import { busTypeLabel, formatCurrency, formatLongDate } from "@/utils/format";

export const Route = createFileRoute("/_site/ticket/$bookingId")({
  head: () => ({
    meta: [
      { title: "Your e-ticket — SmartBus" },
      { name: "description", content: "Printable SmartBus e-ticket with QR code and seat details." },
      { property: "og:title", content: "Your e-ticket — SmartBus" },
      { property: "og:description", content: "Show this e-ticket and QR code while boarding." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <TicketPage />
    </RequireAuth>
  ),
});

function TicketPage() {
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
      setError(err instanceof Error ? err.message : "Could not load this ticket.");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <LoadingSkeleton rows={2} height="h-40" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <ErrorState message={error ?? "Ticket not found."} onRetry={() => void load()} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-10">
      <div className="no-print flex items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold tracking-tight">E-ticket</h1>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 size-4" aria-hidden="true" /> Print / save as PDF
        </Button>
      </div>

      <article className="surface-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-dashed border-border pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              SmartBus e-ticket
            </p>
            <p className="mt-1 text-lg font-extrabold">{booking.bookingId}</p>
            <StatusBadge
              label={booking.status}
              tone={bookingStatusTone(booking.status)}
              className="mt-2"
            />
          </div>
          <QRCodePlaceholder value={booking.bookingId} />
        </div>

        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Passenger</dt>
            <dd className="font-semibold">{booking.customerName}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Journey date</dt>
            <dd className="font-semibold">{formatLongDate(booking.journeyDate)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Bus</dt>
            <dd className="font-semibold">
              {booking.busName} ({busTypeLabel(booking.busType)})
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Operator</dt>
            <dd className="font-semibold">{booking.operator}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Boarding</dt>
            <dd className="font-semibold">
              {booking.boardingPoint.name} • {booking.departureTime}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Dropping</dt>
            <dd className="font-semibold">
              {booking.droppingPoint.name} • {booking.arrivalTime}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Seats</dt>
            <dd className="font-semibold">
              {booking.seats.map((seat) => seat.seatNumber).join(", ")}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase text-muted-foreground">Amount paid</dt>
            <dd className="font-semibold">{formatCurrency(booking.fare.total)}</dd>
          </div>
        </dl>

        <table className="mt-5 w-full text-sm">
          <caption className="mb-2 text-left text-xs uppercase text-muted-foreground">
            Passengers
          </caption>
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
              <th scope="col" className="py-1">Name</th>
              <th scope="col" className="py-1">Age</th>
              <th scope="col" className="py-1">Gender</th>
              <th scope="col" className="py-1">Seat</th>
            </tr>
          </thead>
          <tbody>
            {booking.passengers.map((passenger) => (
              <tr key={passenger.seatId} className="border-b border-border/60">
                <td className="py-1.5">{passenger.name}</td>
                <td className="py-1.5">{passenger.age}</td>
                <td className="py-1.5 capitalize">{passenger.gender.toLowerCase()}</td>
                <td className="py-1.5 font-semibold">{passenger.seatNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-5 text-xs text-muted-foreground">
          Please carry a government photo ID. Reach your boarding point 15 minutes before departure.
        </p>
      </article>
    </div>
  );
}
