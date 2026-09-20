import { Armchair, BedDouble, Lock, X } from "lucide-react";
import type { Seat, SeatStatus } from "@/types";
import { cn } from "@/lib/utils";
import { formatCurrency, seatTypeLabel } from "@/utils/format";

/**
 * Top-view bus seat layout, rendered entirely from seat data.
 * Reused by the customer seat-selection page and the admin seats page.
 */

const statusStyles: Record<SeatStatus, string> = {
  AVAILABLE: "bg-seat-available text-seat-available-foreground border-border hover:border-primary",
  SELECTED: "bg-seat-selected text-seat-selected-foreground border-seat-selected",
  BOOKED: "bg-seat-booked text-seat-booked-foreground border-transparent cursor-not-allowed",
  LOCKED: "bg-seat-locked text-seat-locked-foreground border-transparent cursor-not-allowed",
};

const statusLabels: Record<SeatStatus, string> = {
  AVAILABLE: "Available",
  SELECTED: "Selected",
  BOOKED: "Booked",
  LOCKED: "On hold",
};

export function SeatLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      {(["AVAILABLE", "SELECTED", "BOOKED", "LOCKED"] as SeatStatus[]).map((status) => (
        <li key={status} className="flex items-center gap-1.5">
          <span
            className={cn("flex size-5 items-center justify-center rounded border", statusStyles[status])}
            aria-hidden="true"
          >
            {status === "BOOKED" ? <X className="size-3" /> : null}
            {status === "LOCKED" ? <Lock className="size-3" /> : null}
          </span>
          {statusLabels[status]}
        </li>
      ))}
    </ul>
  );
}

function SeatButton({
  seat,
  selected,
  onToggle,
  readOnly,
}: {
  seat: Seat;
  selected: boolean;
  onToggle?: ((seat: Seat) => void) | undefined;
  readOnly?: boolean | undefined;
}) {
  const status: SeatStatus = selected ? "SELECTED" : seat.status === "SELECTED" ? "AVAILABLE" : seat.status;
  const disabled = readOnly || status === "BOOKED" || status === "LOCKED";
  const isSleeper = seat.seatType !== "SEATER";
  const Icon = isSleeper ? BedDouble : Armchair;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      aria-label={`Seat ${seat.seatNumber}, ${seatTypeLabel(seat.seatType)}${
        seat.isWindow ? ", window" : ""
      }, ${formatCurrency(seat.price)}, ${statusLabels[status]}`}
      onClick={() => onToggle?.(seat)}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 rounded-md border-2 text-[10px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        isSleeper ? "h-10 w-16 sm:w-20" : "size-10",
        statusStyles[status],
      )}
      title={`${seat.seatNumber} • ${seatTypeLabel(seat.seatType)} • ${formatCurrency(seat.price)}`}
    >
      <span className="flex items-center gap-0.5">
        {status === "BOOKED" ? (
          <X className="size-3" aria-hidden="true" />
        ) : status === "LOCKED" ? (
          <Lock className="size-3" aria-hidden="true" />
        ) : (
          <Icon className="size-3" aria-hidden="true" />
        )}
        {seat.seatNumber}
      </span>
    </button>
  );
}

function DeckGrid({
  seats,
  selectedIds,
  onToggle,
  readOnly,
}: {
  seats: Seat[];
  selectedIds: string[];
  onToggle?: ((seat: Seat) => void) | undefined;
  readOnly?: boolean | undefined;
}) {
  const rows = Array.from(new Set(seats.map((s) => s.position.row))).sort((a, b) => a - b);
  const maxColumn = Math.max(...seats.map((s) => s.position.column));
  // Sleeper: 1 berth | aisle | 2 berths. Seater: 2 seats | aisle | 2 seats.
  const aisleAfter = maxColumn === 3 ? 1 : 2;

  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const rowSeats = seats
          .filter((s) => s.position.row === row)
          .sort((a, b) => a.position.column - b.position.column);
        return (
          <div key={row} className="flex items-center gap-1.5">
            <span className="w-5 text-right text-[10px] text-muted-foreground">{row}</span>
            {rowSeats.map((seat) => (
              <span key={seat.id} className="flex items-center gap-1.5">
                <SeatButton
                  seat={seat}
                  selected={selectedIds.includes(seat.id)}
                  onToggle={onToggle}
                  readOnly={readOnly}
                />
                {seat.position.column === aisleAfter ? (
                  <span className="w-4 sm:w-6" aria-hidden="true" />
                ) : null}
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function SeatLayout({
  seats,
  selectedIds = [],
  onToggle,
  readOnly = false,
}: {
  seats: Seat[];
  selectedIds?: string[] | undefined;
  onToggle?: ((seat: Seat) => void) | undefined;
  readOnly?: boolean | undefined;
}) {
  const lower = seats.filter((s) => s.position.deck === "LOWER");
  const upper = seats.filter((s) => s.position.deck === "UPPER");
  const isSleeper = upper.length > 0;

  return (
    <div className="space-y-5">
      <SeatLegend />
      <div className={cn("grid gap-6", isSleeper && "sm:grid-cols-2")}>
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span>{isSleeper ? "Lower deck" : "Seat map"}</span>
            <span className="flex items-center gap-1">Driver</span>
          </div>
          <div className="overflow-x-auto pb-1">
            <DeckGrid
              seats={lower}
              selectedIds={selectedIds}
              onToggle={onToggle}
              readOnly={readOnly}
            />
          </div>
        </div>
        {isSleeper ? (
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Upper deck
            </div>
            <div className="overflow-x-auto pb-1">
              <DeckGrid
                seats={upper}
                selectedIds={selectedIds}
                onToggle={onToggle}
                readOnly={readOnly}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
