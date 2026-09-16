import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "neutral" | "info";

const toneClasses: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/30",
  warning: "bg-warning/18 text-warning-foreground border-warning/40",
  danger: "bg-destructive/12 text-destructive border-destructive/30",
  neutral: "bg-muted text-muted-foreground border-border",
  info: "bg-primary/12 text-primary border-primary/30",
};

export function StatusBadge({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        toneClasses[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}

export function bookingStatusTone(status: string): Tone {
  if (status === "CONFIRMED") return "success";
  if (status === "COMPLETED") return "info";
  if (status === "CANCELLED") return "danger";
  return "neutral";
}
