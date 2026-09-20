import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Banknote, CreditCard, Loader2, Lock, Smartphone, XCircle } from "lucide-react";
import { BookingSteps } from "@/components/booking/BookingSteps";
import { FareSummary } from "@/components/booking/FareSummary";
import { SeatLockTimer } from "@/components/booking/SeatLockTimer";
import { EmptyState } from "@/components/common/StateBlocks";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBooking, generateBookingId } from "@/services/bookingService";
import { makePayment } from "@/services/paymentService";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setConfirmedBooking } from "@/store/slices/bookingSlice";
import type { Booking, PaymentMethod } from "@/types";
import { formatCurrency } from "@/utils/format";

export const Route = createFileRoute("/_site/payment")({
  head: () => ({
    meta: [
      { title: "Payment — SmartBus" },
      {
        name: "description",
        content: "Pay for your bus booking by UPI, card or net banking (simulated gateway).",
      },
      { property: "og:title", content: "Payment — SmartBus" },
      { property: "og:description", content: "UPI, card and net banking options for your booking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <PaymentPage />
    </RequireAuth>
  ),
});

const BANKS = ["HDFC Bank", "ICICI Bank", "State Bank of India", "Axis Bank", "Kotak Mahindra Bank"];

function PaymentPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { selectedSchedule, selectedSeats, passengers, fare, boardingPoint, droppingPoint } =
    useAppSelector((state) => state.booking);

  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [bank, setBank] = useState(BANKS[0]!);
  const [processing, setProcessing] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  if (!selectedSchedule || selectedSeats.length === 0 || passengers.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <EmptyState
          title="No booking in progress"
          description="Select a bus, seats and passengers before paying."
          actionLabel="Search buses"
          onAction={() => navigate({ to: "/search" })}
        />
      </div>
    );
  }

  async function handlePay() {
    setFailure(null);
    setProcessing(true);
    const bookingId = generateBookingId(selectedSchedule!.journeyDate);
    try {
      const payment = await makePayment({ bookingReference: bookingId, amount: fare.total, method });
      if (!payment.success) {
        setFailure(payment.message);
        return;
      }
      const booking: Booking = {
        id: bookingId,
        bookingId,
        userId: user?.id ?? 1,
        customerName: user?.fullName ?? passengers[0]!.name,
        scheduleId: selectedSchedule!.id,
        operator: selectedSchedule!.bus.operator,
        busName: selectedSchedule!.bus.busName,
        busType: selectedSchedule!.bus.busType,
        source: selectedSchedule!.route.source,
        destination: selectedSchedule!.route.destination,
        journeyDate: selectedSchedule!.journeyDate,
        departureTime: selectedSchedule!.departureTime,
        arrivalTime: selectedSchedule!.arrivalTime,
        boardingPoint: boardingPoint ?? selectedSchedule!.boardingPoints[0]!,
        droppingPoint: droppingPoint ?? selectedSchedule!.droppingPoints[0]!,
        seats: selectedSeats.map((seat) => ({ seatId: seat.id, seatNumber: seat.seatNumber })),
        passengers,
        fare,
        status: "CONFIRMED",
        paymentMethod: method,
        bookedAt: new Date().toISOString(),
      };
      await createBooking(booking);
      dispatch(setConfirmedBooking(booking));
      navigate({ to: "/booking/confirmation" });
    } catch (err) {
      setFailure(err instanceof Error ? err.message : "Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  const canPay =
    method === "UPI"
      ? /^[\w.-]+@[\w]+$/.test(upiId)
      : method === "CARD"
        ? card.number.replace(/\s/g, "").length >= 12 &&
          card.name.trim().length > 2 &&
          /^\d{2}\/\d{2}$/.test(card.expiry) &&
          /^\d{3}$/.test(card.cvv)
        : Boolean(bank);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6">
      <BookingSteps current={4} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold tracking-tight">Payment</h1>
        <SeatLockTimer />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="surface-card p-5">
          {processing ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center" role="status">
              <Loader2 className="size-8 animate-spin text-primary" aria-hidden="true" />
              <p className="font-semibold">Processing your payment…</p>
              <p className="text-sm text-muted-foreground">
                Please do not close this window. This is a simulated gateway.
              </p>
            </div>
          ) : (
            <>
              {failure ? (
                <div
                  className="mb-5 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                  role="alert"
                >
                  <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <span>
                    <strong className="block">Payment failed</strong>
                    {failure} You can try again or choose another payment method.
                  </span>
                </div>
              ) : null}

              <Tabs value={method} onValueChange={(value) => setMethod(value as PaymentMethod)}>
                <TabsList>
                  <TabsTrigger value="UPI">
                    <Smartphone className="mr-1 size-4" aria-hidden="true" /> UPI
                  </TabsTrigger>
                  <TabsTrigger value="CARD">
                    <CreditCard className="mr-1 size-4" aria-hidden="true" /> Card
                  </TabsTrigger>
                  <TabsTrigger value="NETBANKING">
                    <Banknote className="mr-1 size-4" aria-hidden="true" /> Net banking
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="UPI" className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="upi">UPI ID</Label>
                    <Input
                      id="upi"
                      placeholder="yourname@bank"
                      value={upiId}
                      onChange={(event) => setUpiId(event.target.value)}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You will receive a collect request on your UPI app.
                  </p>
                </TabsContent>

                <TabsContent value="CARD" className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="card-number">Card number</Label>
                    <Input
                      id="card-number"
                      inputMode="numeric"
                      placeholder="4111 1111 1111 1111"
                      value={card.number}
                      onChange={(event) => setCard({ ...card, number: event.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="card-name">Name on card</Label>
                    <Input
                      id="card-name"
                      value={card.name}
                      onChange={(event) => setCard({ ...card, name: event.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="card-expiry">Expiry (MM/YY)</Label>
                    <Input
                      id="card-expiry"
                      placeholder="08/29"
                      value={card.expiry}
                      onChange={(event) => setCard({ ...card, expiry: event.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="card-cvv">CVV</Label>
                    <Input
                      id="card-cvv"
                      inputMode="numeric"
                      maxLength={3}
                      value={card.cvv}
                      onChange={(event) => setCard({ ...card, cvv: event.target.value })}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="NETBANKING" className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="bank">Choose your bank</Label>
                    <Select value={bank} onValueChange={setBank}>
                      <SelectTrigger id="bank" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {BANKS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>

              <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="size-3.5" aria-hidden="true" /> Demo gateway — no real money is
                charged.
              </p>
            </>
          )}
        </section>

        <aside className="surface-card h-fit space-y-4 p-5">
          <h2 className="font-bold">Fare summary</h2>
          <FareSummary fare={fare} seatCount={selectedSeats.length} />
          <Button className="w-full" disabled={!canPay || processing} onClick={() => void handlePay()}>
            Pay {formatCurrency(fare.total)}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            disabled={processing}
            onClick={() => navigate({ to: "/booking/review" })}
          >
            Back to review
          </Button>
        </aside>
      </div>
    </div>
  );
}
