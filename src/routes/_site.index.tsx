import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  BadgePercent,
  BusFront,
  Headphones,
  ShieldCheck,
  Ticket,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { SearchCard } from "@/components/common/SearchCard";
import { Button } from "@/components/ui/button";
import { POPULAR_ROUTES } from "@/data/mockData";
import { useAppDispatch } from "@/store/hooks";
import { setSearch } from "@/store/slices/searchSlice";
import { useAppSelector } from "@/store/hooks";
import { formatCurrency } from "@/utils/format";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "SmartBus — Book Intercity Bus Tickets Online" },
      {
        name: "description",
        content:
          "Search buses between Indian cities, pick your seat on a live seat map and get instant booking confirmation with SmartBus.",
      },
      { property: "og:title", content: "SmartBus — Book Intercity Bus Tickets Online" },
      {
        property: "og:description",
        content: "Live seat maps, transparent fares and instant e-tickets for intercity bus travel.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const offers = [
  {
    code: "SMARTFIRST",
    title: "Flat ₹100 off your first trip",
    description: "Applies on bookings above ₹500. One use per traveller.",
  },
  {
    code: "NIGHTRIDE",
    title: "10% off overnight sleepers",
    description: "Valid on AC sleeper buses departing after 9 PM.",
  },
  {
    code: "WEEKEND25",
    title: "₹75 cashback on weekends",
    description: "Book Friday to Sunday journeys and get cashback to your wallet.",
  },
];

const benefits = [
  {
    icon: Ticket,
    title: "Live seat map",
    description: "Pick the exact berth or seat you want, with window seats clearly marked.",
  },
  {
    icon: Wallet,
    title: "Transparent fares",
    description: "See base fare, taxes and convenience fee before you pay — no surprises.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & verified operators",
    description: "Every operator on SmartBus is verified with ratings from real travellers.",
  },
  {
    icon: Headphones,
    title: "Support that answers",
    description: "Reach our travel desk any time on 1800 123 4567 for changes or refunds.",
  },
];

function HomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const journeyDate = useAppSelector((state) => state.search.journeyDate);

  function openRoute(from: string, to: string) {
    dispatch(setSearch({ from, to, journeyDate }));
    navigate({ to: "/search" });
  }

  return (
    <div>
      <section className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:py-16">
          <p className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            <BusFront className="size-4" aria-hidden="true" /> 2,000+ daily departures
          </p>
          <h1 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            Book your next bus journey in under a minute
          </h1>
          <p className="mt-3 max-w-xl text-sm text-primary-foreground/80 sm:text-base">
            Compare operators, choose your seat on a real seat map and pay securely. Your e-ticket is
            ready instantly.
          </p>
        </div>
      </section>

      <div className="mx-auto -mt-8 w-full max-w-7xl px-4">
        <SearchCard />
      </div>

      <section className="mx-auto w-full max-w-7xl px-4 py-12">
        <h2 className="text-xl font-bold tracking-tight">Popular routes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The journeys travellers book most on SmartBus.
        </p>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POPULAR_ROUTES.map((route) => (
            <li key={`${route.from}-${route.to}`}>
              <button
                type="button"
                onClick={() => openRoute(route.from, route.to)}
                className="surface-card flex w-full items-center justify-between gap-3 p-4 text-left transition-colors hover:border-primary"
              >
                <span>
                  <span className="block font-semibold">
                    {route.from} → {route.to}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    from {formatCurrency(route.startingFare)}
                  </span>
                </span>
                <ArrowRight className="size-4 text-primary" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto w-full max-w-7xl px-4 py-12">
          <h2 className="text-xl font-bold tracking-tight">Offers for you</h2>
          <ul className="mt-5 grid gap-4 md:grid-cols-3">
            {offers.map((offer) => (
              <li key={offer.code} className="surface-card p-5">
                <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                  <BadgePercent className="size-3.5" aria-hidden="true" /> {offer.code}
                </span>
                <h3 className="mt-3 font-semibold">{offer.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{offer.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12">
        <h2 className="text-xl font-bold tracking-tight">Why travellers choose SmartBus</h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <li key={benefit.title} className="surface-card p-5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3 font-semibold">{benefit.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{benefit.description}</p>
              </li>
            );
          })}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" onClick={() => navigate({ to: "/search" })}>
            Find buses now
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate({ to: "/my-bookings" })}>
            View my bookings
          </Button>
        </div>
      </section>
    </div>
  );
}
