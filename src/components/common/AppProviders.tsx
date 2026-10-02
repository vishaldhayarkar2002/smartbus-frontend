import { useEffect, type ReactNode } from "react";
import { useAppStore } from "@/state/useAppStore";

/** Restores the persisted session and booking draft after hydration (client only). */
export function AppProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useAppStore.persist.rehydrate();
  }, []);
  return children;
}
