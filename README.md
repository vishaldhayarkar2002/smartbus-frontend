# SmartBus — Online Bus Ticket Booking System (Frontend)

A complete, responsive online bus ticket booking application built as a **frontend-only project running on realistic mock data**. Every data call goes through a thin service layer, so each mock function can later be replaced by a Spring Boot REST API call **without touching a single UI component**.

Built for a CDAC project submission / viva defence.

---

## 1. Quick start

```sh
npm install
npm run dev
```

The app runs at `http://localhost:8080`.

### Demo credentials (also shown on the sign-in screen)

| Role      | Email                 | Password   |
| --------- | --------------------- | ---------- |
| Traveller | traveller@smartbus.in | `user123`  |
| Admin     | admin@smartbus.in     | `admin123` |

Signing in as the traveller lands on **My bookings**; the admin lands on the **admin dashboard**.

### Environment variables

Create a `.env` file (optional — a sensible default is used):

```
VITE_API_BASE_URL=http://localhost:8080/api
```

No backend URL is hardcoded anywhere else in the codebase. Everything reads `src/config/env.ts`.

---

## 2. Technology stack

| Concern          | Choice                                                       |
| ---------------- | ------------------------------------------------------------ |
| UI library       | React 19 + TypeScript                                        |
| Build tool       | Vite 7                                                       |
| Routing          | TanStack Router (file-based)                                 |
| State management | Zustand (session + booking draft) with versioned persistence |
| Server data      | TanStack Query (all async reads/writes)                      |
| Validation       | Zod (search params, persisted state)                         |
| HTTP client      | Axios (single configured instance)                           |
| Styling          | Tailwind CSS v4 + shadcn/ui components                       |
| Icons            | lucide-react                                                 |
| Notifications    | sonner toasts                                                |

> **Note for the viva:** the original specification mentioned React Router. This project is built on **TanStack Router** instead, because the Lovable platform fixes the routing library. The concepts are identical — file-based route definitions, nested layouts, route params, and programmatic navigation. Every URL in the specification exists exactly as written.

---

## 3. Feature overview

### Traveller side

| Page              | Route                        | What it does                                                                                        |
| ----------------- | ---------------------------- | --------------------------------------------------------------------------------------------------- |
| Home              | `/`                          | Hero, search card (from / to / date + swap), popular routes, offers, benefits                       |
| Sign in           | `/login`                     | Validated form, demo credential quick-fill, role-based redirect                                     |
| Register          | `/register`                  | Full name, email, 10-digit mobile, password + confirm                                               |
| Forgot password   | `/forgot-password`           | Mock reset-link request                                                                             |
| Search results    | `/search`                    | URL-driven (`?from=&to=&journeyDate=`) — shareable and reload-safe; departure / arrival slot, price, AC, sleeper, operator filters + 5 sort modes |
| Bus details       | `/bus/$busId`                | Amenities, boarding & dropping point tabs (both required), cancellation policy                      |
| Seat selection    | `/booking/seat-selection`    | Top-view seat map, max 6 seats, 5-minute hold countdown                                             |
| Passenger details | `/booking/passenger-details` | One validated form per selected seat                                                                |
| Review            | `/booking/review`            | Journey summary, passengers, fare breakdown, edit links                                             |
| Payment           | `/payment`                   | UPI / Card / Net banking, processing state, success or failure screen                               |
| Confirmation      | `/booking/confirmation`      | Booking ID and next actions                                                                         |
| E-ticket          | `/ticket/$bookingId`         | Printable ticket with QR placeholder                                                                |
| My bookings       | `/my-bookings`               | Upcoming / Completed / Cancelled tabs, cancellation with confirm dialog                             |
| Booking detail    | `/my-bookings/$bookingId`    | Full booking record                                                                                 |
| Profile           | `/profile`                   | Update name / mobile, change password (current password is verified)                                |
| Help              | `/help`                      | FAQ accordion and support contacts                                                                  |
| Access denied     | `/access-denied`             | Friendly screen when a non-admin tries an admin page or a signed-out visitor hits a protected route |

### Admin side (own sidebar layout, admin-only guard)

