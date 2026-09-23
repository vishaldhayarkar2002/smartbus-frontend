/**
 * Mock bus / schedule / seat service, persisted through mockDb (localStorage).
 * Future: GET /api/buses/search, GET /api/buses/{id},
 *         GET /api/schedules/{id}/seats,
 *         POST /api/seats/{seatId}/lock, POST /api/seats/{seatId}/release
 */
import { mockFailure, mockRequest } from "@/services/api";
import { readTable } from "@/services/mockDb";
import { getBookedSeatIds } from "@/services/bookingService";
import { buildSeatMap } from "@/data/mockData";
import type { BusRoute, Schedule, SearchQuery, Seat } from "@/types";

export async function searchBuses(query: SearchQuery): Promise<Schedule[]> {
  // return api.get<Schedule[]>("/buses/search", { params: query }).then(r => r.data)
  const results = readTable("schedules").filter(
    (s) =>
      s.active &&
      s.route.source.toLowerCase() === query.from.trim().toLowerCase() &&
      s.route.destination.toLowerCase() === query.to.trim().toLowerCase(),
  );
  return mockRequest(results.map((s) => ({ ...s, journeyDate: query.journeyDate })));
}

export async function getScheduleById(scheduleId: number): Promise<Schedule> {
  // return api.get<Schedule>(`/buses/${scheduleId}`).then(r => r.data)
  const schedule = readTable("schedules").find((s) => s.id === scheduleId);
  if (!schedule) return mockFailure("We could not find this bus. It may no longer be available.");
  return mockRequest(schedule);
}

/** Seat map with seats from persisted bookings marked as BOOKED. */
export async function getSeats(scheduleId: number, journeyDate?: string): Promise<Seat[]> {
  // return api.get<Seat[]>(`/schedules/${scheduleId}/seats`).then(r => r.data)
  const seats = buildSeatMap(scheduleId);
  if (!seats.length) return mockFailure("Seat layout unavailable for this bus.");
  const sold = getBookedSeatIds(scheduleId, journeyDate);
  return mockRequest(seats.map((s) => (sold.has(s.id) ? { ...s, status: "BOOKED" as const } : s)));
}

export async function lockSeat(seatId: string): Promise<{ seatId: string; lockedUntil: string }> {
  // return api.post(`/seats/${seatId}/lock`).then(r => r.data)
  return mockRequest({ seatId, lockedUntil: new Date(Date.now() + 300_000).toISOString() }, 120);
}

export async function releaseSeat(seatId: string): Promise<{ seatId: string }> {
  // return api.post(`/seats/${seatId}/release`).then(r => r.data)
  return mockRequest({ seatId }, 120);
}

export async function getRoutes(): Promise<BusRoute[]> {
  // return api.get<BusRoute[]>("/routes").then(r => r.data)
  return mockRequest(readTable("routes"));
}

export async function getSchedules(): Promise<Schedule[]> {
  // return api.get<Schedule[]>("/schedules").then(r => r.data)
  return mockRequest(readTable("schedules"));
}
