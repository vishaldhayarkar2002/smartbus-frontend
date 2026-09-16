/**
 * Shared TypeScript models.
 *
 * These interfaces are shaped like the JSON a Spring Boot REST API would
 * return, so swapping the mock services for real Axios calls needs no UI
 * changes.
 */

export type UserRole = "USER" | "ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE";

export interface User {
  id: number;
  fullName: string;
  email: string;
  mobile: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

/** Response of POST /api/auth/login and POST /api/auth/register */
export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
}

export type BusType = "AC_SLEEPER" | "NON_AC_SLEEPER" | "AC_SEATER" | "NON_AC_SEATER";
export type LayoutType = "SEATER" | "SLEEPER";

export interface BusRoute {
  id: number;
  source: string;
  destination: string;
  distanceKm: number;
  estimatedDuration: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface StopPoint {
  id: string;
  name: string;
  time: string;
  landmark?: string;
}

export interface Bus {
  id: number;
  busNumber: string;
  operator: string;
  busName: string;
  busType: BusType;
  layoutType: LayoutType;
  totalSeats: number;
  amenities: string[];
  active: boolean;
}

/** A bus running on a route on a given date — what /api/buses/search returns. */
export interface Schedule {
  id: number;
  bus: Bus;
  route: BusRoute;
  journeyDate: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  fare: number;
  rating: number;
  totalReviews: number;
  availableSeats: number;
  boardingPoints: StopPoint[];
  droppingPoints: StopPoint[];
  cancellationPolicy: string[];
  active: boolean;
}

export type SeatStatus = "AVAILABLE" | "SELECTED" | "BOOKED" | "LOCKED";
export type SeatType = "SEATER" | "SLEEPER_LOWER" | "SLEEPER_UPPER";

export interface SeatPosition {
  row: number;
  column: number;
  deck: "LOWER" | "UPPER";
}

/** Item of GET /api/schedules/{id}/seats */
export interface Seat {
  id: string;
  seatNumber: string;
  seatType: SeatType;
  position: SeatPosition;
  price: number;
  status: SeatStatus;
  isWindow: boolean;
}

export interface Passenger {
  name: string;
  age: number | "";
  gender: "MALE" | "FEMALE" | "OTHER" | "";
  mobile: string;
  seatId: string;
  seatNumber: string;
}

export interface FareBreakdown {
  baseFare: number;
  taxes: number;
  convenienceFee: number;
  total: number;
}

export type BookingStatus = "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type PaymentMethod = "UPI" | "CARD" | "NETBANKING";

/** Response of POST /api/bookings and GET /api/bookings/my */
export interface Booking {
  id: string;
  bookingId: string;
  userId: number;
  customerName: string;
  scheduleId: number;
  operator: string;
  busName: string;
  busType: BusType;
  source: string;
  destination: string;
  journeyDate: string;
  departureTime: string;
  arrivalTime: string;
  boardingPoint: StopPoint;
  droppingPoint: StopPoint;
  seats: { seatId: string; seatNumber: string }[];
  passengers: Passenger[];
  fare: FareBreakdown;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  bookedAt: string;
}

export interface SearchQuery {
  from: string;
  to: string;
  journeyDate: string;
}

export interface BusFilters {
  departureSlots: string[];
  arrivalSlots: string[];
  maxPrice: number;
  ac: boolean;
  nonAc: boolean;
  sleeper: boolean;
  seater: boolean;
  operators: string[];
}

export type SortOption =
  | "PRICE_LOW"
  | "PRICE_HIGH"
  | "EARLIEST_DEPARTURE"
  | "SHORTEST_DURATION"
  | "RATING";

export interface PaymentRequest {
  bookingReference: string;
  amount: number;
  method: PaymentMethod;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  message: string;
}
