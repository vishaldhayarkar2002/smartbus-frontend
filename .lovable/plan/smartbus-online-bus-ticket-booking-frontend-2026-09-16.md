# SmartBus — Online Bus Ticket Booking (Frontend)

A complete, responsive bus-booking app running entirely on realistic mock data, structured so a Spring Boot REST API can be plugged in later without touching the UI.

## One necessary deviation

The document asks for React Router. This project is fixed on TanStack Router (Lovable's routing system), so pages are built with it instead. Everything else follows the document: TypeScript, Redux Toolkit, Axios, Tailwind, Lucide icons. All the same URLs are created.

## Pages

Public: home, login, register, forgot password, search results, bus details, seat selection, passenger details, review, payment, confirmation, e-ticket.
Signed in: my bookings, booking detail, profile.
Admin (own sidebar layout): dashboard, buses, routes, schedules, seats, bookings, users.

Signed-in and admin areas are guarded; demo credentials are shown on the login screen (one traveller, one admin).

## Booking flow

Home search (Pune → Mumbai, 25 September 2026 prefilled) → results with working filters (departure/arrival time, price, AC/Non-AC, sleeper/seater, operator) and sorting → bus details where boarding and dropping points must both be chosen before continuing → seat selection → passenger form per seat → review with fare breakdown (base, taxes, convenience fee, total) → mock payment (UPI / card / net banking, processing, success or failure) → confirmation with booking ID → printable e-ticket with QR placeholder → my bookings with Upcoming / Completed / Cancelled tabs and mock cancellation via confirmation dialog.

## Seat selection

Top-view bus layout rendered from seat data, not hand-placed seats: front/driver marker, aisle, back row, seater and sleeper variants, window seats only where the data says so. Statuses available / selected / booked / locked shown by colour plus icon and label, with a legend. Selecting a seat starts a single 5-minute hold countdown; on expiry the selection clears and an expiry notice appears so the user can pick again. The same seat-layout component is reused on the admin seats page.

## Admin

Mock CRUD on buses, routes and schedules through shared table + form + dialog components; bookings list with search, filter, sort and detail view; users list with activate/deactivate; dashboard tiles for users, buses, today's bookings and today's revenue.

## Design

Travel-oriented, calm and trustworthy: deep navy/teal primary with a warm amber accent, white cards, generous whitespace, soft shadows, rounded corners, clear type scale, Lucide icons only. Full responsive behaviour including mobile filter drawer, scrollable admin tables and mobile-friendly seat map. Labels, focus states, semantic markup and accessible dialogs throughout. Every screen has skeleton loading, empty and error-with-retry states.

## Technical notes

- Feature-based folders: `components/{ui,common,layout,booking}`, `features/*`, `services/`, `store/slices/`, `types/`, `utils/`, `config/`, with `@/` aliases.
- `services/api.ts`: single Axios instance reading `VITE_API_BASE_URL`, request interceptor ready for a Bearer token, response interceptor for errors. No hardcoded URLs.
- `authService` / `busService` / `bookingService` / `paymentService`: async functions returning typed mock data with small simulated latency, each mapped 1:1 to the future endpoint it will replace (`/auth/login`, `/buses/search`, `/schedules/{id}/seats`, `/seats/{id}/lock`, `/bookings`, `/payments`, …).
- Redux Toolkit slices: `auth` (user, token, isAuthenticated), `search` (from, to, journeyDate), `booking` (bus, boarding, dropping, seats, passengers, fare, booking). Auth and in-progress booking persisted to storage; UI state stays local.
- Centralised mock data (`mockBuses`, `mockSeats`, `mockRoutes`, `mockSchedules`, `mockBookings`, `mockUsers`) behind shared TypeScript interfaces shaped like REST responses.
- Seat-hold timer implemented with a single effect-scoped interval and proper cleanup.
- README covering setup, folder structure, env vars, mock data, demo credentials and how to swap each mock service for the Spring Boot call.
