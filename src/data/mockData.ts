/**
 * Centralised mock data. Nothing else in the app should hardcode datasets.
 * Every export here mirrors a future Spring Boot response payload.
 */
import type {
  Booking,
  Bus,
  BusRoute,
  Schedule,
  Seat,
  SeatType,
  StopPoint,
  User,
} from "@/types";

export const DEMO_CREDENTIALS = {
  user: { email: "traveller@smartbus.in", password: "user123" },
  admin: { email: "admin@smartbus.in", password: "admin123" },
};

export const CITIES = [
  "Pune",
  "Mumbai",
  "Bangalore",
  "Goa",
  "Nashik",
  "Hyderabad",
  "Ahmedabad",
  "Nagpur",
];

export const mockUsers: User[] = [
  {
    id: 1,
    fullName: "Vaishali Dhayarkar",
    email: "traveller@smartbus.in",
    mobile: "9876543210",
    role: "USER",
    status: "ACTIVE",
    createdAt: "2026-01-12",
  },
  {
    id: 2,
    fullName: "SmartBus Admin",
    email: "admin@smartbus.in",
    mobile: "9822012345",
    role: "ADMIN",
    status: "ACTIVE",
    createdAt: "2025-11-02",
  },
  {
    id: 3,
    fullName: "Rohit Kulkarni",
    email: "rohit.k@example.com",
    mobile: "9765432101",
    role: "USER",
    status: "ACTIVE",
    createdAt: "2026-02-20",
  },
  {
    id: 4,
    fullName: "Sneha Patil",
    email: "sneha.patil@example.com",
    mobile: "9700112233",
    role: "USER",
    status: "INACTIVE",
    createdAt: "2026-03-05",
  },
  {
    id: 5,
    fullName: "Imran Shaikh",
    email: "imran.shaikh@example.com",
    mobile: "9812345678",
    role: "USER",
    status: "ACTIVE",
    createdAt: "2026-04-18",
  },
];

export const mockRoutes: BusRoute[] = [
  {
    id: 1,
    source: "Pune",
    destination: "Mumbai",
    distanceKm: 148,
    estimatedDuration: "5h 00m",
    status: "ACTIVE",
  },
  {
    id: 2,
    source: "Mumbai",
    destination: "Pune",
    distanceKm: 148,
    estimatedDuration: "4h 45m",
    status: "ACTIVE",
  },
  {
    id: 3,
    source: "Pune",
    destination: "Bangalore",
    distanceKm: 840,
    estimatedDuration: "13h 30m",
    status: "ACTIVE",
  },
  {
    id: 4,
    source: "Mumbai",
    destination: "Goa",
    distanceKm: 590,
    estimatedDuration: "11h 15m",
    status: "ACTIVE",
  },
  {
    id: 5,
    source: "Pune",
    destination: "Nashik",
    distanceKm: 210,
    estimatedDuration: "4h 30m",
    status: "INACTIVE",
  },
];

export const mockBuses: Bus[] = [
  {
    id: 1,
    busNumber: "MH12 AB 4521",
    operator: "Neeta Travels",
    busName: "Neeta Volvo 9600",
    busType: "AC_SLEEPER",
    layoutType: "SLEEPER",
    totalSeats: 30,
    amenities: ["Water Bottle", "Charging Point", "Blanket", "Reading Light", "CCTV"],
    active: true,
  },
  {
    id: 2,
    busNumber: "MH14 CD 7788",
    operator: "Purple Travels",
    busName: "Purple Luxury Sleeper",
    busType: "AC_SLEEPER",
    layoutType: "SLEEPER",
    totalSeats: 30,
    amenities: ["Water Bottle", "Charging Point", "Wi-Fi", "Live Tracking"],
    active: true,
  },
  {
    id: 3,
    busNumber: "MH12 EF 1290",
    operator: "Shivneri Travels",
    busName: "Shivneri AC Seater",
    busType: "AC_SEATER",
    layoutType: "SEATER",
    totalSeats: 40,
    amenities: ["Charging Point", "Water Bottle", "Emergency Exit"],
    active: true,
  },
  {
    id: 4,
    busNumber: "MH04 GH 3344",
    operator: "Konduskar Travels",
    busName: "Konduskar Non-AC Seater",
    busType: "NON_AC_SEATER",
    layoutType: "SEATER",
    totalSeats: 40,
    amenities: ["Reading Light", "Emergency Exit"],
    active: true,
  },
  {
    id: 5,
    busNumber: "KA05 JK 9021",
    operator: "VRL Travels",
    busName: "VRL Multi-Axle Sleeper",
    busType: "NON_AC_SLEEPER",
    layoutType: "SLEEPER",
    totalSeats: 30,
    amenities: ["Blanket", "Charging Point", "CCTV"],
    active: true,
  },
  {
    id: 6,
    busNumber: "MH12 LM 6655",
    operator: "Orange Tours",
    busName: "Orange Volvo Multi-Axle",
    busType: "AC_SEATER",
    layoutType: "SEATER",
    totalSeats: 40,
    amenities: ["Wi-Fi", "Charging Point", "Water Bottle", "Snacks"],
    active: false,
  },
];

