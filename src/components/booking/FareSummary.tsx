import type { FareBreakdown } from "@/types";
import { formatCurrency } from "@/utils/format";

export function FareSummary({ fare, seatCount }: { fare: FareBreakdown; seatCount?: number }) {
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex items-center justify-between">
        <dt className="text-muted-foreground">
          Base fare{typeof seatCount === "number" ? ` (${seatCount} seat${seatCount === 1 ? "" : "s"})` : ""}
        </dt>
        <dd className="font-medium">{formatCurrency(fare.baseFare)}</dd>
      </div>
      <div className="flex items-center justify-between">
        <dt className="text-muted-foreground">Taxes &amp; GST (5%)</dt>
        <dd className="font-medium">{formatCurrency(fare.taxes)}</dd>
      </div>
      <div className="flex items-center justify-between">
        <dt className="text-muted-foreground">Convenience fee</dt>
        <dd className="font-medium">{formatCurrency(fare.convenienceFee)}</dd>
      </div>
      <div className="flex items-center justify-between border-t border-border pt-2 text-base">
        <dt className="font-bold">Total payable</dt>
        <dd className="font-extrabold">{formatCurrency(fare.total)}</dd>
      </div>
    </dl>
  );
}
