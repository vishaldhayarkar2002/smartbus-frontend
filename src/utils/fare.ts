import type { FareBreakdown, Seat } from "@/types";

export const TAX_RATE = 0.05;
export const CONVENIENCE_FEE = 20;

/** Base fare is the sum of the selected seat prices. */
export function calculateFare(seats: Seat[]): FareBreakdown {
  const baseFare = seats.reduce((sum, seat) => sum + seat.price, 0);
  if (baseFare === 0) return { baseFare: 0, taxes: 0, convenienceFee: 0, total: 0 };
  const taxes = Math.round(baseFare * TAX_RATE);
  const convenienceFee = CONVENIENCE_FEE;
  return { baseFare, taxes, convenienceFee, total: baseFare + taxes + convenienceFee };
}
