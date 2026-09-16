import type { BusType, SeatType } from "@/types";

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** "2026-09-25" -> "25 September 2026" */
export function formatLongDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

/** "2026-09-25" -> "25 Sep 2026" */
export function formatShortDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const BUS_TYPE_LABELS: Record<BusType, string> = {
  AC_SLEEPER: "AC Sleeper",
  NON_AC_SLEEPER: "Non-AC Sleeper",
  AC_SEATER: "AC Seater",
  NON_AC_SEATER: "Non-AC Seater",
};

export function busTypeLabel(type: BusType): string {
  return BUS_TYPE_LABELS[type];
}

export const SEAT_TYPE_LABELS: Record<SeatType, string> = {
  SEATER: "Seater",
  SLEEPER_LOWER: "Lower Sleeper",
  SLEEPER_UPPER: "Upper Sleeper",
};

export function seatTypeLabel(type: SeatType): string {
  return SEAT_TYPE_LABELS[type];
}

/** Converts "10:30 PM" to minutes since midnight, for filtering and sorting. */
export function timeToMinutes(time: string): number {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  if (!match) return 0;
  let hours = Number(match[1]) % 12;
  const minutes = Number(match[2]);
  if (match[3]!.toUpperCase() === "PM") hours += 12;
  return hours * 60 + minutes;
}

/** Converts "5h 15m" to minutes. */
export function durationToMinutes(duration: string): number {
  const match = /(\d+)h\s*(\d+)?m?/.exec(duration);
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2] ?? 0);
}

export function formatCountdown(seconds: number): string {
  const mins = Math.floor(Math.max(seconds, 0) / 60);
  const secs = Math.max(seconds, 0) % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export const TIME_SLOTS = [
  { id: "EARLY", label: "Before 6 AM", from: 0, to: 359 },
  { id: "MORNING", label: "6 AM – 12 PM", from: 360, to: 719 },
  { id: "AFTERNOON", label: "12 PM – 6 PM", from: 720, to: 1079 },
  { id: "NIGHT", label: "After 6 PM", from: 1080, to: 1439 },
];

export function matchesSlot(time: string, slotIds: string[]): boolean {
  if (slotIds.length === 0) return true;
  const minutes = timeToMinutes(time);
  return slotIds.some((id) => {
    const slot = TIME_SLOTS.find((s) => s.id === id);
    return slot ? minutes >= slot.from && minutes <= slot.to : true;
  });
}
