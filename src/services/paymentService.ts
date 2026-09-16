/** Mock payment service. Future: POST /api/payments (replace with real gateway). */
import { mockRequest } from "@/services/api";
import type { PaymentRequest, PaymentResponse } from "@/types";

export async function makePayment(request: PaymentRequest): Promise<PaymentResponse> {
  // return api.post<PaymentResponse>("/payments", request).then(r => r.data)
  // Mock gateway: succeeds most of the time, occasionally fails so the
  // failure screen can be demonstrated.
  const success = Math.random() > 0.15;
  return mockRequest(
    {
      success,
      transactionId: `TXN${Date.now()}`,
      message: success
        ? `Payment of ₹${request.amount} received via ${request.method}.`
        : "Your bank declined the transaction. No amount was deducted.",
    },
    1800,
  );
}
