/**
 * Single client store (Zustand) for the signed-in session and the booking draft.
 * Persisted to localStorage with a versioned, Zod-validated schema: stale or
 * corrupted data is discarded instead of crashing the app.
 * Server data (search results, bookings, admin tables) lives in TanStack Query.
 */
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { z } from "zod";
import { STORAGE_KEYS } from "@/config/env";
import { calculateFare } from "@/utils/fare";
import type { AuthResponse, Booking, FareBreakdown, Passenger, Schedule, Seat, StopPoint, User } from "@/types";
import { DEFAULT_JOURNEY_DATE } from "@/data/mockData";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
}

export interface BookingState {
  selectedSchedule: Schedule | null;
  boardingPoint: StopPoint | null;
  droppingPoint: StopPoint | null;
  selectedSeats: Seat[];
  passengers: Passenger[];
  fare: FareBreakdown;
  lockExpiresAt: number | null;
  lockExpired: boolean;
  confirmedBooking: Booking | null;
}

interface AppState {
  auth: AuthState;
  booking: BookingState;
  /** Last search, used only to prefill forms. The URL is the source of truth. */
  search: { from: string; to: string; journeyDate: string };
}

const emptyBooking: BookingState = {
  selectedSchedule: null,
  boardingPoint: null,
  droppingPoint: null,
  selectedSeats: [],
  passengers: [],
  fare: { baseFare: 0, taxes: 0, convenienceFee: 0, total: 0 },
  lockExpiresAt: null,
  lockExpired: false,
  confirmedBooking: null,
};

const persistedSchema = z.object({
  auth: z
    .object({
      token: z.string().nullable(),
      user: z.object({ id: z.number(), email: z.string(), role: z.enum(["USER", "ADMIN"]) }).passthrough().nullable(),
    })
    .nullable(),
  booking: z
    .object({
      selectedSchedule: z.object({ id: z.number() }).passthrough().nullable(),
      selectedSeats: z.array(z.object({ id: z.string() }).passthrough()),
      passengers: z.array(z.object({ seatId: z.string() }).passthrough()),
      lockExpiresAt: z.number().nullable(),
    })
    .passthrough(),
});

export const useAppStore = create<AppState>()(
  persist(
    (): AppState => ({
      auth: { user: null, token: null, isAuthenticated: false, hydrated: false },
      booking: emptyBooking,
      search: { from: "Pune", to: "Mumbai", journeyDate: DEFAULT_JOURNEY_DATE },
    }),
    {
      name: STORAGE_KEYS.auth,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ auth: { token: s.auth.token, user: s.auth.user }, booking: s.booking }),
      migrate: () => undefined, // unknown older versions are dropped
      merge: (persisted, current: AppState): AppState => {
        const parsed = persistedSchema.safeParse(persisted);
        if (!parsed.success) return { ...current, auth: { ...current.auth, hydrated: true } };
        const { auth, booking } = parsed.data;
        const session = auth?.token && auth.user ? { token: auth.token, user: auth.user as unknown as User } : null;
        let draft = { ...emptyBooking, ...(booking as unknown as BookingState) };
        // An expired seat hold cannot be resumed after reload.
        if (draft.lockExpiresAt && draft.lockExpiresAt < Date.now()) {
          draft = { ...draft, selectedSeats: [], passengers: [], lockExpiresAt: null, lockExpired: true };
          draft.fare = calculateFare([]);
        }
        return {
          ...current,
          booking: draft,
          auth: { user: session?.user ?? null, token: session?.token ?? null, isAuthenticated: !!session, hydrated: true },
        };
      },
      onRehydrateStorage: () => () => {
        useAppStore.setState((s) => ({ auth: { ...s.auth, hydrated: true } }));
      },
    },
  ),
);

const set = useAppStore.setState;
const get = useAppStore.getState;
const patchBooking = (patch: Partial<BookingState>) => set((s) => ({ booking: { ...s.booking, ...patch } }));

export function setCredentials({ token, user }: AuthResponse) {
  set((s) => ({ auth: { ...s.auth, token, user, isAuthenticated: true } }));
}
export function updateUser(user: User) {
  set((s) => ({ auth: { ...s.auth, user } }));
}
export function logout() {
  set((s) => ({ auth: { ...s.auth, token: null, user: null, isAuthenticated: false }, booking: emptyBooking }));
}
export function setSearch(search: AppState["search"]) {
  set({ search });
}
export function selectSchedule(schedule: Schedule) {
  set({ booking: { ...emptyBooking, selectedSchedule: schedule } });
}
export function setBoardingPoint(point: StopPoint) {
  patchBooking({ boardingPoint: point });
}
export function setDroppingPoint(point: StopPoint) {
  patchBooking({ droppingPoint: point });
}
export function toggleSeat(seat: Seat) {
  const b = get().booking;
  const selectedSeats = b.selectedSeats.some((s) => s.id === seat.id)
    ? b.selectedSeats.filter((s) => s.id !== seat.id)
    : [...b.selectedSeats, { ...seat, status: "SELECTED" as const }];
  const passengers = selectedSeats.map(
    (s) =>
      b.passengers.find((p) => p.seatId === s.id) ?? {
        name: "",
        age: "" as const,
        gender: "" as Passenger["gender"],
        mobile: "",
        seatId: s.id,
        seatNumber: s.seatNumber,
      },
  );
  const lockExpiresAt =
    selectedSeats.length === 0 ? null : b.lockExpiresAt && !b.lockExpired ? b.lockExpiresAt : Date.now() + 300_000;
  patchBooking({ selectedSeats, passengers, lockExpiresAt, lockExpired: false, fare: calculateFare(selectedSeats) });
}
export function setPassengers(passengers: Passenger[]) {
  patchBooking({ passengers });
}
export function expireSeatLock() {
  patchBooking({ selectedSeats: [], passengers: [], lockExpiresAt: null, lockExpired: true, fare: calculateFare([]) });
}
export function clearLockExpiredNotice() {
  patchBooking({ lockExpired: false });
}
export function setConfirmedBooking(booking: Booking) {
  patchBooking({ confirmedBooking: booking, lockExpiresAt: null });
}
export function resetBooking() {
  set({ booking: emptyBooking });
}
