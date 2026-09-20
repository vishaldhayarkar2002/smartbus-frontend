import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { BookingSteps } from "@/components/booking/BookingSteps";
import { SeatLockTimer } from "@/components/booking/SeatLockTimer";
import { FareSummary } from "@/components/booking/FareSummary";
import { EmptyState } from "@/components/common/StateBlocks";
import { RequireAuth } from "@/components/common/RequireAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPassengers } from "@/store/slices/bookingSlice";
import type { Passenger } from "@/types";
import { seatTypeLabel } from "@/utils/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_site/booking/passenger-details")({
  head: () => ({
    meta: [
      { title: "Passenger details — SmartBus" },
      { name: "description", content: "Enter traveller details for each selected seat." },
      { property: "og:title", content: "Passenger details — SmartBus" },
      { property: "og:description", content: "Name, age and gender for every passenger." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <PassengerDetailsPage />
    </RequireAuth>
  ),
});

function PassengerDetailsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedSeats, passengers, fare } = useAppSelector((state) => state.booking);

  function update(index: number, patch: Partial<Passenger>) {
    const next = passengers.map((passenger, i) =>
      i === index ? { ...passenger, ...patch } : passenger,
    );
    dispatch(setPassengers(next));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    for (const passenger of passengers) {
      if (!passenger.name.trim()) {
        toast.error("Please enter a name for every passenger.");
        return;
      }
      if (!passenger.age || Number(passenger.age) < 1 || Number(passenger.age) > 120) {
        toast.error("Please enter a valid age (1–120) for every passenger.");
        return;
      }
      if (!passenger.gender) {
        toast.error("Please select a gender for every passenger.");
        return;
      }
      if (!/^\d{10}$/.test(passenger.mobile)) {
        toast.error("Please enter a valid 10 digit mobile number for every passenger.");
        return;
      }
    }
    navigate({ to: "/booking/review" });
  }

  if (selectedSeats.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-12">
        <EmptyState
          title="No seats selected"
          description="Pick your seats first — the passenger form is created from your seat selection."
          actionLabel="Search buses"
          onAction={() => navigate({ to: "/search" })}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6">
      <BookingSteps current={2} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold tracking-tight">Passenger details</h1>
        <SeatLockTimer />
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {passengers.map((passenger, index) => {
            const seat = selectedSeats.find((s) => s.id === passenger.seatId);
            return (
              <fieldset key={passenger.seatId} className="surface-card p-5">
                <legend className="mb-3 text-sm font-bold">
                  Seat {passenger.seatNumber}
                  {seat ? ` • ${seatTypeLabel(seat.seatType)}${seat.isWindow ? " • Window" : ""}` : ""}
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`name-${index}`}>Full name</Label>
                    <Input
                      id={`name-${index}`}
                      required
                      value={passenger.name}
                      onChange={(event) => update(index, { name: event.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`age-${index}`}>Age</Label>
                    <Input
                      id={`age-${index}`}
                      inputMode="numeric"
                      required
                      value={passenger.age === "" ? "" : String(passenger.age)}
                      onChange={(event) =>
                        update(index, {
                          age: event.target.value === "" ? "" : Number(event.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`gender-${index}`}>Gender</Label>
                    <Select
                      value={passenger.gender}
                      onValueChange={(value) =>
                        update(index, { gender: value as Passenger["gender"] })
                      }
                    >
                      <SelectTrigger id={`gender-${index}`} className="w-full">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`mobile-${index}`}>Mobile number</Label>
                    <Input
                      id={`mobile-${index}`}
                      inputMode="numeric"
                      required
                      value={passenger.mobile}
                      onChange={(event) => update(index, { mobile: event.target.value })}
                      placeholder="10 digit number"
                    />
                  </div>
                </div>
              </fieldset>
            );
          })}
        </div>

        <aside className="surface-card h-fit space-y-4 p-5">
          <h2 className="font-bold">Fare summary</h2>
          <FareSummary fare={fare} seatCount={selectedSeats.length} />
          <Button type="submit" className="w-full">
            Review booking <ArrowRight className="ml-1 size-4" aria-hidden="true" />
          </Button>
        </aside>
      </form>
    </div>
  );
}
