import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, TimerReset } from "lucide-react";
import { BookingSteps } from "@/components/booking/BookingSteps";
import { SeatLayout } from "@/components/booking/SeatLayout";
import { SeatLockTimer } from "@/components/booking/SeatLockTimer";
import { FareSummary } from "@/components/booking/FareSummary";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/common/StateBlocks";
import { Button } from "@/components/ui/button";
import { getSeats } from "@/services/busService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearLockExpiredNotice, toggleSeat } from "@/store/slices/bookingSlice";
import type { Seat } from "@/types";
import { formatLongDate } from "@/utils/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_site/booking/seat-selection")({
  head: () => ({
    meta: [
      { title: "Choose your seats — SmartBus" },
      {
        name: "description",
        content: "Pick seats or berths on the live bus layout. Selected seats are held for 5 minutes.",
      },
      { property: "og:title", content: "Choose your seats — SmartBus" },
      { property: "og:description", content: "Interactive seat map with a 5 minute seat hold." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SeatSelectionPage,
});

const MAX_SEATS = 6;

function SeatSelectionPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedSchedule, selectedSeats, fare, lockExpired, boardingPoint, droppingPoint } =
    useAppSelector((state) => state.booking);

  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!selectedSchedule) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setSeats(await getSeats(selectedSchedule.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the seat layout.");
    } finally {
      setLoading(false);
    }
  }, [selectedSchedule]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleToggle(seat: Seat) {
    const alreadySelected = selectedSeats.some((s) => s.id === seat.id);
    if (!alreadySelected && selectedSeats.length >= MAX_SEATS) {
      toast.error(`You can book up to ${MAX_SEATS} seats in one booking.`);
      return;
    }
    dispatch(toggleSeat(seat));
  }

  if (!selectedSchedule) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <EmptyState
          title="No bus selected"
          description="Search for a bus and open its details to pick seats."
          actionLabel="Search buses"
          onAction={() => navigate({ to: "/search" })}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6">
      <BookingSteps current={1} />

      <header className="surface-card p-5">
        <h1 className="text-xl font-extrabold tracking-tight">
          {selectedSchedule.bus.busName} — choose your seats
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {selectedSchedule.route.source} → {selectedSchedule.route.destination} •{" "}
          {formatLongDate(selectedSchedule.journeyDate)} • {selectedSchedule.departureTime}
        </p>
        {boardingPoint && droppingPoint ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Boarding {boardingPoint.name} ({boardingPoint.time}) • Dropping {droppingPoint.name} (
            {droppingPoint.time})
          </p>
        ) : null}
      </header>

      {lockExpired ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/40 bg-warning/15 px-4 py-3 text-sm"
          role="alert"
        >
          <span className="flex items-center gap-2 font-semibold">
            <TimerReset className="size-4" aria-hidden="true" />
            Your 5 minute seat hold expired, so the selection was released. Please pick your seats
            again.
          </span>
          <Button size="sm" variant="outline" onClick={() => dispatch(clearLockExpiredNotice())}>
            Dismiss
          </Button>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="surface-card p-5">
          {loading ? (
            <LoadingSkeleton rows={3} height="h-24" />
          ) : error ? (
            <ErrorState message={error} onRetry={() => void load()} />
          ) : (
            <SeatLayout
              seats={seats}
              selectedIds={selectedSeats.map((s) => s.id)}
              onToggle={handleToggle}
            />
          )}
        </section>

        <aside className="surface-card h-fit space-y-4 p-5">
          <h2 className="font-bold">Your selection</h2>
          <SeatLockTimer />
          {selectedSeats.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No seats selected yet. Tap a seat on the layout to select it.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {selectedSeats.map((seat) => (
                <li
                  key={seat.id}
                  className="rounded-lg border border-border bg-muted px-2 py-1 text-xs font-semibold"
                >
                  {seat.seatNumber}
                </li>
              ))}
            </ul>
          )}

          {selectedSeats.length > 0 ? <FareSummary fare={fare} seatCount={selectedSeats.length} /> : null}

          <Button
            className="w-full"
            disabled={selectedSeats.length === 0}
            onClick={() => navigate({ to: "/booking/passenger-details" })}
          >
            Continue <ArrowRight className="ml-1 size-4" aria-hidden="true" />
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link to="/bus/$busId" params={{ busId: String(selectedSchedule.id) }}>
              Back to bus details
            </Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
