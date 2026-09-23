/**
 * Mock booking service, persisted through mockDb (localStorage).
 * Future: POST /api/bookings, GET /api/bookings/my, GET /api/bookings/{id},
 *         PUT /api/bookings/{id}/cancel
 */
import { mockFailure, mockRequest } from "@/services/api";
import { readTable, writeTable } from "@/services/mockDb";
import type { Booking } from "@/types";

export async function createBooking(booking: Booking): Promise<Booking> {
  // return api.post<Booking>("/bookings", payload).then(r => r.data)
  writeTable("bookings", [booking, ...readTable("bookings")]);
  return mockRequest(booking, 300);
}

export async function getMyBookings(userId: number): Promise<Booking[]> {
  // return api.get<Booking[]>("/bookings/my").then(r => r.data)
  return mockRequest(readTable("bookings").filter((b) => b.userId === userId));
}

export async function getAllBookings(): Promise<Booking[]> {
  // return api.get<Booking[]>("/admin/bookings").then(r => r.data)
  return mockRequest(readTable("bookings"));
}

export async function getBookingById(bookingId: string): Promise<Booking> {
  // return api.get<Booking>(`/bookings/${bookingId}`).then(r => r.data)
  const booking = readTable("bookings").find((b) => b.bookingId === bookingId || b.id === bookingId);
  if (!booking) return mockFailure("Booking not found. Please check the booking ID.");
  return mockRequest(booking);
}

export async function cancelBooking(bookingId: string): Promise<Booking> {
  // return api.put<Booking>(`/bookings/${bookingId}/cancel`).then(r => r.data)
  const bookings = readTable("bookings");
  const booking = bookings.find((b) => b.bookingId === bookingId);
  if (!booking) return mockFailure("Booking not found.");
  if (booking.status !== "CONFIRMED") return mockFailure("Only confirmed bookings can be cancelled.");
  const updated: Booking = { ...booking, status: "CANCELLED" };
  writeTable("bookings", bookings.map((b) => (b.bookingId === bookingId ? updated : b)));
  return mockRequest(updated, 300);
}

/** Seat IDs already sold on a schedule + date (cancelled bookings free their seats). */
export function getBookedSeatIds(scheduleId: number, journeyDate?: string): Set<string> {
  return new Set(
    readTable("bookings")
      .filter(
        (b) =>
          b.scheduleId === scheduleId &&
          b.status !== "CANCELLED" &&
          (!journeyDate || b.journeyDate === journeyDate),
      )
      .flatMap((b) => b.seats.map((s) => s.seatId)),
  );
}

/** Generates a booking reference like SB2026092500123. */
export function generateBookingId(journeyDate: string): string {
  const compact = journeyDate.replaceAll("-", "");
  const suffix = String(Math.floor(100 + Math.random() * 899));
  return `SB${compact}00${suffix}`;
}
