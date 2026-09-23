/**
 * Browser persistence layer for the mock services.
 *
 * Each collection mirrors a future Spring Boot table/endpoint and is stored in
 * localStorage so bookings, admin edits and new users survive page refreshes.
 * When the real API is connected, delete this file and call `api` instead —
 * the service function signatures stay the same, so no UI changes are needed.
 */
import {
  mockBookings,
  mockBuses,
  mockRoutes,
  mockSchedules,
  mockUsers,
} from "@/data/mockData";
import type { Booking, Bus, BusRoute, Schedule, User } from "@/types";

interface Collections {
  users: User[];
  buses: Bus[];
  routes: BusRoute[];
  schedules: Schedule[];
  bookings: Booking[];
}

const PREFIX = "smartbus.db.";
const SEEDS: { [K in keyof Collections]: () => Collections[K] } = {
  users: () => structuredClone(mockUsers),
  buses: () => structuredClone(mockBuses),
  routes: () => structuredClone(mockRoutes),
  schedules: () => structuredClone(mockSchedules),
  bookings: () => structuredClone(mockBookings),
};

const memory: Partial<Collections> = {};

export function readTable<K extends keyof Collections>(name: K): Collections[K] {
  if (typeof window === "undefined") return (memory[name] ??= SEEDS[name]()) as Collections[K];
  try {
    const raw = window.localStorage.getItem(PREFIX + name);
    if (raw) return JSON.parse(raw) as Collections[K];
  } catch {
    // corrupted storage: fall back to seed data
  }
  const seeded = SEEDS[name]();
  writeTable(name, seeded);
  return seeded;
}

export function writeTable<K extends keyof Collections>(name: K, rows: Collections[K]): void {
  if (typeof window === "undefined") {
    memory[name] = rows;
    return;
  }
  window.localStorage.setItem(PREFIX + name, JSON.stringify(rows));
}

/** Clears every persisted table so the demo returns to its seed data. */
export function resetDatabase(): void {
  if (typeof window === "undefined") return;
  (Object.keys(SEEDS) as (keyof Collections)[]).forEach((k) =>
    window.localStorage.removeItem(PREFIX + k),
  );
}

export function nextId(rows: { id: number }[]): number {
  return Math.max(0, ...rows.map((r) => r.id)) + 1;
}