| Page         | Route              | What it does                                                                  |
| ------------ | ------------------ | ----------------------------------------------------------------------------- |
| Dashboard    | `/admin`           | Total users, active buses, today's bookings, today's revenue, recent bookings |
| Buses        | `/admin/buses`     | Add / edit / delete / activate buses; type drives layout and seat count       |
| Routes       | `/admin/routes`    | Add / edit / delete city pairs with distance and duration                     |
| Schedules    | `/admin/schedules` | Add / edit / delete schedules: route, bus, date, times, fare, status          |
| Seat layouts | `/admin/seats`     | Visual seat-map inspector per schedule, reusing the traveller seat map        |
| Bookings     | `/admin/bookings`  | Search, filter by status, sort, view booking detail                           |
| Users        | `/admin/users`     | Search, filter by role/status, activate / deactivate, view user detail        |

### Cross-cutting behaviour

- Every data-driven screen has **skeleton loading**, **empty** and **error-with-retry** states.
- Fully responsive: mobile filter drawer, horizontally scrollable admin tables, mobile-friendly seat map.
- Accessibility: labelled inputs, keyboard-operable seats and dialogs, visible focus rings, semantic headings, seat status conveyed by colour **and** icon **and** text, a skip link, and `prefers-reduced-motion` handling.
- Seat status is never colour-only, which is a common accessibility question in a viva.

---

## 4. Seat selection (the highest-value feature)

`src/components/booking/SeatLayout.tsx` renders the bus **entirely from seat data** — no hardcoded seat positions.

- Each `Seat` carries `position: { row, column, deck }`, `seatType`, `price`, `status`, `isWindow`.
- Sleeper buses render as `1 berth | aisle | 2 berths` on **lower** and **upper** decks; seater buses as `2 | aisle | 2` on a single deck.
- Statuses: `AVAILABLE`, `SELECTED`, `BOOKED`, `LOCKED` — each with its own design token, icon and accessible label.
- Window seats are marked only where the data says so.
- The same component is reused read-only on the admin seat-layouts screen (`readOnly` prop).

**Seat hold:** selecting the first seat starts a single 5-minute countdown (`src/components/booking/SeatLockTimer.tsx`). It uses one effect-scoped `setInterval` with proper cleanup. On expiry the selection is cleared and an expiry notice invites the user to pick again. The hold duration lives in `SEAT_LOCK_SECONDS` in `src/config/env.ts`.

On page reload an expired hold cannot be resumed: the persisted store detects `lockExpiresAt` in the past, clears the seats/passengers and shows the expiry notice instead.

---

## 5. Folder structure

```
src/
├── components/
│   ├── booking/        SeatLayout, SeatLockTimer, BusCard, FareSummary, BookingSteps
│   ├── common/         AppProviders, RequireAuth, SearchCard, StateBlocks,
│   │                   StatusBadge, QRCodePlaceholder
│   ├── layout/         Header, Footer, Logo, AdminShell
│   └── ui/             shadcn/ui primitives (button, dialog, table, tabs, …)
├── config/
│   └── env.ts          API_BASE_URL, MOCK_LATENCY, SEAT_LOCK_SECONDS, STORAGE_KEYS
├── data/
│   └── mockData.ts     ALL mock datasets + deterministic buildSeatMap()
├── routes/             file-based pages (_site.* = public shell, admin.* = admin shell)
├── services/           api.ts + authService, busService, bookingService,
│                       paymentService, adminService, adminQueries (shared
│                       TanStack Query keys/hooks), mockDb (localStorage persistence)
├── state/
│   └── useAppStore.ts  Zustand store: auth session + booking draft, versioned
│                       persistence with Zod-validated hydration
├── types/
│   └── index.ts        every shared interface, shaped like a REST response
├── utils/              fare.ts (tax + convenience fee), format.ts (currency, dates, time)
└── styles.css          design tokens, seat-status colours, dark mode, print styles
```

Path alias: `@/` → `src/`.

---

## 6. State management

