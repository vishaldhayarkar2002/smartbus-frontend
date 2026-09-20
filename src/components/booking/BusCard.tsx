import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Schedule } from "@/types";
import { busTypeLabel, formatCurrency } from "@/utils/format";

export function BusCard({ schedule }: { schedule: Schedule }) {
  return (
    <article className="surface-card p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-bold">{schedule.bus.busName}</h3>
            <StatusBadge label={busTypeLabel(schedule.bus.busType)} tone="info" />
          </div>
          <p className="text-sm text-muted-foreground">{schedule.bus.operator}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <span className="font-semibold">{schedule.departureTime}</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="size-3.5" aria-hidden="true" /> {schedule.duration}
            </span>
            <span className="font-semibold">{schedule.arrivalTime}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-semibold text-success">
              <Star className="size-3.5 fill-current" aria-hidden="true" /> {schedule.rating}
              <span className="font-normal text-muted-foreground">
                ({schedule.totalReviews} ratings)
              </span>
            </span>
            <span>{schedule.availableSeats} seats available</span>
            <span>{schedule.bus.amenities.slice(0, 3).join(" • ")}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
          <p className="text-xl font-extrabold">{formatCurrency(schedule.fare)}</p>
          <Button asChild>
            <Link to="/bus/$busId" params={{ busId: String(schedule.id) }}>
              View seats <ArrowRight className="ml-1 size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
