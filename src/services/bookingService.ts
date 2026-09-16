/**
 * Mock booking service.
 * Future: POST /api/bookings, GET /api/bookings/my, GET /api/bookings/{id},
 *         PUT /api/bookings/{id}/cancel
 */
import { mockFailure, mockRequest } from "@/services/api";
import { mockBookings } from "@/data/mockData";
import type { Booking } from "@/types";

/** In-memory store so mock create / cancel survive navigation. */
let bookings: Booking[] = [...mockBookings];

export async function createBooking(booking: Booking): Promise<Booking> {
  // return api.post<Booking>("/bookings", payload).then(r => r.data)
  bookings = [booking, ...bookings];
  return mockRequest(booking, 300);
}

export async function getMyBookings(userId: number): Promise<Booking[]> {
  // return api.get<Booking[]>("/bookings/my").then(r => r.data)
  return mockRequest(bookings.filter((b) => b.userId === userId));
}

export async function getAllBookings(): Promise<Booking[]> {
  // return api.get<Booking[]>("/admin/bookings").then(r => r.data)
  return mockRequest(bookings);
}

export async function getBookingById(bookingId: string): Promise<Booking> {
  // return api.get<Booking>(`/bookings/${bookingId}`).then(r => r.data)
  const booking = bookings.find((b) => b.bookingId === bookingId || b.id === bookingId);
  if (!booking) return mockFailure("Booking not found. Please check the booking ID.");
  return mockRequest(booking);
}

export async function cancelBooking(bookingId: string): Promise<Booking> {
  // return api.put<Booking>(`/bookings/${bookingId}/cancel`).then(r => r.data)
  const booking = bookings.find((b) => b.bookingId === bookingId);
  if (!booking) return mockFailure("Booking not found.");
  if (booking.status !== "CONFIRMED") return mockFailure("Only confirmed bookings can be cancelled.");
  booking.status = "CANCELLED";
  return mockRequest({ ...booking }, 300);
}

/** Generates a booking reference like SB2026092500123. */
export function generateBookingId(journeyDate: string): string {
  const compact = journeyDate.replaceAll("-", "");
  const suffix = String(Math.floor(100 + Math.random() * 899));
  return `SB${compact}00${suffix}`;
}