const puneBoarding: StopPoint[] = [
  { id: "bp-wakad", name: "Wakad", time: "9:45 PM", landmark: "Bridge, near Dange Chowk" },
  { id: "bp-hinjewadi", name: "Hinjewadi", time: "10:00 PM", landmark: "Phase 1 Gate" },
  { id: "bp-shivajinagar", name: "Shivajinagar", time: "10:30 PM", landmark: "ST Stand" },
];

const mumbaiDropping: StopPoint[] = [
  { id: "dp-dadar", name: "Dadar", time: "3:00 AM", landmark: "Swaminarayan Temple" },
  { id: "dp-sion", name: "Sion", time: "3:20 AM", landmark: "Sion Circle" },
  { id: "dp-borivali", name: "Borivali", time: "4:00 AM", landmark: "National Park" },
];

const mumbaiBoarding: StopPoint[] = [
  { id: "bp-borivali", name: "Borivali", time: "8:30 PM", landmark: "National Park" },
  { id: "bp-sion", name: "Sion", time: "9:10 PM", landmark: "Sion Circle" },
  { id: "bp-dadar", name: "Dadar", time: "9:30 PM", landmark: "Swaminarayan Temple" },
];

const puneDropping: StopPoint[] = [
  { id: "dp-shivajinagar", name: "Shivajinagar", time: "1:45 AM", landmark: "ST Stand" },
  { id: "dp-hinjewadi", name: "Hinjewadi", time: "2:10 AM", landmark: "Phase 1 Gate" },
  { id: "dp-wakad", name: "Wakad", time: "2:30 AM", landmark: "Dange Chowk" },
];

const standardPolicy = [
  "Free cancellation up to 24 hours before departure.",
  "50% refund between 24 and 6 hours before departure.",
  "No refund within 6 hours of departure.",
];

export const DEFAULT_JOURNEY_DATE = "2026-09-25";

function bus(id: number): Bus {
  return mockBuses.find((b) => b.id === id)!;
}
function route(id: number): BusRoute {
  return mockRoutes.find((r) => r.id === id)!;
}

