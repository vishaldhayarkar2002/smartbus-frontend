import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, ShieldAlert } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const searchSchema = z.object({
  reason: z.enum(["signin", "role"]).catch("role"),
  from: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/_site/access-denied")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Access denied | SmartBus" },
      { name: "description", content: "You don't have permission to view this SmartBus page." },
      { property: "og:title", content: "Access denied | SmartBus" },
      { property: "og:description", content: "You don't have permission to view this SmartBus page." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccessDenied,
});

function AccessDenied() {
  const { reason } = Route.useSearch();
  const needsSignIn = reason === "signin";
  const Icon = needsSignIn ? Lock : ShieldAlert;

  return (
    <section
      aria-labelledby="denied-title"
      className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-4 py-16 text-center"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-destructive/12 text-destructive">
        <Icon className="size-7" aria-hidden="true" />
      </span>
      <h1 id="denied-title" className="text-2xl font-bold">
        {needsSignIn ? "Sign in required" : "Access denied"}
      </h1>
      <p className="text-sm text-muted-foreground" role="status">
        {needsSignIn
          ? "The admin area is only available to signed-in SmartBus administrators."
          : "Your account doesn't have administrator permissions. Sign in with an admin account to continue."}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link to="/login">{needsSignIn ? "Sign in" : "Switch account"}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </section>
  );
}