| Owner                  | Holds                                                                                   | Persistence                     |
| ---------------------- | --------------------------------------------------------------------------------------- | ------------------------------- |
| Zustand (`useAppStore`)| `auth` (user, token, isAuthenticated, hydrated) and the `booking` draft (schedule, boarding/dropping points, seats, passengers, fare, lock expiry, confirmed booking) | `localStorage` (versioned, Zod-validated on hydration; unknown versions are dropped, expired holds are cleared) |
| Zustand `search`       | Last from / to / journeyDate — prefill only. **The URL is the source of truth for search** | in memory                       |
| TanStack Query         | Search results, seat maps, my bookings, profile data, payment, all admin tables (see `adminQueries.ts`) | query cache, invalidated after every write |

Purely visual state (open dialogs, active tab, filter panel) stays in local component state — deliberately, to avoid over-engineering.

Booking IDs are generated with `crypto.randomUUID()`-based references (collision-safe, e.g. `SB2026092500123`).

---

## 7. Mock data and persistence

Mock datasets live in `src/data/mockData.ts`:

`mockUsers` (5) · `mockRoutes` (5) · `mockBuses` (6) · `mockSchedules` · `mockBookings` (5) · `POPULAR_ROUTES` · `DEMO_CREDENTIALS` · `CITIES` · `DEFAULT_JOURNEY_DATE` (`2026-09-25`).

`buildSeatMap(scheduleId)` **generates** the seat map deterministically from the bus layout: berth/seat numbering, window flags at the edges, a ₹50 lower-deck premium, a ₹30 front-row premium, and a fixed pattern of already-booked and on-hold seats so the same seats appear taken on every render.

**Persistence (`src/services/mockDb.ts`):** every collection (users, buses, routes, schedules, bookings) is stored in `localStorage` under the `smartbus.db.*` prefix, seeded from the mock datasets on first read. Admin edits, registrations, bookings and cancellations therefore **survive page refreshes**, exactly like a future database table. Corrupted rows fall back to seed data instead of crashing; `resetDatabase()` restores the demo to seed state.

Reliability guarantees already built in (each maps to a real backend concern):

- `paymentService` settles charges by booking reference — retrying the same reference never charges twice (idempotency key).
- `createBooking` is idempotent by booking ID and **revalidates the seat hold** before inserting, refusing seats that were sold since selection.
- `authService` stores a SHA-256 hash of `email:password` (mock only — a real server must use bcrypt/argon2); login verifies it, register saves it, `changePassword` requires the current password.

Services simulate a network round trip via `mockRequest(data, delay)` / `mockFailure(message)`. Payment succeeds ~85% of the time so the failure screen is reachable and demonstrable.

---

## 8. Replacing each mock with a Spring Boot REST endpoint

The swap is mechanical. **UI components never call Axios** — they only call service functions, and each service function already documents the endpoint it will replace in a comment above its mock body.

### Step 0 — point the app at the API

```
VITE_API_BASE_URL=http://localhost:8080/api
```

`src/services/api.ts` already provides:

- a single Axios instance with that `baseURL`,
- a **request interceptor** attaching `Authorization: Bearer <token>` from stored auth,
- a **response interceptor** flattening Spring Boot error bodies into a plain `Error(message)` the UI shows in its error state.

Enable CORS on the Spring Boot side for the frontend origin.

### Step 1 — replace a function body

Every mock has the same shape. Delete the mock body, uncomment the real call:

```ts
// BEFORE (mock)
export async function searchBuses(query: SearchQuery): Promise<Schedule[]> {
  const results = readTable("schedules").filter(/* … */);
  return mockRequest(results);
}

// AFTER (Spring Boot)
export async function searchBuses(query: SearchQuery): Promise<Schedule[]> {
  const { data } = await api.get<Schedule[]>("/buses/search", { params: query });
  return data;
}
```

Nothing else changes — the return type is identical, so pages, filters, Zustand and TanStack Query are untouched. When `mockDb.ts` is replaced by the API, delete it.

### Step 2 — endpoint map

**`authService.ts`**

