import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { expireSeatLock } from "@/store/slices/bookingSlice";
import { formatCountdown } from "@/utils/format";

/**
 * Single effect-scoped interval that counts the 5-minute seat hold down.
 * On expiry the selection is cleared and an expiry notice is shown.
 */
export function SeatLockTimer() {
  const dispatch = useAppDispatch();
  const lockExpiresAt = useAppSelector((state) => state.booking.lockExpiresAt);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!lockExpiresAt) {
      setSecondsLeft(0);
      return;
    }
    function tick() {
      const remaining = Math.max(0, Math.round((lockExpiresAt! - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) dispatch(expireSeatLock());
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lockExpiresAt, dispatch]);

  if (!lockExpiresAt) return null;

  const urgent = secondsLeft <= 60;

  return (
    <p
      className={
        urgent
          ? "inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive"
          : "inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-semibold"
      }
      role="status"
      aria-live="polite"
    >
      <Timer className="size-4" aria-hidden="true" />
      Seats held for {formatCountdown(secondsLeft)}
    </p>
  );
}
