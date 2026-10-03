/** Mock payment service. Future: POST /api/payments with an Idempotency-Key header. */
import { mockRequest } from "@/services/api";
import type { PaymentRequest, PaymentResponse } from "@/types";

// Successful charges keyed by booking reference: retrying the same reference
// never charges twice (mirrors a server-side idempotency key).
const settled = new Map<string, PaymentResponse>();

export async function makePayment(request: PaymentRequest): Promise<PaymentResponse> {
  const previous = settled.get(request.bookingReference);
  if (previous) return mockRequest(previous, 200);
  const success = Math.random() > 0.15;
  const response: PaymentResponse = {
    success,
    transactionId: `TXN${crypto.randomUUID().slice(0, 12).toUpperCase()}`,
    message: success
      ? `Payment of ₹${request.amount} received via ${request.method}.`
      : "Your bank declined the transaction. No amount was deducted.",
  };
  if (success) settled.set(request.bookingReference, response);
  return mockRequest(response, 1800);
}