export const mockSchedules: Schedule[] = [
  {
    id: 101,
    bus: bus(1),
    route: route(1),
    journeyDate: DEFAULT_JOURNEY_DATE,
    departureTime: "10:30 PM",
    arrivalTime: "3:30 AM",
    duration: "5h 00m",
    fare: 799,
    rating: 4.5,
    totalReviews: 1284,
    availableSeats: 24,
    boardingPoints: puneBoarding,
    droppingPoints: mumbaiDropping,
    cancellationPolicy: standardPolicy,
    active: true,
  },
  {
    id: 102,
    bus: bus(2),
    route: route(1),
    journeyDate: DEFAULT_JOURNEY_DATE,
    departureTime: "11:45 PM",
    arrivalTime: "4:30 AM",
    duration: "4h 45m",
    fare: 949,
    rating: 4.3,
    totalReviews: 812,
    availableSeats: 18,
    boardingPoints: puneBoarding.map((p) => ({ ...p, time: "11:00 PM" })),
    droppingPoints: mumbaiDropping.map((p) => ({ ...p, time: "4:15 AM" })),
    cancellationPolicy: standardPolicy,
    active: true,
  },
  {
    id: 103,
    bus: bus(3),
    route: route(1),
    journeyDate: DEFAULT_JOURNEY_DATE,
    departureTime: "6:15 AM",
    arrivalTime: "10:45 AM",
    duration: "4h 30m",
    fare: 549,
    rating: 4.1,
    totalReviews: 640,
    availableSeats: 32,
    boardingPoints: [
      { id: "bp-wakad", name: "Wakad", time: "6:00 AM", landmark: "Dange Chowk" },
      { id: "bp-hinjewadi", name: "Hinjewadi", time: "6:15 AM", landmark: "Phase 1 Gate" },
      { id: "bp-shivajinagar", name: "Shivajinagar", time: "6:45 AM", landmark: "ST Stand" },
    ],
    droppingPoints: [
      { id: "dp-dadar", name: "Dadar", time: "10:15 AM", landmark: "Swaminarayan Temple" },
      { id: "dp-sion", name: "Sion", time: "10:30 AM", landmark: "Sion Circle" },
      { id: "dp-borivali", name: "Borivali", time: "11:00 AM", landmark: "National Park" },
    ],
    cancellationPolicy: standardPolicy,
    active: true,
  },
  {
    id: 104,
    bus: bus(4),
    route: route(1),
    journeyDate: DEFAULT_JOURNEY_DATE,
    departureTime: "2:30 PM",
    arrivalTime: "7:45 PM",
    duration: "5h 15m",
    fare: 399,
    rating: 3.8,
    totalReviews: 421,
    availableSeats: 27,
    boardingPoints: [
      { id: "bp-wakad", name: "Wakad", time: "2:15 PM", landmark: "Dange Chowk" },
      { id: "bp-shivajinagar", name: "Shivajinagar", time: "2:45 PM", landmark: "ST Stand" },
    ],
    droppingPoints: [
      { id: "dp-sion", name: "Sion", time: "7:20 PM", landmark: "Sion Circle" },
      { id: "dp-dadar", name: "Dadar", time: "7:45 PM", landmark: "Swaminarayan Temple" },
    ],
    cancellationPolicy: standardPolicy,
    active: true,
  },
  {
    id: 105,
    bus: bus(5),
    route: route(2),
    journeyDate: DEFAULT_JOURNEY_DATE,
    departureTime: "9:30 PM",
    arrivalTime: "2:30 AM",
    duration: "5h 00m",
    fare: 699,
    rating: 4.0,
    totalReviews: 512,
    availableSeats: 21,
    boardingPoints: mumbaiBoarding,
    droppingPoints: puneDropping,
    cancellationPolicy: standardPolicy,
    active: true,
  },
  {
    id: 106,
    bus: bus(1),
    route: route(2),
    journeyDate: DEFAULT_JOURNEY_DATE,
    departureTime: "11:00 PM",
    arrivalTime: "3:45 AM",
    duration: "4h 45m",
    fare: 849,
    rating: 4.6,
    totalReviews: 990,
    availableSeats: 26,
    boardingPoints: mumbaiBoarding,
    droppingPoints: puneDropping,
    cancellationPolicy: standardPolicy,
    active: true,
  },
  {
    id: 107,
    bus: bus(5),
    route: route(3),
    journeyDate: DEFAULT_JOURNEY_DATE,
    departureTime: "7:00 PM",
    arrivalTime: "8:30 AM",
    duration: "13h 30m",
    fare: 1499,
    rating: 4.2,
    totalReviews: 733,
    availableSeats: 19,
    boardingPoints: [
      { id: "bp-katraj", name: "Katraj", time: "7:00 PM", landmark: "Dairy Chowk" },
      { id: "bp-swargate", name: "Swargate", time: "7:30 PM", landmark: "ST Stand" },
    ],
    droppingPoints: [
      { id: "dp-hebbal", name: "Hebbal", time: "7:45 AM", landmark: "Flyover" },
      { id: "dp-majestic", name: "Majestic", time: "8:30 AM", landmark: "Bus Station" },
    ],
    cancellationPolicy: standardPolicy,
    active: true,
  },
  {
    id: 108,
    bus: bus(2),
    route: route(4),
    journeyDate: DEFAULT_JOURNEY_DATE,
    departureTime: "8:45 PM",
    arrivalTime: "8:00 AM",
    duration: "11h 15m",
    fare: 1299,
    rating: 4.4,
    totalReviews: 604,
    availableSeats: 22,
    boardingPoints: [
      { id: "bp-borivali", name: "Borivali", time: "8:45 PM", landmark: "National Park" },
      { id: "bp-dadar", name: "Dadar", time: "9:30 PM", landmark: "Swaminarayan Temple" },
    ],
    droppingPoints: [
      { id: "dp-mapusa", name: "Mapusa", time: "7:15 AM", landmark: "Market" },
      { id: "dp-panaji", name: "Panaji", time: "8:00 AM", landmark: "KTC Bus Stand" },
    ],
    cancellationPolicy: standardPolicy,
    active: true,
  },
];