| Function               | Spring Boot endpoint    | Method |
| ---------------------- | ----------------------- | ------ |
| `login`                | `/auth/login`           | POST   |
| `register`             | `/auth/register`        | POST   |
| `requestPasswordReset` | `/auth/forgot-password` | POST   |
| `changePassword`       | `/users/me/password`    | PUT    |
| `updateProfile`        | `/users/me`             | PUT    |

**`busService.ts`**

| Function          | Spring Boot endpoint                   | Method |
| ----------------- | -------------------------------------- | ------ |
| `searchBuses`     | `/buses/search?from=&to=&journeyDate=` | GET    |
| `getScheduleById` | `/buses/{id}`                          | GET    |
| `getSeats`        | `/schedules/{id}/seats`                | GET    |
| `lockSeat`        | `/seats/{seatId}/lock`                 | POST   |
| `releaseSeat`     | `/seats/{seatId}/release`              | POST   |
| `getRoutes`       | `/routes`                              | GET    |
| `getSchedules`    | `/schedules`                           | GET    |

**`bookingService.ts`**

| Function         | Spring Boot endpoint           | Method |
| ---------------- | ------------------------------ | ------ |
| `createBooking`  | `/bookings`                    | POST   |
| `getMyBookings`  | `/bookings/my`                 | GET    |
| `getBookingById` | `/bookings/{bookingId}`        | GET    |
| `cancelBooking`  | `/bookings/{bookingId}/cancel` | PUT    |
| `getAllBookings` | `/admin/bookings`              | GET    |

**`paymentService.ts`**

| Function      | Spring Boot endpoint | Method |
| ------------- | -------------------- | ------ |
| `makePayment` | `/payments`          | POST   |

**`adminService.ts`**

| Function                                            | Spring Boot endpoint                        | Method              |
| --------------------------------------------------- | ------------------------------------------- | ------------------- |
| `listBuses` / `saveBus` / `deleteBus`               | `/admin/buses`, `/admin/buses/{id}`         | GET/POST-PUT/DELETE |
| `toggleBusActive`                                   | `/admin/buses/{id}/status`                  | PATCH               |
| `listRoutes` / `saveRoute` / `deleteRoute`          | `/admin/routes`, `/admin/routes/{id}`       | GET/POST-PUT/DELETE |
| `listSchedules` / `saveSchedule` / `deleteSchedule` | `/admin/schedules`, `/admin/schedules/{id}` | GET/POST-PUT/DELETE |
| `toggleScheduleActive`                              | `/admin/schedules/{id}/status`              | PATCH               |
| `listUsers`                                         | `/admin/users`                              | GET                 |
| `toggleUserStatus`                                  | `/admin/users/{id}/status`                  | PATCH               |

### Step 3 — align the JSON

Every interface in `src/types/index.ts` is already shaped like a Spring Boot JSON response (enums as uppercase strings, dates as ISO strings, nested `bus` and `route` objects inside `Schedule`). Make the Java DTO field names match these interfaces and no frontend mapping code is needed.

### Step 4 — security

- Spring Security issues the JWT on `/auth/login`; the request interceptor sends it back on every call. For browser sessions, prefer an **HttpOnly, Secure, SameSite cookie** issued by the server.
- Keep `RequireAuth` and the admin route guard as UX guards only. **Real authorisation must be enforced server-side** with `@PreAuthorize("hasRole('ADMIN')")` on admin controllers — a client-side guard can always be bypassed.
- Hash passwords with bcrypt/argon2 on the server; the frontend's SHA-256 hashing exists only to make the mock behave realistically.
- Seat locks need a server-side TTL (e.g. `/seats/{id}/lock` returning `lockedUntil`), and booking creation should re-check seat availability transactionally — both behaviours are already simulated client-side.

### Step 5 — database design (ERD)

The database schema for the Spring Boot backend lives in `SmartBus_ERD_v2.mmd` (Mermaid `erDiagram`, renderable on mermaid.live or in any Markdown viewer with Mermaid support). It is normalised to 3NF/BCNF:

- **Users & auth:** `USERS` (password stored as a bcrypt hash, never plain text).
- **Bus catalogue:** `BUSES`, `BUS_AMENITIES`, `SEATS` (the physical layout per bus, unique on `(bus_id, seat_number)`), `ROUTES`, `ROUTE_STOPS`, `SCHEDULES`, `CANCELLATION_RULES`, `REVIEWS`.
- **Booking:** `BOOKINGS`, `BOOKING_PASSENGERS`, `PAYMENTS`, `SEAT_LOCKS`.

**Normalisation notes (good viva material):**

- `SCHEDULES` does **not** store `duration`, `rating` or `total_reviews`. Duration is derived (`arrival_time − departure_time`); ratings are aggregated from the `REVIEWS` table at query time. Storing them would be a 3NF transitive-dependency violation and cause update anomalies on every new review.
- Boarding/dropping points hang off `ROUTE_STOPS (route_id)`, not the schedule, so the same stops are defined once per route instead of being duplicated for every daily schedule. A stop's time on a given schedule is `departure_time + offset_minutes`.
- `BOOKINGS` has no `payment_method` column — the method is read from the successful `PAYMENTS` row, so a failed card attempt followed by a successful UPI retry can never leave the two tables disagreeing. `PAYMENTS.status` is `INITIATED / SUCCESS / FAILED`.
- `BOOKING_PASSENGERS.seat_number` is a **deliberate denormalisation**: an e-ticket must show the seat number as sold, even if the bus layout is edited later. It is a historical snapshot, not an oversight.
- `SEAT_LOCKS` has a composite unique constraint `UNIQUE(schedule_id, seat_id, journey_date)` so a seat can never be locked twice for the same journey; expired locks are excluded by comparing `locked_until` (or offloaded to Redis with a TTL in production).
- `BOOKINGS.booking_ref` is the idempotency key — retrying a payment or booking submission with the same reference returns the original record instead of creating a duplicate.

---

## 9. Viva defence — likely questions and answers

**Why is there no backend in this submission?**
The scope is the frontend. The architecture isolates every data access behind a service layer with REST-shaped TypeScript types, so the backend can be attached by rewriting five service files.

**How is the seat map not hardcoded?**
It is a pure function of the seat array. `buildSeatMap` produces positions; `SeatLayout` groups seats by row and deck and inserts the aisle from the column count. A different bus layout renders correctly with zero component changes.

**How does the 5-minute seat hold work, and why one interval?**
A single `setInterval` inside one `useEffect`, cleared on unmount. Multiple intervals (one per seat) would drift and leak. The expiry dispatches a Zustand action that clears the selection — the same thing a real `/seats/{id}/lock` TTL expiry would trigger.

**Why Zustand and TanStack Query, and not just React state?**
The auth session and the in-progress booking must survive a refresh, so they live in a Zustand store persisted to `localStorage` with a **versioned, Zod-validated schema** — stale or corrupt data is discarded instead of crashing the app. Everything fetched from "the server" (search results, bookings, admin tables) lives in TanStack Query with stable keys, so a cancellation or admin edit invalidates exactly the queries that depend on it. UI-only state deliberately stays local — using one store for everything would be over-engineering.

**Why is the search state in the URL?**
`/search?from=Pune&to=Mumbai&journeyDate=2026-09-25` is validated with Zod, so results are shareable, survive a reload, and survive a new tab — exactly like a REST GET endpoint with query parameters. The store only pre-fills the form.

**How is the app made accessible?**
Labelled inputs, real `<button>` seats with `aria-pressed` and descriptive `aria-label`, seat status shown by icon and text as well as colour, focus-visible rings, a skip link, semantic landmarks and headings, and accessible dialogs from shadcn/ui.

**What would you do next with a real backend?**
Server-side seat locking with a TTL, idempotent booking creation (already simulated client-side), a real payment gateway webhook, server-side pagination on admin tables, and role checks enforced in Spring Security.

---

## 10. Design system

Travel-oriented and calm: deep navy/teal primary, warm amber accent, white cards, generous whitespace, soft shadows, rounded corners. All colours, shadows and seat-status values are **semantic design tokens** in `src/styles.css` — no hardcoded colour utilities in components, so dark mode and theming work everywhere. Typography: Manrope and Plus Jakarta Sans. Icons are lucide-react only.
