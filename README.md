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

| Role      | Email                    | Password   |
| --------- | ------------------------ | ---------- |
| Traveller | traveller@smartbus.in    | `user123`  |
| Admin     | admin@smartbus.in        | `admin123` |

Signing in as the traveller lands on **My bookings**; the admin lands on the **admin dashboard**.

### Environment variables

Create a `.env` file (optional — a sensible default is used):

```
VITE_API_BASE_URL=http://localhost:8080/api
```

No backend URL is hardcoded anywhere else in the codebase. Everything reads `src/config/env.ts`.

---

## 2. Technology stack

| Concern           | Choice                                            |
| ----------------- | ------------------------------------------------- |
| UI library        | React 19 + TypeScript                             |
| Build tool        | Vite 7                                            |
| Routing           | TanStack Router (file-based)                       |
| State management  | Redux Toolkit + react-redux                        |
| HTTP client       | Axios (single configured instance)                 |
| Styling           | Tailwind CSS v4 + shadcn/ui components             |
| Icons             | lucide-react                                       |
| Notifications     | sonner toasts                                      |

> **Note for the viva:** the original specification mentioned React Router. This project is built on **TanStack Router** instead, because the Lovable platform fixes the routing library. The concepts are identical — file-based route definitions, nested layouts, route params, and programmatic navigation. Every URL in the specification exists exactly as written.

---

## 3. Feature overview

### Traveller side

| Page                            | Route                            | What it does                                                                 |
| ------------------------------- | -------------------------------- | ---------------------------------------------------------------------------- |
| Home                            | `/`                              | Hero, search card (from / to / date + swap), popular routes, offers, benefits |
| Sign in                         | `/login`                         | Validated form, demo credential quick-fill, role-based redirect              |
| Register                        | `/register`                      | Full name, email, 10-digit mobile, password + confirm                        |
| Forgot password                 | `/forgot-password`               | Mock reset-link request                                                      |
| Search results                  | `/search`                        | Filters (departure / arrival slot, max price, AC, Non-AC, sleeper, seater, operator) + 5 sort modes |
| Bus details                     | `/bus/$busId`                    | Amenities, boarding & dropping point tabs (both required), cancellation policy |
| Seat selection                  | `/booking/seat-selection`        | Top-view seat map, max 6 seats, 5-minute hold countdown                      |
| Passenger details               | `/booking/passenger-details`     | One validated form per selected seat                                         |
| Review                          | `/booking/review`                | Journey summary, passengers, fare breakdown, edit links                      |
| Payment                         | `/payment`                       | UPI / Card / Net banking, processing state, success or failure screen        |
| Confirmation                    | `/booking/confirmation`          | Booking ID and next actions                                                  |
| E-ticket                        | `/ticket/$bookingId`             | Printable ticket with QR placeholder                                         |
| My bookings                     | `/my-bookings`                   | Upcoming / Completed / Cancelled tabs, cancellation with confirm dialog      |
| Booking detail                  | `/my-bookings/$bookingId`        | Full booking record                                                          |
| Profile                         | `/profile`                       | Update name / mobile, change password                                        |
| Help                            | `/help`                          | FAQ accordion and support contacts                                           |

### Admin side (own sidebar layout, admin-only guard)

| Page         | Route              | What it does                                                            |
| ------------ | ------------------ | ----------------------------------------------------------------------- |
| Dashboard    | `/admin`           | Total users, active buses, today's bookings, today's revenue, recent bookings |
| Buses        | `/admin/buses`     | Add / edit / delete / activate buses; type drives layout and seat count |
| Routes       | `/admin/routes`    | Add / edit / delete city pairs with distance and duration               |
| Schedules    | `/admin/schedules` | Add / edit / delete schedules: route, bus, date, times, fare, status    |
| Seat layouts | `/admin/seats`     | Visual seat-map inspector per schedule, reusing the traveller seat map  |
| Bookings     | `/admin/bookings`  | Search, filter by status, sort, view booking detail                     |
| Users        | `/admin/users`     | Search, filter by role/status, activate / deactivate, view user detail  |

