/**
 * Mock admin CRUD service.
 * Future: /api/admin/buses, /api/admin/routes, /api/admin/schedules, /api/admin/users
 */
import { mockRequest } from "@/services/api";
import { mockBuses, mockRoutes, mockSchedules, mockUsers } from "@/data/mockData";
import type { Bus, BusRoute, Schedule, User } from "@/types";

let buses: Bus[] = [...mockBuses];
let routes: BusRoute[] = [...mockRoutes];
let schedules: Schedule[] = [...mockSchedules];
let users: User[] = [...mockUsers];

/* ---------------------------------- buses --------------------------------- */

export async function listBuses(): Promise<Bus[]> {
  return mockRequest(buses);
}

export async function saveBus(bus: Bus): Promise<Bus[]> {
  if (bus.id) {
    buses = buses.map((b) => (b.id === bus.id ? bus : b));
  } else {
    buses = [...buses, { ...bus, id: Math.max(0, ...buses.map((b) => b.id)) + 1 }];
  }
  return mockRequest(buses, 250);
}

export async function toggleBusActive(id: number): Promise<Bus[]> {
  buses = buses.map((b) => (b.id === id ? { ...b, active: !b.active } : b));
  return mockRequest(buses, 200);
}

export async function deleteBus(id: number): Promise<Bus[]> {
  buses = buses.filter((b) => b.id !== id);
  return mockRequest(buses, 200);
}

/* ---------------------------------- routes -------------------------------- */

export async function listRoutes(): Promise<BusRoute[]> {
  return mockRequest(routes);
}

export async function saveRoute(route: BusRoute): Promise<BusRoute[]> {
  if (route.id) {
    routes = routes.map((r) => (r.id === route.id ? route : r));
  } else {
    routes = [...routes, { ...route, id: Math.max(0, ...routes.map((r) => r.id)) + 1 }];
  }
  return mockRequest(routes, 250);
}

export async function deleteRoute(id: number): Promise<BusRoute[]> {
  routes = routes.filter((r) => r.id !== id);
  return mockRequest(routes, 200);
}

/* -------------------------------- schedules ------------------------------- */

export async function listSchedules(): Promise<Schedule[]> {
  return mockRequest(schedules);
}

export async function saveSchedule(schedule: Schedule): Promise<Schedule[]> {
  if (schedules.some((s) => s.id === schedule.id)) {
    schedules = schedules.map((s) => (s.id === schedule.id ? schedule : s));
  } else {
    schedules = [...schedules, { ...schedule, id: Math.max(0, ...schedules.map((s) => s.id)) + 1 }];
  }
  return mockRequest(schedules, 250);
}

export async function toggleScheduleActive(id: number): Promise<Schedule[]> {
  schedules = schedules.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
  return mockRequest(schedules, 200);
}

export async function deleteSchedule(id: number): Promise<Schedule[]> {
  schedules = schedules.filter((s) => s.id !== id);
  return mockRequest(schedules, 200);
}

/* ---------------------------------- users --------------------------------- */

export async function listUsers(): Promise<User[]> {
  return mockRequest(users);
}

export async function toggleUserStatus(id: number): Promise<User[]> {
  users = users.map((u) =>
    u.id === id ? { ...u, status: u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : u,
  );
  return mockRequest(users, 200);
}
