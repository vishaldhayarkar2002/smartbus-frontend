import { useCallback, useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Ticket } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/common/StateBlocks";
import { RequireAuth } from "@/components/common/RequireAuth";
import { StatusBadge, bookingStatusTone } from "@/components/common/StatusBadge";
import { cancelBooking, getMyBookings } from "@/services/bookingService";
import { useAppSelector } from "@/store/hooks";
import type { Booking, BookingStatus } from "@/types";
import { formatCurrency, formatLongDate } from "@/utils/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_site/my-bookings/")({
  head: () => ({
    meta: [
      { title: "My bookings — SmartBus" },
      {
        name: "description",
        content: "Upcoming, completed and cancelled SmartBus bookings with e-tickets.",
      },
      { property: "og:title", content: "My bookings — SmartBus" },
      { property: "og:description", content: "Manage and cancel your bus bookings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <MyBookingsPage />
    </RequireAuth>
  ),
});

const tabs: { value: BookingStatus; label: string }[] = [
  { value: "CONFIRMED", label: "Upcoming" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function MyBookingsPage() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setBookings(await getMyBookings(user.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your bookings.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCancel(booking: Booking) {
    try {
      await cancelBooking(booking.bookingId);
      toast.success(`Booking ${booking.bookingId} cancelled. Refund follows the policy.`);
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel this booking.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-extrabold tracking-tight">My bookings</h1>

      {loading ? (
        <LoadingSkeleton rows={3} height="h-32" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <Tabs defaultValue="CONFIRMED">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => {
            const list = bookings.filter((booking) => booking.status === tab.value);
            return (
              <TabsContent key={tab.value} value={tab.value} className="space-y-4">
                {list.length === 0 ? (
                  <EmptyState
                    icon={Ticket}
                    title={`No ${tab.label.toLowerCase()} bookings`}
                    description="When you book a trip it will show up here with its e-ticket."
                    actionLabel="Search buses"
                    onAction={() => navigate({ to: "/search" })}
                  />
                ) : (
                  list.map((booking) => (
                    <article key={booking.bookingId} className="surface-card p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-bold">
                              {booking.source} → {booking.destination}
                            </h2>
                            <StatusBadge
                              label={booking.status}
                              tone={bookingStatusTone(booking.status)}
                            />
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {booking.busName} • {booking.operator}
                          </p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {formatLongDate(booking.journeyDate)} • {booking.departureTime} • Seats{" "}
                            {booking.seats.map((seat) => seat.seatNumber).join(", ")}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Booking ID {booking.bookingId}
                          </p>
                        </div>
                        <p className="text-lg font-extrabold">{formatCurrency(booking.fare.total)}</p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link
                            to="/my-bookings/$bookingId"
                            params={{ bookingId: booking.bookingId }}
                          >
                            View details
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link to="/ticket/$bookingId" params={{ bookingId: booking.bookingId }}>
                            E-ticket
                          </Link>
                        </Button>
                        {booking.status === "CONFIRMED" ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm">
                                Cancel booking
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Booking {booking.bookingId} will be cancelled. Refunds follow the
                                  operator policy: free up to 24 hours before departure, 50% between
                                  24 and 6 hours, none within 6 hours.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep booking</AlertDialogCancel>
                                <AlertDialogAction onClick={() => void handleCancel(booking)}>
                                  Yes, cancel
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : null}
                      </div>
                    </article>
                  ))
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
}
