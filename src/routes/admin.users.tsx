import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/common/StateBlocks";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listUsers, toggleUserStatus } from "@/services/adminService";
import type { User } from "@/types";
import { formatShortDate } from "@/utils/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "Manage users — SmartBus admin" },
      {
        name: "description",
        content: "Search SmartBus travellers and admins, and activate or deactivate accounts.",
      },
      { property: "og:title", content: "Manage users — SmartBus admin" },
      {
        property: "og:description",
        content: "Account list with role, status, contact details and join date.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminUsers,
});

function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [viewing, setViewing] = useState<User | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await listUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesTerm =
        term === "" ||
        user.fullName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.mobile.includes(term);
      const matchesRole = role === "ALL" || user.role === role;
      const matchesStatus = status === "ALL" || user.status === status;
      return matchesTerm && matchesRole && matchesStatus;
    });
  }, [users, query, role, status]);

  return (
    <AdminShell
      title="Users"
      description="Traveller and administrator accounts registered on SmartBus."
    >
      <div className="surface-card mb-5 grid gap-4 p-5 sm:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-1">
          <Label htmlFor="userSearch">Search</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id="userSearch"
              className="pl-9"
              placeholder="Name, email or mobile"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="roleFilter">Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="roleFilter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All roles</SelectItem>
              <SelectItem value="USER">Traveller</SelectItem>
              <SelectItem value="ADMIN">Administrator</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="statusFilter">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="statusFilter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Deactivated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} height="h-16" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : visible.length === 0 ? (
        <EmptyState
          title="No matching users"
          description="Try a different name, role or status."
        />
      ) : (
        <div className="surface-card overflow-x-auto p-5" tabIndex={0} role="region" aria-label="Scrollable data table">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-muted-foreground">
                <th scope="col" className="py-2">Name</th>
                <th scope="col" className="py-2">Contact</th>
                <th scope="col" className="py-2">Role</th>
                <th scope="col" className="py-2">Joined</th>
                <th scope="col" className="py-2">Status</th>
                <th scope="col" className="py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((user) => (
                <tr key={user.id} className="border-b border-border/60">
                  <td className="py-2 font-medium">{user.fullName}</td>
                  <td className="py-2">
                    <span className="block">{user.email}</span>
                    <span className="text-xs text-muted-foreground">{user.mobile}</span>
                  </td>
                  <td className="py-2">
                    <StatusBadge
                      label={user.role === "ADMIN" ? "ADMIN" : "TRAVELLER"}
                      tone={user.role === "ADMIN" ? "info" : "neutral"}
                    />
                  </td>
                  <td className="py-2">{formatShortDate(user.createdAt)}</td>
                  <td className="py-2">
                    <StatusBadge
                      label={user.status}
                      tone={user.status === "ACTIVE" ? "success" : "danger"}
                    />
                  </td>
                  <td className="py-2">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setViewing(user)}>
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant={user.status === "ACTIVE" ? "ghost" : "default"}
                        onClick={async () => {
                          setUsers(await toggleUserStatus(user.id));
                          toast.success(
                            user.status === "ACTIVE"
                              ? `${user.fullName} deactivated.`
                              : `${user.fullName} activated.`,
                          );
                        }}
                      >
                        {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={viewing !== null} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.fullName}</DialogTitle>
          </DialogHeader>
          {viewing ? (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium">{viewing.email}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Mobile</dt>
                <dd className="font-medium">{viewing.mobile}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Role</dt>
                <dd className="font-medium">
                  {viewing.role === "ADMIN" ? "Administrator" : "Traveller"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Account status</dt>
                <dd className="font-medium">
                  {viewing.status === "ACTIVE" ? "Active" : "Deactivated"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Joined</dt>
                <dd className="font-medium">{formatShortDate(viewing.createdAt)}</dd>
              </div>
              <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                Deactivated accounts cannot sign in or make new bookings. Existing tickets stay
                valid.
              </p>
            </dl>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
}
