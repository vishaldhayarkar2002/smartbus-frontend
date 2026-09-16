import { useEffect, type ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { hydrateAuth } from "@/store/slices/authSlice";
import { hydrateBooking } from "@/store/slices/bookingSlice";
import { STORAGE_KEYS } from "@/config/env";

/** Restores persisted auth/booking state after hydration (client only). */
function StoreHydrator({ children }: { children: ReactNode }) {
  useEffect(() => {
    try {
      const authRaw = window.localStorage.getItem(STORAGE_KEYS.auth);
      store.dispatch(hydrateAuth(authRaw ? JSON.parse(authRaw) : null));
      const bookingRaw = window.localStorage.getItem(STORAGE_KEYS.booking);
      if (bookingRaw) store.dispatch(hydrateBooking(JSON.parse(bookingRaw)));
    } catch {
      store.dispatch(hydrateAuth(null));
    }
  }, []);

  return children;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <StoreHydrator>{children}</StoreHydrator>
    </Provider>
  );
}
