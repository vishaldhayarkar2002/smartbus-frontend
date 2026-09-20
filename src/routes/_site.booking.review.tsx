import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Pencil } from "lucide-react";
import { BookingSteps } from "@/components/booking/BookingSteps";
import { SeatLockTimer } from "@/components/booking/SeatLockTimer";
import { FareSummary } from "@/components/booking/FareSummary";
import { EmptyState } from "@/components/common/StateBlocks";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { busTypeLabel, formatLongDate } from "@/utils/format";

export const Route = createFileRoute("/_site/booking/review")({
  head: () => ({
    meta: [
      { title: "Review your booking — SmartBus" },
      {
        name: "description",
        content: "Check journey, passengers and the full fare breakdown before paying.",
      },
      { property: "og:title", content: "Review your booking — SmartBus" },
      { property: "og:description", content: "Journey, passengers and fare breakdown in one view." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <ReviewPage />
    </RequireAuth>
  ),
});

function ReviewPage() {
  const navigate = useNavigate();
  const { selectedSchedule, selectedSeats, passengers, fare, boardingPoint, droppingPoint } =
    useAppSelector((state) => state.booking);

  if (!selectedSchedule || selectedSeats.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <EmptyState
          title="Nothing to review yet"
          description="Start a booking by searching for a bus and selecting seats."
          actionLabel="Search buses"
          onAction={() => navigate({ to: "/search" })}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6">
      <BookingSteps current={3} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold tracking-tight">Review your booking</h1>
        <SeatLockTimer />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <section className="surface-card p-5">
            <h2 className="font-bold">Journey</h2>
            <p className="mt-2 text-sm">
              <strong>{selectedSchedule.bus.busName}</strong> • {selectedSchedule.bus.operator} •{" "}
              {busTypeLabel(selectedSchedule.bus.busType)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedSchedule.route.source} → {selectedSchedule.route.destination} •{" "}
              {formatLongDate(selectedSchedule.journeyDate)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Departs {selectedSchedule.departureTime} • Arrives {selectedSchedule.arrivalTime} • Duration{" "}
              {selectedSchedule.duration}
            </p>
            {boardingPoint && droppingPoint ? (
              <p className="mt-1 text-sm text-muted-foreground">
                Boarding {boardingPoint.name} ({boardingPoint.time}) • Dropping {droppingPoint.name} (
                {droppingPoint.time})
              </p>
            ) : null}
          </section>

          <section className="surface-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Passengers</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate({ to: "/booking/passenger-details" })}
              >
                <Pencil className="mr-1 size-3.5" aria-hidden="true" /> Edit
              </Button>
            </div>
            <ul className="mt-3 divide-y divide-border">
              {passengers.map((passenger) => (
                <li key={passenger.seatId} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span>
                    <span className="font-semibold">{passenger.name}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      • {passenger.age} yrs • {passenger.gender.toLowerCase()}
                    </span>
                  </span>
                  <span className="rounded-lg border border-border bg-muted px-2 py-0.5 text-xs font-semibold">
                    {passenger.seatNumber}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="surface-card p-5">
            <h2 className="font-bold">Cancellation policy</h2>
            <ul className="mt-2 space-y-1">
              {selectedSchedule.cancellationPolicy.map((line) => (
                <li key={line} className="text-sm text-muted-foreground">
                  • {line}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="surface-card h-fit space-y-4 p-5">
          <h2 className="font-bold">Fare breakdown</h2>
          <FareSummary fare={fare} seatCount={selectedSeats.length} />
          <Button className="w-full" onClick={() => navigate({ to: "/payment" })}>
            Proceed to payment <ArrowRight className="ml-1 size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate({ to: "/booking/seat-selection" })}
          >
            Change seats
          </Button>
        </aside>
      </div>
    </div>
  );
}