/**
 * Builds a seat map for a schedule. Deterministic per schedule id so the same
 * seats are booked/locked on every render — like data coming from an API.
 */
export function buildSeatMap(scheduleId: number): Seat[] {
  const schedule = mockSchedules.find((s) => s.id === scheduleId);
  if (!schedule) return [];

  const seats: Seat[] = [];
  const isSleeper = schedule.bus.layoutType === "SLEEPER";
  const basePrice = schedule.fare;

  if (isSleeper) {
    // 5 rows x 3 berths per deck (single berth left of aisle, double right).
    const decks: Array<"LOWER" | "UPPER"> = ["LOWER", "UPPER"];
    decks.forEach((deck, deckIndex) => {
      for (let row = 1; row <= 5; row++) {
        for (let column = 1; column <= 3; column++) {
          const letter = column === 1 ? "A" : column === 2 ? "B" : "C";
          const seatNumber = `${deck === "LOWER" ? "L" : "U"}${row}${letter}`;
          const seatType: SeatType = deck === "LOWER" ? "SLEEPER_LOWER" : "SLEEPER_UPPER";
          seats.push({
            id: `${scheduleId}-${seatNumber}`,
            seatNumber,
            seatType,
            position: { row, column, deck },
            price: basePrice + (deck === "LOWER" ? 50 : 0),
            status: "AVAILABLE",
            isWindow: column === 1 || column === 3,
          });
        }
      }
      void deckIndex;
    });
  } else {
    // 10 rows x 4 seats (2 + aisle + 2).
    for (let row = 1; row <= 10; row++) {
      for (let column = 1; column <= 4; column++) {
        const letter = ["A", "B", "C", "D"][column - 1];
        const seatNumber = `${row}${letter}`;
        seats.push({
          id: `${scheduleId}-${seatNumber}`,
          seatNumber,
          seatType: "SEATER",
          position: { row, column, deck: "LOWER" },
          price: basePrice + (row <= 3 ? 30 : 0),
          status: "AVAILABLE",
          isWindow: column === 1 || column === 4,
        });
      }
    }
  }

  // Deterministic booked / locked seats.
  seats.forEach((seat, index) => {
    const marker = (index * 7 + scheduleId) % 11;
    if (marker === 0 || marker === 3) seat.status = "BOOKED";
    else if (marker === 5) seat.status = "LOCKED";
  });

  return seats;
}

