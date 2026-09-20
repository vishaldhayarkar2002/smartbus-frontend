import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = ["Select bus", "Choose seats", "Passengers", "Review", "Payment"];

export function BookingSteps({ current }: { current: number }) {
  return (
    <ol className="no-print flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full border text-[11px]",
                done && "border-success bg-success/15 text-success",
                active && "border-primary bg-primary text-primary-foreground",
                !done && !active && "border-border text-muted-foreground",
              )}
              aria-hidden="true"
            >
              {done ? <Check className="size-3.5" /> : index + 1}
            </span>
            <span className={active ? "text-foreground" : "text-muted-foreground"}>{step}</span>
            {index < steps.length - 1 ? (
              <span className="hidden h-px w-6 bg-border sm:block" aria-hidden="true" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
