import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/common/StateBlocks";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteSchedule,
  listBuses,
  listRoutes,
  listSchedules,
  saveSchedule,
  toggleScheduleActive,
} from "@/services/adminService";
import { DEFAULT_JOURNEY_DATE } from "@/data/mockData";
import type { Bus, BusRoute, Schedule } from "@/types";
import { busTypeLabel, formatCurrency, formatShortDate, timeToMinutes } from "@/utils/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/schedules")({
  head: () => ({
    meta: [
      { title: "Manage schedules — SmartBus admin" },
      {
        name: "description",
        content: "Assign buses to routes with departure times, fares and status.",
      },
      { property: "og:title", content: "Manage schedules — SmartBus admin" },
      {
        property: "og:description",
        content: "Create, edit and retire SmartBus departures for any route.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminSchedules,
});

/** "10:30 PM" + "03:45 AM" -> "5h 15m" */
function computeDuration(departure: string, arrival: string): string {
  const from = timeToMinutes(departure);
  const to = timeToMinutes(arrival);
  const minutes = to >= from ? to - from : 1440 - from + to;
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

function AdminSchedules() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Schedule | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, b, r] = await Promise.all([listSchedules(), listBuses(), listRoutes()]);
      setSchedules(s);
      setBuses(b);
      setRoutes(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load schedules.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function startNew() {
    const bus = buses[0];
    const route = routes[0];
    if (!bus || !route) {
      toast.error("Add at least one bus and one route first.");
      return;
    }
    setEditing({
      id: 0,
      bus,
      route,
      journeyDate: DEFAULT_JOURNEY_DATE,
      departureTime: "10:00 PM",
      arrivalTime: "04:00 AM",
      duration: "6h 00m",
      fare: 900,
      rating: 4.3,
      totalReviews: 0,
      availableSeats: bus.totalSeats,
      boardingPoints: [],
      droppingPoints: [],
      cancellationPolicy: [],
      active: true,
    });
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!editing) return;
    // Reuse the stop points already configured for this route, when we have them.
    const sibling = schedules.find((s) => s.route.id === editing.route.id && s.id !== editing.id);
    const next: Schedule = {
      ...editing,
      duration: computeDuration(editing.departureTime, editing.arrivalTime),
      boardingPoints: editing.boardingPoints.length
        ? editing.boardingPoints
        : (sibling?.boardingPoints ?? []),
      droppingPoints: editing.droppingPoints.length
        ? editing.droppingPoints
        : (sibling?.droppingPoints ?? []),
      cancellationPolicy: editing.cancellationPolicy.length
        ? editing.cancellationPolicy
        : (sibling?.cancellationPolicy ?? []),
    };
    setSchedules(await saveSchedule(next));
    toast.success(editing.id ? "Schedule updated." : "Schedule added.");
    setEditing(null);
  }

  return (
    <AdminShell
      title="Schedules"
      description="Which bus runs on which route, at what time and for what fare."
    >
      <div className="mb-4 flex justify-end">
        <Button onClick={startNew} disabled={loading}>
          <Plus className="mr-2 size-4" aria-hidden="true" /> Add schedule
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} height="h-16" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : schedules.length === 0 ? (
        <EmptyState
          title="No schedules yet"
          description="Add a schedule to make a bus bookable on a route."
        />
      ) : (
        <div className="surface-card overflow-x-auto p-5">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th scope="col" className="py-2">Route</th>
                <th scope="col" className="py-2">Bus</th>
                <th scope="col" className="py-2">Date</th>
                <th scope="col" className="py-2">Departs</th>
                <th scope="col" className="py-2">Arrives</th>
                <th scope="col" className="py-2">Duration</th>
                <th scope="col" className="py-2">Fare</th>
                <th scope="col" className="py-2">Status</th>
                <th scope="col" className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="border-b border-border/60">
                  <td className="py-2 font-medium">
                    {schedule.route.source} → {schedule.route.destination}
                  </td>
                  <td className="py-2">
                    <span className="block font-medium">{schedule.bus.busName}</span>
                    <span className="text-xs text-muted-foreground">
                      {schedule.bus.busNumber} • {busTypeLabel(schedule.bus.busType)}
                    </span>
                  </td>
                  <td className="py-2">{formatShortDate(schedule.journeyDate)}</td>
                  <td className="py-2">{schedule.departureTime}</td>
                  <td className="py-2">{schedule.arrivalTime}</td>
                  <td className="py-2">{schedule.duration}</td>
                  <td className="py-2">{formatCurrency(schedule.fare)}</td>
                  <td className="py-2">
                    <StatusBadge
                      label={schedule.active ? "ACTIVE" : "INACTIVE"}
                      tone={schedule.active ? "success" : "neutral"}
                    />
                  </td>
                  <td className="py-2">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditing(schedule)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          setSchedules(await toggleScheduleActive(schedule.id));
                          toast.success(schedule.active ? "Schedule paused." : "Schedule resumed.");
                        }}
                      >
                        {schedule.active ? "Pause" : "Resume"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`Delete schedule ${schedule.id}`}
                        onClick={async () => {
                          setSchedules(await deleteSchedule(schedule.id));
                          toast.success("Schedule removed.");
                        }}
                      >
                        <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit schedule" : "Add schedule"}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="route">Route</Label>
                  <Select
                    value={String(editing.route.id)}
                    onValueChange={(value) => {
                      const route = routes.find((r) => String(r.id) === value);
                      if (route) setEditing({ ...editing, route });
                    }}
                  >
                    <SelectTrigger id="route">
                      <SelectValue placeholder="Choose route" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((route) => (
                        <SelectItem key={route.id} value={String(route.id)}>
                          {route.source} → {route.destination}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bus">Bus</Label>
                  <Select
                    value={String(editing.bus.id)}
                    onValueChange={(value) => {
                      const bus = buses.find((b) => String(b.id) === value);
                      if (bus) setEditing({ ...editing, bus, availableSeats: bus.totalSeats });
                    }}
                  >
                    <SelectTrigger id="bus">
                      <SelectValue placeholder="Choose bus" />
                    </SelectTrigger>
                    <SelectContent>
                      {buses.map((bus) => (
                        <SelectItem key={bus.id} value={String(bus.id)}>
                          {bus.busName} ({bus.busNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="journeyDate">Journey date</Label>
                  <Input
                    id="journeyDate"
                    type="date"
                    required
                    value={editing.journeyDate}
                    onChange={(e) => setEditing({ ...editing, journeyDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fare">Fare (₹)</Label>
                  <Input
                    id="fare"
                    inputMode="numeric"
                    required
                    value={String(editing.fare)}
                    onChange={(e) => setEditing({ ...editing, fare: Number(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="departureTime">Departure (e.g. 10:30 PM)</Label>
                  <Input
                    id="departureTime"
                    required
                    value={editing.departureTime}
                    onChange={(e) => setEditing({ ...editing, departureTime: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="arrivalTime">Arrival (e.g. 04:45 AM)</Label>
                  <Input
                    id="arrivalTime"
                    required
                    value={editing.arrivalTime}
                    onChange={(e) => setEditing({ ...editing, arrivalTime: e.target.value })}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Travel time is calculated automatically:{" "}
                <strong>{computeDuration(editing.departureTime, editing.arrivalTime)}</strong>
              </p>
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <Label htmlFor="active" className="mb-0">
                  Bookable
                </Label>
                <Switch
                  id="active"
                  checked={editing.active}
                  onCheckedChange={(checked) => setEditing({ ...editing, active: checked })}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save schedule</Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