### Cross-cutting behaviour

- Every data-driven screen has **skeleton loading**, **empty** and **error-with-retry** states.
- Fully responsive: mobile filter drawer, horizontally scrollable admin tables, mobile-friendly seat map.
- Accessibility: labelled inputs, keyboard-operable seats and dialogs, visible focus rings, semantic headings, seat status conveyed by colour **and** icon **and** text.
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
│                       paymentService, adminService
├── store/
│   ├── store.ts, hooks.ts
│   └── slices/         authSlice, searchSlice, bookingSlice
├── types/
│   └── index.ts        every shared interface, shaped like a REST response
├── utils/              fare.ts (tax + convenience fee), format.ts (currency, dates, time)
└── styles.css          design tokens, seat-status colours, dark mode, print styles
```

Path alias: `@/` → `src/`.

---

## 6. State management

| Slice     | Holds                                                     | Persisted           |
| --------- | --------------------------------------------------------- | ------------------- |
| `auth`    | `user`, `token`, `isAuthenticated`, `hydrated`             | `localStorage`      |
| `search`  | `from`, `to`, `journeyDate`                               | in memory           |
| `booking` | schedule, boarding/dropping point, seats, passengers, fare, confirmed booking | `localStorage` |

Purely visual state (open dialogs, active tab, filter panel) stays in local component state — deliberately, to avoid over-engineering.

---

## 7. Mock data

Everything lives in `src/data/mockData.ts`:

`mockUsers` (5) · `mockRoutes` (5) · `mockBuses` (6) · `mockSchedules` · `mockBookings` (5) · `POPULAR_ROUTES` · `DEMO_CREDENTIALS` · `CITIES` · `DEFAULT_JOURNEY_DATE` (`2026-09-25`).

`buildSeatMap(scheduleId)` **generates** the seat map deterministically from the bus layout: berth/seat numbering, window flags at the edges, a ₹50 lower-deck premium, a ₹30 front-row premium, and a fixed pattern of already-booked and on-hold seats so the same seats appear taken on every render.

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
  const results = mockSchedules.filter(/* … */);
  return mockRequest(results);
}

// AFTER (Spring Boot)
export async function searchBuses(query: SearchQuery): Promise<Schedule[]> {
  const { data } = await api.get<Schedule[]>("/buses/search", { params: query });
  return data;
}
```

Nothing else changes — the return type is identical, so pages, filters and Redux slices are untouched.

### Step 2 — endpoint map

**`authService.ts`**

| Function                 | Spring Boot endpoint                | Method |
| ------------------------ | ----------------------------------- | ------ |
| `login`                  | `/auth/login`                       | POST   |
| `register`               | `/auth/register`                    | POST   |
| `requestPasswordReset`   | `/auth/forgot-password`             | POST   |
| `changePassword`         | `/users/me/password`                | PUT    |
| `updateProfile`          | `/users/me`                         | PUT    |

**`busService.ts`**

| Function          | Spring Boot endpoint              | Method |
| ----------------- | --------------------------------- | ------ |
| `searchBuses`     | `/buses/search?from=&to=&journeyDate=` | GET |
| `getScheduleById` | `/buses/{id}`                     | GET    |
| `getSeats`        | `/schedules/{id}/seats`           | GET    |
| `lockSeat`        | `/seats/{seatId}/lock`            | POST   |
| `releaseSeat`     | `/seats/{seatId}/release`         | POST   |
| `getRoutes`       | `/routes`                         | GET    |
| `getSchedules`    | `/schedules`                      | GET    |

**`bookingService.ts`**

| Function         | Spring Boot endpoint              | Method |
| ---------------- | --------------------------------- | ------ |
| `createBooking`  | `/bookings`                       | POST   |
| `getMyBookings`  | `/bookings/my`                    | GET    |
| `getBookingById` | `/bookings/{bookingId}`           | GET    |
| `cancelBooking`  | `/bookings/{bookingId}/cancel`    | PUT    |
| `getAllBookings` | `/admin/bookings`                 | GET    |

