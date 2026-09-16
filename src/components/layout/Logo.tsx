import { BusFront } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <BusFront className="size-5" aria-hidden="true" />
      </span>
      {!compact && (
        <span className="text-lg font-extrabold tracking-tight">
          Smart<span className="text-primary">Bus</span>
        </span>
      )}
    </span>
  );
}
