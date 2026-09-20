import { useCallback, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { ErrorState, LoadingSkeleton } from "@/components/common/StateBlocks";
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
import { deleteRoute, listRoutes, saveRoute } from "@/services/adminService";
import type { BusRoute } from "@/types";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/routes")({
  head: () => ({
    meta: [
      { title: "Manage routes — SmartBus admin" },
      { name: "description", content: "Create and edit the city pairs SmartBus operates." },
      { property: "og:title", content: "Manage routes — SmartBus admin" },
      { property: "og:description", content: "Route distances, durations and status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminRoutes,
});

const emptyRoute: BusRoute = {
  id: 0,
  source: "",
  destination: "",
  distanceKm: 0,
  estimatedDuration: "",
  status: "ACTIVE",
};

function AdminRoutes() {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<BusRoute | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setRoutes(await listRoutes());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load routes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!editing) return;
    setRoutes(await saveRoute(editing));
    toast.success(editing.id ? "Route updated." : "Route added.");
    setEditing(null);
  }

  return (
    <AdminShell title="Routes" description="City pairs, distance and expected travel time.">
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setEditing({ ...emptyRoute })}>
          <Plus className="mr-2 size-4" aria-hidden="true" /> Add route
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton rows={3} height="h-16" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <div className="surface-card overflow-x-auto p-5">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th scope="col" className="py-2">Route</th>
                <th scope="col" className="py-2">Distance</th>
                <th scope="col" className="py-2">Duration</th>
                <th scope="col" className="py-2">Status</th>
                <th scope="col" className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => (
                <tr key={route.id} className="border-b border-border/60">
                  <td className="py-2 font-medium">
                    {route.source} → {route.destination}
                  </td>
                  <td className="py-2">{route.distanceKm} km</td>
                  <td className="py-2">{route.estimatedDuration}</td>
                  <td className="py-2">
                    <StatusBadge
                      label={route.status}
                      tone={route.status === "ACTIVE" ? "success" : "neutral"}
                    />
                  </td>
                  <td className="py-2">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditing(route)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`Delete route ${route.source} to ${route.destination}`}
                        onClick={async () => {
                          setRoutes(await deleteRoute(route.id));
                          toast.success("Route removed.");
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit route" : "Add route"}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="source">From</Label>
                  <Input
                    id="source"
                    required
                    value={editing.source}
                    onChange={(e) => setEditing({ ...editing, source: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="destination">To</Label>
                  <Input
                    id="destination"
                    required
                    value={editing.destination}
                    onChange={(e) => setEditing({ ...editing, destination: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="distance">Distance (km)</Label>
                  <Input
                    id="distance"
                    inputMode="numeric"
                    value={String(editing.distanceKm)}
                    onChange={(e) =>
                      setEditing({ ...editing, distanceKm: Number(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="duration">Duration (e.g. 5h 00m)</Label>
                  <Input
                    id="duration"
                    required
                    value={editing.estimatedDuration}
                    onChange={(e) => setEditing({ ...editing, estimatedDuration: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save route</Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
