import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Ticket } from "lucide-react";
import { FareSummary } from "@/components/booking/FareSummary";
import { EmptyState } from "@/components/common/StateBlocks";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetBooking } from "@/store/slices/bookingSlice";
import { formatLongDate } from "@/utils/format";

export const Route = createFileRoute("/_site/booking/confirmation")({
  head: () => ({
    meta: [
      { title: "Booking confirmed — SmartBus" },
      { name: "description", content: "Your SmartBus booking is confirmed. View your e-ticket." },
      { property: "og:title", content: "Booking confirmed — SmartBus" },
      { property: "og:description", content: "Booking reference, journey details and e-ticket link." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <ConfirmationPage />
    </RequireAuth>
  ),
});

function ConfirmationPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const booking = useAppSelector((state) => state.booking.confirmedBooking);

  if (!booking) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <EmptyState
          title="No recent booking"
          description="Once you complete a payment, your confirmation appears here."
          actionLabel="Search buses"
          onAction={() => navigate({ to: "/search" })}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-10">
      <div className="surface-card flex flex-col items-center gap-3 p-8 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-8" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight">Booking confirmed</h1>
        <p className="text-sm text-muted-foreground">
          Your seats are reserved. A confirmation has been sent to your registered email.
        </p>
        <p className="rounded-xl border border-dashed border-border bg-muted/50 px-4 py-2 text-sm">
          Booking ID <strong>{booking.bookingId}</strong>
        </p>
      </div>

      <section className="surface-card p-5">
        <h2 className="font-bold">Journey</h2>
        <p className="mt-2 text-sm">
          <strong>{booking.busName}</strong> • {booking.operator}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {booking.source} → {booking.destination} • {formatLongDate(booking.journeyDate)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Departs {booking.departureTime} from {booking.boardingPoint.name} • Arrives{" "}
          {booking.arrivalTime} at {booking.droppingPoint.name}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Seats: {booking.seats.map((seat) => seat.seatNumber).join(", ")}
        </p>
        <div className="mt-4 border-t border-border pt-4">
          <FareSummary fare={booking.fare} seatCount={booking.seats.length} />
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/ticket/$bookingId" params={{ bookingId: booking.bookingId }}>
            <Ticket className="mr-2 size-4" aria-hidden="true" /> View e-ticket
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/my-bookings">My bookings</Link>
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            dispatch(resetBooking());
            navigate({ to: "/" });
          }}
        >
          Book another trip
        </Button>
      </div>
    </div>
  );
}
