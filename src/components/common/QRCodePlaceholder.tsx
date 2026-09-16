import { cn } from "@/lib/utils";

/**
 * Deterministic block pattern derived from the booking ID.
 * Swap the grid for a real QR image once the backend/library is in place.
 */
export function QRCodePlaceholder({
  value,
  size = 120,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const cells = 9;
  const seed = Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return (
    <div className={cn("inline-flex flex-col items-center gap-1", className)}>
      <div
        className="grid gap-[2px] rounded-md border border-border bg-card p-2"
        style={{ width: size, height: size, gridTemplateColumns: `repeat(${cells}, 1fr)` }}
        role="img"
        aria-label={`QR code for booking ${value}`}
      >
        {Array.from({ length: cells * cells }).map((_, index) => {
          const filled = (seed + index * 7 + (index % cells) * 13) % 3 !== 0;
          return (
            <span
              key={index}
              className={filled ? "rounded-[1px] bg-foreground" : "rounded-[1px] bg-transparent"}
            />
          );
        })}
      </div>
      <span className="text-[10px] font-medium tracking-wide text-muted-foreground">{value}</span>
    </div>
  );
}
