import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BusFront, SlidersHorizontal } from "lucide-react";
import { SearchCard } from "@/components/common/SearchCard";
import { BusCard } from "@/components/booking/BusCard";
import { EmptyState, ErrorState, LoadingSkeleton } from "@/components/common/StateBlocks";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { searchBuses } from "@/services/busService";
import { useAppSelector } from "@/store/hooks";
import type { Schedule, SortOption } from "@/types";
import {
  TIME_SLOTS,
  durationToMinutes,
  formatCurrency,
  formatLongDate,
  matchesSlot,
  timeToMinutes,
} from "@/utils/format";

export const Route = createFileRoute("/_site/search")({
  head: () => ({
    meta: [
      { title: "Bus search results — SmartBus" },
      {
        name: "description",
        content:
          "Compare buses by departure time, price, operator and bus type, then pick your seats.",
      },
      { property: "og:title", content: "Bus search results — SmartBus" },
      {
        property: "og:description",
        content: "Filter and sort available buses for your journey on SmartBus.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SearchPage,
});

const MAX_PRICE = 2500;

function SearchPage() {
  const search = useAppSelector((state) => state.search);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [departureSlots, setDepartureSlots] = useState<string[]>([]);
  const [arrivalSlots, setArrivalSlots] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [ac, setAc] = useState(false);
  const [nonAc, setNonAc] = useState(false);
  const [sleeper, setSleeper] = useState(false);
  const [seater, setSeater] = useState(false);
  const [operators, setOperators] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>("EARLIEST_DEPARTURE");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchBuses(search);
      setSchedules(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load buses.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  const allOperators = useMemo(
    () => Array.from(new Set(schedules.map((s) => s.bus.operator))).sort(),
    [schedules],
  );

  function toggle(list: string[], value: string, set: (next: string[]) => void) {
    set(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  function resetFilters() {
    setDepartureSlots([]);
    setArrivalSlots([]);
    setMaxPrice(MAX_PRICE);
    setAc(false);
    setNonAc(false);
    setSleeper(false);
    setSeater(false);
    setOperators([]);
  }

  const visible = useMemo(() => {
    const filtered = schedules.filter((schedule) => {
      if (!matchesSlot(schedule.departureTime, departureSlots)) return false;
      if (!matchesSlot(schedule.arrivalTime, arrivalSlots)) return false;
      if (schedule.fare > maxPrice) return false;
      const isAc = schedule.bus.busType.startsWith("AC");
      if (ac && !isAc) return false;
      if (nonAc && isAc) return false;
      if (sleeper && schedule.bus.layoutType !== "SLEEPER") return false;
      if (seater && schedule.bus.layoutType !== "SEATER") return false;
      if (operators.length > 0 && !operators.includes(schedule.bus.operator)) return false;
      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "PRICE_LOW":
          return a.fare - b.fare;
        case "PRICE_HIGH":
          return b.fare - a.fare;
        case "SHORTEST_DURATION":
          return durationToMinutes(a.duration) - durationToMinutes(b.duration);
        case "RATING":
          return b.rating - a.rating;
        default:
          return timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime);
      }
    });
  }, [schedules, departureSlots, arrivalSlots, maxPrice, ac, nonAc, sleeper, seater, operators, sort]);

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Filters</h2>
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Clear all
          </Button>
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Departure time</legend>
        {TIME_SLOTS.map((slot) => (
          <div key={slot.id} className="flex items-center gap-2">
            <Checkbox
              id={`dep-${slot.id}`}
              checked={departureSlots.includes(slot.id)}
              onCheckedChange={() => toggle(departureSlots, slot.id, setDepartureSlots)}
            />
            <Label htmlFor={`dep-${slot.id}`} className="font-normal">
              {slot.label}
            </Label>
          </div>
        ))}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Arrival time</legend>
        {TIME_SLOTS.map((slot) => (
          <div key={slot.id} className="flex items-center gap-2">
            <Checkbox
              id={`arr-${slot.id}`}
              checked={arrivalSlots.includes(slot.id)}
              onCheckedChange={() => toggle(arrivalSlots, slot.id, setArrivalSlots)}
            />
            <Label htmlFor={`arr-${slot.id}`} className="font-normal">
              {slot.label}
            </Label>
          </div>
        ))}
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="max-price" className="text-sm font-semibold">
          Max price: {formatCurrency(maxPrice)}
        </Label>
        <Slider
          id="max-price"
          min={300}
          max={MAX_PRICE}
          step={50}
          value={[maxPrice]}
          onValueChange={(value) => setMaxPrice(value[0] ?? MAX_PRICE)}
        />
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Bus type</legend>
        {[
          { id: "ac", label: "AC", checked: ac, set: setAc },
          { id: "nonAc", label: "Non-AC", checked: nonAc, set: setNonAc },
          { id: "sleeper", label: "Sleeper", checked: sleeper, set: setSleeper },
          { id: "seater", label: "Seater", checked: seater, set: setSeater },
        ].map((option) => (
          <div key={option.id} className="flex items-center gap-2">
            <Checkbox
              id={`type-${option.id}`}
              checked={option.checked}
              onCheckedChange={(value) => option.set(value === true)}
            />
            <Label htmlFor={`type-${option.id}`} className="font-normal">
              {option.label}
            </Label>
          </div>
        ))}
      </fieldset>

      {allOperators.length > 0 ? (
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Operator</legend>
          {allOperators.map((operator) => (
            <div key={operator} className="flex items-center gap-2">
              <Checkbox
                id={`op-${operator}`}
                checked={operators.includes(operator)}
                onCheckedChange={() => toggle(operators, operator, setOperators)}
              />
              <Label htmlFor={`op-${operator}`} className="font-normal">
                {operator}
              </Label>
            </div>
          ))}
        </fieldset>
      ) : null}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <SearchCard compact />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">
            {search.from} → {search.to}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatLongDate(search.journeyDate)} • {visible.length} bus
            {visible.length === 1 ? "" : "es"} found
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="mr-2 size-4" aria-hidden="true" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-8">{filterPanel}</div>
            </SheetContent>
          </Sheet>

          <div className="w-52">
            <Label htmlFor="sort" className="sr-only">
              Sort results
            </Label>
            <Select value={sort} onValueChange={(value) => setSort(value as SortOption)}>
              <SelectTrigger id="sort" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EARLIEST_DEPARTURE">Earliest departure</SelectItem>
                <SelectItem value="PRICE_LOW">Price: low to high</SelectItem>
                <SelectItem value="PRICE_HIGH">Price: high to low</SelectItem>
                <SelectItem value="SHORTEST_DURATION">Shortest duration</SelectItem>
                <SelectItem value="RATING">Highest rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="surface-card hidden h-fit p-5 lg:block">{filterPanel}</aside>

        <div className="space-y-4">
          {loading ? (
            <LoadingSkeleton rows={4} height="h-32" />
          ) : error ? (
            <ErrorState message={error} onRetry={() => void load()} />
          ) : visible.length === 0 ? (
            <EmptyState
              icon={BusFront}
              title="No buses match your filters"
              description="Try widening the price range, clearing time filters, or searching a different date."
              actionLabel="Clear filters"
              onAction={resetFilters}
            />
          ) : (
            visible.map((schedule) => <BusCard key={schedule.id} schedule={schedule} />)
          )}
        </div>
      </div>
    </div>
  );
}
