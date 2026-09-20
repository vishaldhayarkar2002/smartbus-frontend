import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftRight, CalendarDays, MapPin, Search } from "lucide-react";
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
import { CITIES } from "@/data/mockData";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSearch } from "@/store/slices/searchSlice";
import { toast } from "sonner";

/** City + date search form. Used on the home page and above search results. */
export function SearchCard({ compact = false }: { compact?: boolean }) {
  const search = useAppSelector((state) => state.search);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [from, setFrom] = useState(search.from);
  const [to, setTo] = useState(search.to);
  const [journeyDate, setJourneyDate] = useState(search.journeyDate);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (from === to) {
      toast.error("Source and destination cannot be the same city.");
      return;
    }
    if (!journeyDate) {
      toast.error("Please choose a journey date.");
      return;
    }
    dispatch(setSearch({ from, to, journeyDate }));
    navigate({ to: "/search" });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={compact ? "surface-card p-4" : "surface-card p-4 sm:p-6"}
      aria-label="Search buses"
    >
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr_1fr_auto] md:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="from-city">From</Label>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger id="from-city" className="w-full">
              <MapPin className="mr-1 size-4 text-primary" aria-hidden="true" />
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={swap}
          aria-label="Swap source and destination"
          className="md:mb-0.5"
        >
          <ArrowLeftRight className="size-4" aria-hidden="true" />
        </Button>

        <div className="space-y-1.5">
          <Label htmlFor="to-city">To</Label>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger id="to-city" className="w-full">
              <MapPin className="mr-1 size-4 text-accent-foreground" aria-hidden="true" />
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="journey-date">
            <CalendarDays className="size-4 text-primary" aria-hidden="true" /> Journey date
          </Label>
          <Input
            id="journey-date"
            type="date"
            value={journeyDate}
            onChange={(event) => setJourneyDate(event.target.value)}
          />
        </div>

        <Button type="submit" size="lg" className="w-full md:w-auto">
          <Search className="mr-2 size-4" aria-hidden="true" /> Search buses
        </Button>
      </div>
    </form>
  );
}
