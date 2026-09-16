import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/common/StateBlocks";
import { useAppSelector } from "@/store/hooks";

/**
 * Client-side route guard. Auth lives in localStorage, so we wait for
 * hydration before deciding what to show.
 */
export function RequireAuth({
  children,
  adminOnly = false,
}: {
  children: ReactNode;
  adminOnly?: boolean;
}) {
  const { isAuthenticated, hydrated, user } = useAppSelector((state) => state.auth);

  if (!hydrated) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <LoadingSkeleton rows={2} height="h-24" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/12 text-primary">
          <Lock className="size-6" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-bold">Please sign in</h1>
        <p className="text-sm text-muted-foreground">
          You need to be signed in to view this page. Demo credentials are shown on the sign in
          screen.
        </p>
        <Button asChild>
          <Link to="/login">Go to sign in</Link>
        </Button>
      </div>
    );
  }

  if (adminOnly && user?.role !== "ADMIN") {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-destructive/12 text-destructive">
          <ShieldAlert className="size-6" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-bold">Admins only</h1>
        <p className="text-sm text-muted-foreground">
          This area is restricted to SmartBus administrators. Sign in with the admin demo account to
          explore it.
        </p>
        <Button asChild variant="outline">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    );
  }

  return children;
}
