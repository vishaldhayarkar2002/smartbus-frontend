/**
 * Mock admin CRUD service, persisted through mockDb (localStorage).
 * Future: /api/admin/buses, /api/admin/routes, /api/admin/schedules, /api/admin/users
 */
import { mockRequest } from "@/services/api";
import { nextId, readTable, writeTable } from "@/services/mockDb";
import type { Bus, BusRoute, Schedule, User } from "@/types";

/* ---------------------------------- buses --------------------------------- */

export async function listBuses(): Promise<Bus[]> {
  return mockRequest(readTable("buses"));
}

export async function saveBus(bus: Bus): Promise<Bus[]> {
  const buses = readTable("buses");
  const next = bus.id
    ? buses.map((b) => (b.id === bus.id ? bus : b))
    : [...buses, { ...bus, id: nextId(buses) }];
  writeTable("buses", next);
  return mockRequest(next, 250);
}

export async function toggleBusActive(id: number): Promise<Bus[]> {
  const next = readTable("buses").map((b) => (b.id === id ? { ...b, active: !b.active } : b));
  writeTable("buses", next);
  return mockRequest(next, 200);
}

export async function deleteBus(id: number): Promise<Bus[]> {
  const next = readTable("buses").filter((b) => b.id !== id);
  writeTable("buses", next);
  return mockRequest(next, 200);
}

/* ---------------------------------- routes -------------------------------- */

export async function listRoutes(): Promise<BusRoute[]> {
  return mockRequest(readTable("routes"));
}

export async function saveRoute(route: BusRoute): Promise<BusRoute[]> {
  const routes = readTable("routes");
  const next = route.id
    ? routes.map((r) => (r.id === route.id ? route : r))
    : [...routes, { ...route, id: nextId(routes) }];
  writeTable("routes", next);
  return mockRequest(next, 250);
}

export async function deleteRoute(id: number): Promise<BusRoute[]> {
  const next = readTable("routes").filter((r) => r.id !== id);
  writeTable("routes", next);
  return mockRequest(next, 200);
}

/* -------------------------------- schedules ------------------------------- */

export async function listSchedules(): Promise<Schedule[]> {
  return mockRequest(readTable("schedules"));
}

export async function saveSchedule(schedule: Schedule): Promise<Schedule[]> {
  const schedules = readTable("schedules");
  const next = schedules.some((s) => s.id === schedule.id)
    ? schedules.map((s) => (s.id === schedule.id ? schedule : s))
    : [...schedules, { ...schedule, id: nextId(schedules) }];
  writeTable("schedules", next);
  return mockRequest(next, 250);
}

export async function toggleScheduleActive(id: number): Promise<Schedule[]> {
  const next = readTable("schedules").map((s) => (s.id === id ? { ...s, active: !s.active } : s));
  writeTable("schedules", next);
  return mockRequest(next, 200);
}

export async function deleteSchedule(id: number): Promise<Schedule[]> {
  const next = readTable("schedules").filter((s) => s.id !== id);
  writeTable("schedules", next);
  return mockRequest(next, 200);
}

/* ---------------------------------- users --------------------------------- */

export async function listUsers(): Promise<User[]> {
  return mockRequest(readTable("users"));
}

export async function toggleUserStatus(id: number): Promise<User[]> {
  const next = readTable("users").map((u) =>
    u.id === id ? { ...u, status: u.status === "ACTIVE" ? ("INACTIVE" as const) : ("ACTIVE" as const) } : u,
  );
  writeTable("users", next);
  return mockRequest(next, 200);
}