**`paymentService.ts`**

| Function      | Spring Boot endpoint | Method |
| ------------- | -------------------- | ------ |
| `makePayment` | `/payments`          | POST   |

**`adminService.ts`**

| Function                                  | Spring Boot endpoint                | Method        |
| ----------------------------------------- | ----------------------------------- | ------------- |
| `listBuses` / `saveBus` / `deleteBus`     | `/admin/buses`, `/admin/buses/{id}` | GET/POST-PUT/DELETE |
| `toggleBusActive`                         | `/admin/buses/{id}/status`          | PATCH         |
| `listRoutes` / `saveRoute` / `deleteRoute`| `/admin/routes`, `/admin/routes/{id}` | GET/POST-PUT/DELETE |
| `listSchedules` / `saveSchedule` / `deleteSchedule` | `/admin/schedules`, `/admin/schedules/{id}` | GET/POST-PUT/DELETE |
| `toggleScheduleActive`                    | `/admin/schedules/{id}/status`      | PATCH         |
| `listUsers`                               | `/admin/users`                      | GET           |
| `toggleUserStatus`                        | `/admin/users/{id}/status`          | PATCH         |

### Step 3 — align the JSON

Every interface in `src/types/index.ts` is already shaped like a Spring Boot JSON response (enums as uppercase strings, dates as ISO strings, nested `bus` and `route` objects inside `Schedule`). Make the Java DTO field names match these interfaces and no frontend mapping code is needed.

### Step 4 — security

- Spring Security issues the JWT on `/auth/login`; the request interceptor sends it back on every call.
- Keep `RequireAuth` as a UX guard only. **Real authorisation must be enforced server-side** with `@PreAuthorize("hasRole('ADMIN')")` on admin controllers — a client-side guard can always be bypassed.

---

## 9. Viva defence — likely questions and answers

**Why is there no backend in this submission?**
The scope is the frontend. The architecture isolates every data access behind a service layer with REST-shaped TypeScript types, so the backend can be attached by rewriting five service files.

**How is the seat map not hardcoded?**
It is a pure function of the seat array. `buildSeatMap` produces positions; `SeatLayout` groups seats by row and deck and inserts the aisle from the column count. A different bus layout renders correctly with zero component changes.

**How does the 5-minute seat hold work, and why one interval?**
A single `setInterval` inside one `useEffect`, cleared on unmount. Multiple intervals (one per seat) would drift and leak. The expiry dispatches a Redux action that clears the selection, which is also what a real `/seats/{id}/lock` TTL expiry would trigger.

**Where does the fare come from?**
`src/utils/fare.ts`: base fare is the sum of selected seat prices, taxes are 5%, plus a flat ₹20 convenience fee. One function feeds the review page, the payment page and the ticket, so the totals can never disagree.

**Why Redux Toolkit and not just React state?**
Auth and the in-progress booking are needed across many routes and must survive a refresh. UI-only state deliberately stays local — using Redux for everything would be over-engineering.

**How is the app made accessible?**
Labelled inputs, real `<button>` seats with `aria-pressed` and descriptive `aria-label`, seat status shown by icon and text as well as colour, focus-visible rings, semantic landmarks and headings, and accessible dialogs from shadcn/ui.

**What would you do next with a real backend?**
Server-side seat locking with a TTL, idempotent booking creation, a real payment gateway webhook, server-side pagination on admin tables, and role checks enforced in Spring Security.

---

## 10. Design system

Travel-oriented and calm: deep navy/teal primary, warm amber accent, white cards, generous whitespace, soft shadows, rounded corners. All colours, shadows and seat-status values are **semantic design tokens** in `src/styles.css` — no hardcoded colour utilities in components, so dark mode and theming work everywhere. Typography: Manrope and Plus Jakarta Sans. Icons are lucide-react only.
