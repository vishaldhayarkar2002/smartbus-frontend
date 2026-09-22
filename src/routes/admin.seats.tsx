import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/AdminShell";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/common/StateBlocks";
import { SeatLayout } from "@/components/booking/SeatLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { listSchedules } from "@/services/adminService";
import { getSeats } from "@/services/busService";
import type { Schedule, Seat } from "@/types";
import { busTypeLabel, formatCurrency } from "@/utils/format";

export const Route = createFileRoute("/admin/seats")({
  head: () => ({
    meta: [
      { title: "Seat layouts — SmartBus admin" },
      {
        name: "description",
        content: "Inspect the top-view seat map of any SmartBus departure.",
      },
      { property: "og:title", content: "Seat layouts — SmartBus admin" },
      {
        property: "og:description",
        content: "Deck-by-deck seat map with booked, on-hold and available counts.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminSeats,
});

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
    </div>
  );
}

function AdminSeats() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seatsError, setSeatsError] = useState<string | null>(null);

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listSchedules();
      setSchedules(list);
      if (list[0]) setSelectedId(String(list[0].id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load schedules.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSeats = useCallback(async (scheduleId: string) => {
    if (!scheduleId) return;
    setSeatsLoading(true);
    setSeatsError(null);
    try {
      setSeats(await getSeats(Number(scheduleId)));
    } catch (err) {
      setSeatsError(err instanceof Error ? err.message : "Could not load the seat layout.");
    } finally {
      setSeatsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSchedules();
  }, [loadSchedules]);

  useEffect(() => {
    void loadSeats(selectedId);
  }, [selectedId, loadSeats]);

  const selected = schedules.find((s) => String(s.id) === selectedId);

  const counts = useMemo(
    () => ({
      total: seats.length,
      booked: seats.filter((s) => s.status === "BOOKED").length,
      locked: seats.filter((s) => s.status === "LOCKED").length,
      available: seats.filter((s) => s.status === "AVAILABLE" || s.status === "SELECTED").length,
      window: seats.filter((s) => s.isWindow).length,
    }),
    [seats],
  );

  return (
    <AdminShell
      title="Seat layouts"
      description="The same seat map travellers see, in read-only mode, for every departure."
    >
      {loading ? (
        <LoadingSkeleton rows={3} height="h-24" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void loadSchedules()} />
      ) : schedules.length === 0 ? (
        <EmptyState
          title="No schedules to inspect"
          description="Add a schedule first and its seat layout will appear here."
        />
      ) : (
        <div className="space-y-6">
          <div className="surface-card max-w-md space-y-1.5 p-5">
            <Label htmlFor="schedule">Departure</Label>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger id="schedule">
                <SelectValue placeholder="Choose a departure" />
              </SelectTrigger>
              <SelectContent>
                {schedules.map((schedule) => (
                  <SelectItem key={schedule.id} value={String(schedule.id)}>
                    {schedule.bus.busName} • {schedule.route.source} → {schedule.route.destination}{" "}
                    • {schedule.departureTime}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selected ? (
            <div className="surface-card space-y-2 p-5">
              <h2 className="text-lg font-bold">{selected.bus.busName}</h2>
              <p className="text-sm text-muted-foreground">
                {selected.bus.busNumber} • {busTypeLabel(selected.bus.busType)} •{" "}
                {selected.bus.layoutType === "SLEEPER" ? "Sleeper layout" : "Seater layout"} • base
                fare {formatCurrency(selected.fare)}
              </p>
            </div>
          ) : null}

          {seatsLoading ? (
            <LoadingSkeleton rows={2} height="h-40" />
          ) : seatsError ? (
            <ErrorState message={seatsError} onRetry={() => void loadSeats(selectedId)} />
          ) : seats.length === 0 ? (
            <EmptyState
              title="No seats configured"
              description="This bus has no seat data yet."
            />
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatTile label="Total seats" value={String(counts.total)} />
                <StatTile label="Available" value={String(counts.available)} />
                <StatTile label="Booked" value={String(counts.booked)} />
                <StatTile label="On hold" value={String(counts.locked)} />
              </div>
              <div className="surface-card p-5">
                <SeatLayout seats={seats} readOnly />
                <p className="mt-4 text-xs text-muted-foreground">
                  {counts.window} of {counts.total} seats are window seats. This layout is rendered
                  from seat data, so it follows whatever the bus configuration says.
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </AdminShell>
  );
}
