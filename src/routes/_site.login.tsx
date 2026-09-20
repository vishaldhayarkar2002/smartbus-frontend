import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEMO_CREDENTIALS } from "@/data/mockData";
import { login } from "@/services/authService";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { toast } from "sonner";

export const Route = createFileRoute("/_site/login")({
  head: () => ({
    meta: [
      { title: "Sign in — SmartBus" },
      { name: "description", content: "Sign in to SmartBus to manage bookings and e-tickets." },
      { property: "og:title", content: "Sign in — SmartBus" },
      { property: "og:description", content: "Access your SmartBus bookings and profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await login({ email: email.trim(), password });
      dispatch(setCredentials(result));
      toast.success(`Welcome back, ${result.user.fullName.split(" ")[0]}!`);
      navigate({ to: result.user.role === "ADMIN" ? "/admin" : "/my-bookings" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  function useDemo(kind: "user" | "admin") {
    setEmail(DEMO_CREDENTIALS[kind].email);
    setPassword(DEMO_CREDENTIALS[kind].password);
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="surface-card p-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use your SmartBus account to see bookings and e-tickets.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={loading}>
            <LogIn className="mr-2 size-4" aria-hidden="true" />
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
          <Link to="/register" className="text-primary hover:underline">
            Create account
          </Link>
        </div>

        <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/40 p-4">
          <h2 className="text-sm font-semibold">Demo credentials</h2>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>
              Traveller: <strong>{DEMO_CREDENTIALS.user.email}</strong> /{" "}
              <strong>{DEMO_CREDENTIALS.user.password}</strong>
            </li>
            <li>
              Admin: <strong>{DEMO_CREDENTIALS.admin.email}</strong> /{" "}
              <strong>{DEMO_CREDENTIALS.admin.password}</strong>
            </li>
          </ul>
          <div className="mt-3 flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => useDemo("user")}>
              Fill traveller
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => useDemo("admin")}>
              Fill admin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
