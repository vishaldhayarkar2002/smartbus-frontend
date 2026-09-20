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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteBus, listBuses, saveBus, toggleBusActive } from "@/services/adminService";
import type { Bus, BusType } from "@/types";
import { BUS_TYPE_LABELS } from "@/utils/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/buses")({
  head: () => ({
    meta: [
      { title: "Manage buses — SmartBus admin" },
      { name: "description", content: "Add, edit, activate and remove buses in the SmartBus fleet." },
      { property: "og:title", content: "Manage buses — SmartBus admin" },
      { property: "og:description", content: "Fleet management for SmartBus operators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminBuses,
});

const emptyBus: Bus = {
  id: 0,
  busNumber: "",
  operator: "",
  busName: "",
  busType: "AC_SLEEPER",
  layoutType: "SLEEPER",
  totalSeats: 30,
  amenities: [],
  active: true,
};

function AdminBuses() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Bus | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBuses(await listBuses());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load buses.");
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
    setBuses(await saveBus(editing));
    toast.success(editing.id ? "Bus updated." : "Bus added.");
    setEditing(null);
  }

  return (
    <AdminShell title="Buses" description="Manage the fleet, seat layout type and availability.">
      <div className="mb-4 flex justify-end">
        <Button onClick={() => setEditing({ ...emptyBus })}>
          <Plus className="mr-2 size-4" aria-hidden="true" /> Add bus
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton rows={3} height="h-16" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <div className="surface-card overflow-x-auto p-5">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th scope="col" className="py-2">Bus</th>
                <th scope="col" className="py-2">Operator</th>
                <th scope="col" className="py-2">Number</th>
                <th scope="col" className="py-2">Type</th>
                <th scope="col" className="py-2">Seats</th>
                <th scope="col" className="py-2">Status</th>
                <th scope="col" className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {buses.map((bus) => (
                <tr key={bus.id} className="border-b border-border/60">
                  <td className="py-2 font-medium">{bus.busName}</td>
                  <td className="py-2">{bus.operator}</td>
                  <td className="py-2">{bus.busNumber}</td>
                  <td className="py-2">{BUS_TYPE_LABELS[bus.busType]}</td>
                  <td className="py-2">{bus.totalSeats}</td>
                  <td className="py-2">
                    <StatusBadge
                      label={bus.active ? "Active" : "Inactive"}
                      tone={bus.active ? "success" : "neutral"}
                    />
                  </td>
                  <td className="py-2">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditing(bus)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => setBuses(await toggleBusActive(bus.id))}
                      >
                        {bus.active ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`Delete ${bus.busName}`}
                        onClick={async () => {
                          setBuses(await deleteBus(bus.id));
                          toast.success("Bus removed.");
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
            <DialogTitle>{editing?.id ? "Edit bus" : "Add bus"}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="busName">Bus name</Label>
                <Input
                  id="busName"
                  required
                  value={editing.busName}
                  onChange={(e) => setEditing({ ...editing, busName: e.target.value })}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="operator">Operator</Label>
                  <Input
                    id="operator"
                    required
                    value={editing.operator}
                    onChange={(e) => setEditing({ ...editing, operator: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="busNumber">Bus number</Label>
                  <Input
                    id="busNumber"
                    required
                    value={editing.busNumber}
                    onChange={(e) => setEditing({ ...editing, busNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="busType">Bus type</Label>
                  <Select
                    value={editing.busType}
                    onValueChange={(value) =>
                      setEditing({
                        ...editing,
                        busType: value as BusType,
                        layoutType: value.includes("SLEEPER") ? "SLEEPER" : "SEATER",
                        totalSeats: value.includes("SLEEPER") ? 30 : 40,
                      })
                    }
                  >
                    <SelectTrigger id="busType" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(BUS_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="totalSeats">Total seats</Label>
                  <Input
                    id="totalSeats"
                    inputMode="numeric"
                    value={String(editing.totalSeats)}
                    onChange={(e) =>
                      setEditing({ ...editing, totalSeats: Number(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="amenities">Amenities (comma separated)</Label>
                <Input
                  id="amenities"
                  value={editing.amenities.join(", ")}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      amenities: e.target.value
                        .split(",")
                        .map((item) => item.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save bus</Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