export const mockBookings: Booking[] = [
  {
    id: "1",
    bookingId: "SB2026092500123",
    userId: 1,
    customerName: "Vaishali Dhayarkar",
    scheduleId: 101,
    operator: "Neeta Travels",
    busName: "Neeta Volvo 9600",
    busType: "AC_SLEEPER",
    source: "Pune",
    destination: "Mumbai",
    journeyDate: "2026-09-25",
    departureTime: "10:30 PM",
    arrivalTime: "3:30 AM",
    boardingPoint: puneBoarding[0]!,
    droppingPoint: mumbaiDropping[0]!,
    seats: [{ seatId: "101-L2A", seatNumber: "L2A" }],
    passengers: [
      {
        name: "Vaishali Dhayarkar",
        age: 24,
        gender: "FEMALE",
        mobile: "9876543210",
        seatId: "101-L2A",
        seatNumber: "L2A",
      },
    ],
    fare: { baseFare: 849, taxes: 42, convenienceFee: 20, total: 911 },
    status: "CONFIRMED",
    paymentMethod: "UPI",
    bookedAt: "2026-09-10T09:24:00Z",
  },
  {
    id: "2",
    bookingId: "SB2026081200077",
    userId: 1,
    customerName: "Vaishali Dhayarkar",
    scheduleId: 103,
    operator: "Shivneri Travels",
    busName: "Shivneri AC Seater",
    busType: "AC_SEATER",
    source: "Pune",
    destination: "Mumbai",
    journeyDate: "2026-08-12",
    departureTime: "6:15 AM",
    arrivalTime: "10:45 AM",
    boardingPoint: puneBoarding[1]!,
    droppingPoint: mumbaiDropping[2]!,
    seats: [
      { seatId: "103-2A", seatNumber: "2A" },
      { seatId: "103-2B", seatNumber: "2B" },
    ],
    passengers: [
      {
        name: "Vaishali Dhayarkar",
        age: 24,
        gender: "FEMALE",
        mobile: "9876543210",
        seatId: "103-2A",
        seatNumber: "2A",
      },
      {
        name: "Rohit Kulkarni",
        age: 27,
        gender: "MALE",
        mobile: "9765432101",
        seatId: "103-2B",
        seatNumber: "2B",
      },
    ],
    fare: { baseFare: 1158, taxes: 58, convenienceFee: 20, total: 1236 },
    status: "COMPLETED",
    paymentMethod: "CARD",
    bookedAt: "2026-08-01T14:10:00Z",
  },
  {
    id: "3",
    bookingId: "SB2026070400045",
    userId: 1,
    customerName: "Vaishali Dhayarkar",
    scheduleId: 105,
    operator: "VRL Travels",
    busName: "VRL Multi-Axle Sleeper",
    busType: "NON_AC_SLEEPER",
    source: "Mumbai",
    destination: "Pune",
    journeyDate: "2026-07-04",
    departureTime: "9:30 PM",
    arrivalTime: "2:30 AM",
    boardingPoint: mumbaiBoarding[2]!,
    droppingPoint: puneDropping[0]!,
    seats: [{ seatId: "105-U3C", seatNumber: "U3C" }],
    passengers: [
      {
        name: "Vaishali Dhayarkar",
        age: 24,
        gender: "FEMALE",
        mobile: "9876543210",
        seatId: "105-U3C",
        seatNumber: "U3C",
      },
    ],
    fare: { baseFare: 699, taxes: 35, convenienceFee: 20, total: 754 },
    status: "CANCELLED",
    paymentMethod: "NETBANKING",
    bookedAt: "2026-06-28T18:02:00Z",
  },
  {
    id: "4",
    bookingId: "SB2026092500198",
    userId: 3,
    customerName: "Rohit Kulkarni",
    scheduleId: 102,
    operator: "Purple Travels",
    busName: "Purple Luxury Sleeper",
    busType: "AC_SLEEPER",
    source: "Pune",
    destination: "Mumbai",
    journeyDate: "2026-09-25",
    departureTime: "11:45 PM",
    arrivalTime: "4:30 AM",
    boardingPoint: puneBoarding[2]!,
    droppingPoint: mumbaiDropping[1]!,
    seats: [{ seatId: "102-L1A", seatNumber: "L1A" }],
    passengers: [
      {
        name: "Rohit Kulkarni",
        age: 27,
        gender: "MALE",
        mobile: "9765432101",
        seatId: "102-L1A",
        seatNumber: "L1A",
      },
    ],
    fare: { baseFare: 999, taxes: 50, convenienceFee: 20, total: 1069 },
    status: "CONFIRMED",
    paymentMethod: "UPI",
    bookedAt: "2026-09-12T11:45:00Z",
  },
  {
    id: "5",
    bookingId: "SB2026092600211",
    userId: 5,
    customerName: "Imran Shaikh",
    scheduleId: 108,
    operator: "Purple Travels",
    busName: "Purple Luxury Sleeper",
    busType: "AC_SLEEPER",
    source: "Mumbai",
    destination: "Goa",
    journeyDate: "2026-09-26",
    departureTime: "8:45 PM",
    arrivalTime: "8:00 AM",
    boardingPoint: { id: "bp-dadar", name: "Dadar", time: "9:30 PM" },
    droppingPoint: { id: "dp-panaji", name: "Panaji", time: "8:00 AM" },
    seats: [
      { seatId: "108-L4B", seatNumber: "L4B" },
      { seatId: "108-L4C", seatNumber: "L4C" },
    ],
    passengers: [
      {
        name: "Imran Shaikh",
        age: 31,
        gender: "MALE",
        mobile: "9812345678",
        seatId: "108-L4B",
        seatNumber: "L4B",
      },
      {
        name: "Farah Shaikh",
        age: 29,
        gender: "FEMALE",
        mobile: "9812345679",
        seatId: "108-L4C",
        seatNumber: "L4C",
      },
    ],
    fare: { baseFare: 2698, taxes: 135, convenienceFee: 20, total: 2853 },
    status: "CONFIRMED",
    paymentMethod: "CARD",
    bookedAt: "2026-09-14T08:30:00Z",
  },
];

export const POPULAR_ROUTES = [
  { from: "Pune", to: "Mumbai", startingFare: 399 },
  { from: "Mumbai", to: "Pune", startingFare: 449 },
  { from: "Pune", to: "Bangalore", startingFare: 1499 },
  { from: "Mumbai", to: "Goa", startingFare: 1299 },
];
