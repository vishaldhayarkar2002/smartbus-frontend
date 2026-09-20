import { useCallback, useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Clock, MapPin, Star } from "lucide-react";
import { BookingSteps } from "@/components/booking/BookingSteps";
import { ErrorState, LoadingSkeleton } from "@/components/common/StateBlocks";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getScheduleById } from "@/services/busService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSchedule, setBoardingPoint, setDroppingPoint } from "@/store/slices/bookingSlice";
import type { Schedule } from "@/types";
import { busTypeLabel, formatCurrency, formatLongDate } from "@/utils/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_site/bus/$busId")({
  head: () => ({
    meta: [
      { title: "Bus details & boarding points — SmartBus" },
      {
        name: "description",
        content: "Review amenities, timings, boarding and dropping points before choosing seats.",
      },
      { property: "og:title", content: "Bus details & boarding points — SmartBus" },
      {
        property: "og:description",
        content: "Amenities, cancellation policy, boarding and dropping points for your bus.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BusDetailsPage,
});

function BusDetailsPage() {
  const { busId } = Route.useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const journeyDate = useAppSelector((state) => state.search.journeyDate);
  const { boardingPoint, droppingPoint } = useAppSelector((state) => state.booking);

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getScheduleById(Number(busId));
      const withDate = { ...result, journeyDate };
      setSchedule(withDate);
      dispatch(selectSchedule(withDate));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this bus.");
    } finally {
      setLoading(false);
    }
  }, [busId, journeyDate, dispatch]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleContinue() {
    if (!boardingPoint || !droppingPoint) {
      toast.error("Please choose both a boarding and a dropping point.");
      return;
    }
    navigate({ to: "/booking/seat-selection" });
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <LoadingSkeleton rows={3} height="h-32" />
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <ErrorState message={error ?? "Bus not found."} onRetry={() => void load()} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6">
      <BookingSteps current={0} />

      <header className="surface-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight">{schedule.bus.busName}</h1>
              <StatusBadge label={busTypeLabel(schedule.bus.busType)} tone="info" />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {schedule.bus.operator} • {schedule.bus.busNumber}
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="font-semibold">{schedule.departureTime}</span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="size-4" aria-hidden="true" /> {schedule.duration}
              </span>
              <span className="font-semibold">{schedule.arrivalTime}</span>
              <span className="text-muted-foreground">
                {schedule.route.source} → {schedule.route.destination}
              </span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatLongDate(schedule.journeyDate)} • {schedule.availableSeats} seats available
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold">{formatCurrency(schedule.fare)}</p>
            <p className="mt-1 flex items-center justify-end gap-1 text-sm font-semibold text-success">
              <Star className="size-4 fill-current" aria-hidden="true" /> {schedule.rating}
            </p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="points">
        <TabsList>
          <TabsTrigger value="points">Boarding &amp; dropping</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="policy">Cancellation policy</TabsTrigger>
        </TabsList>

        <TabsContent value="points">
          <div className="grid gap-6 md:grid-cols-2">
            <fieldset className="surface-card p-5">
              <legend className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Boarding point
              </legend>
              <RadioGroup
                value={boardingPoint?.id ?? ""}
                onValueChange={(value) => {
                  const point = schedule.boardingPoints.find((p) => p.id === value);
                  if (point) dispatch(setBoardingPoint(point));
                }}
                className="gap-3"
              >
                {schedule.boardingPoints.map((point) => (
                  <div key={point.id} className="flex items-start gap-3">
                    <RadioGroupItem id={`bp-${point.id}`} value={point.id} className="mt-1" />
                    <Label htmlFor={`bp-${point.id}`} className="flex-col items-start gap-0.5 font-normal">
                      <span className="font-semibold">
                        {point.time} — {point.name}
                      </span>
                      {point.landmark ? (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" aria-hidden="true" /> {point.landmark}
                        </span>
                      ) : null}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </fieldset>

            <fieldset className="surface-card p-5">
              <legend className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Dropping point
              </legend>
              <RadioGroup
                value={droppingPoint?.id ?? ""}
                onValueChange={(value) => {
                  const point = schedule.droppingPoints.find((p) => p.id === value);
                  if (point) dispatch(setDroppingPoint(point));
                }}
                className="gap-3"
              >
                {schedule.droppingPoints.map((point) => (
                  <div key={point.id} className="flex items-start gap-3">
                    <RadioGroupItem id={`dp-${point.id}`} value={point.id} className="mt-1" />
                    <Label htmlFor={`dp-${point.id}`} className="flex-col items-start gap-0.5 font-normal">
                      <span className="font-semibold">
                        {point.time} — {point.name}
                      </span>
                      {point.landmark ? (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" aria-hidden="true" /> {point.landmark}
                        </span>
                      ) : null}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </fieldset>
          </div>
        </TabsContent>

        <TabsContent value="amenities">
          <ul className="surface-card grid gap-2 p-5 sm:grid-cols-2">
            {schedule.bus.amenities.map((amenity) => (
              <li key={amenity} className="text-sm">
                • {amenity}
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="policy">
          <ul className="surface-card space-y-2 p-5">
            {schedule.cancellationPolicy.map((line) => (
              <li key={line} className="text-sm text-muted-foreground">
                • {line}
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleContinue}>
          Continue to seats <ArrowRight className="ml-1 size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
