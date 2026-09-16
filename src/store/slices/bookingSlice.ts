import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { STORAGE_KEYS } from "@/config/env";
import { calculateFare } from "@/utils/fare";
import type { Booking, FareBreakdown, Passenger, Schedule, Seat, StopPoint } from "@/types";

interface BookingState {
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

const emptyFare: FareBreakdown = { baseFare: 0, taxes: 0, convenienceFee: 0, total: 0 };

const initialState: BookingState = {
  selectedSchedule: null,
  boardingPoint: null,
  droppingPoint: null,
  selectedSeats: [],
  passengers: [],
  fare: emptyFare,
  lockExpiresAt: null,
  lockExpired: false,
  confirmedBooking: null,
};

function persist(state: BookingState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEYS.booking, JSON.stringify(state));
}

function syncFare(state: BookingState) {
  state.fare = calculateFare(state.selectedSeats);
}

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    selectSchedule(state, action: PayloadAction<Schedule>) {
      state.selectedSchedule = action.payload;
      state.boardingPoint = null;
      state.droppingPoint = null;
      state.selectedSeats = [];
      state.passengers = [];
      state.lockExpiresAt = null;
      state.lockExpired = false;
      syncFare(state);
      persist(state);
    },
    setBoardingPoint(state, action: PayloadAction<StopPoint>) {
      state.boardingPoint = action.payload;
      persist(state);
    },
    setDroppingPoint(state, action: PayloadAction<StopPoint>) {
      state.droppingPoint = action.payload;
      persist(state);
    },
    toggleSeat(state, action: PayloadAction<Seat>) {
      const seat = action.payload;
      const exists = state.selectedSeats.some((s) => s.id === seat.id);
      if (exists) {
        state.selectedSeats = state.selectedSeats.filter((s) => s.id !== seat.id);
      } else {
        state.selectedSeats = [...state.selectedSeats, { ...seat, status: "SELECTED" }];
      }
      state.passengers = state.selectedSeats.map(
        (s) =>
          state.passengers.find((p) => p.seatId === s.id) ?? {
            name: "",
            age: "",
            gender: "",
            mobile: "",
            seatId: s.id,
            seatNumber: s.seatNumber,
          },
      );
      if (state.selectedSeats.length === 0) {
        state.lockExpiresAt = null;
      } else if (!state.lockExpiresAt || state.lockExpired) {
        state.lockExpiresAt = Date.now() + 300_000;
      }
      state.lockExpired = false;
      syncFare(state);
      persist(state);
    },
    setPassengers(state, action: PayloadAction<Passenger[]>) {
      state.passengers = action.payload;
      persist(state);
    },
    expireSeatLock(state) {
      state.selectedSeats = [];
      state.passengers = [];
      state.lockExpiresAt = null;
      state.lockExpired = true;
      syncFare(state);
      persist(state);
    },
    clearLockExpiredNotice(state) {
      state.lockExpired = false;
      persist(state);
    },
    setConfirmedBooking(state, action: PayloadAction<Booking>) {
      state.confirmedBooking = action.payload;
      state.lockExpiresAt = null;
      persist(state);
    },
    resetBooking() {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem(STORAGE_KEYS.booking);
      }
      return initialState;
    },
    hydrateBooking(_state, action: PayloadAction<BookingState>) {
      return action.payload;
    },
  },
});

export const {
  selectSchedule,
  setBoardingPoint,
  setDroppingPoint,
  toggleSeat,
  setPassengers,
  expireSeatLock,
  clearLockExpiredNotice,
  setConfirmedBooking,
  resetBooking,
  hydrateBooking,
} = bookingSlice.actions;
export default bookingSlice.reducer;
export type { BookingState };
