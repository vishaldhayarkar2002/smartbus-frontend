/** Shared TanStack Query keys and hooks for admin data. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listBuses, listRoutes, listSchedules, listUsers } from "@/services/adminService";
import { getAllBookings } from "@/services/bookingService";

export const adminKeys = {
  buses: ["admin", "buses"] as const,
  routes: ["admin", "routes"] as const,
  schedules: ["admin", "schedules"] as const,
  users: ["admin", "users"] as const,
  bookings: ["bookings", "all"] as const,
};

export const useBuses = () => useQuery({ queryKey: adminKeys.buses, queryFn: listBuses });
export const useRoutes = () => useQuery({ queryKey: adminKeys.routes, queryFn: listRoutes });
export const useSchedules = () =>
  useQuery({ queryKey: adminKeys.schedules, queryFn: listSchedules });
export const useUsers = () => useQuery({ queryKey: adminKeys.users, queryFn: listUsers });
export const useAllBookings = () =>
  useQuery({ queryKey: adminKeys.bookings, queryFn: getAllBookings });

/** Runs a write that returns the new table, stores it in the cache, and refreshes related data. */
export function useAdminWrite<TArg, TData>(
  key: readonly string[],
  fn: (arg: TArg) => Promise<TData>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (data) => {
      queryClient.setQueryData(key, data);
      void queryClient.invalidateQueries({ queryKey: ["buses"] });
    },
  });
}

export const errorText = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;
