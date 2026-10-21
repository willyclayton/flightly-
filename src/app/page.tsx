"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { parseISO } from "date-fns";
import { useFlightly } from "@/lib/store";
import { FlightCard } from "@/components/FlightCard";
import { HomeMap } from "@/components/HomeMap";
import { LiveActivityBanner } from "@/components/LiveActivityBanner";

type Segment = "upcoming" | "past";

export default function HomePage() {
  const flights = useFlightly((s) => s.flights);
  const seedDemo = useFlightly((s) => s.seedDemo);
  const [segment, setSegment] = useState<Segment>("upcoming");

  const { upcoming, past, live } = useMemo(() => {
    const now = Date.now();
    const sorted = [...flights].sort(
      (a, b) =>
        parseISO(a.scheduledDeparture).getTime() -
        parseISO(b.scheduledDeparture).getTime(),
    );
    const upcoming = sorted.filter(
      (f) =>
        parseISO(f.actualArrival ?? f.estimatedArrival ?? f.scheduledArrival).getTime() >=
          now - 2 * 3600_000 && f.status !== "cancelled",
    );
    const past = sorted.filter((f) => !upcoming.includes(f)).reverse();
    const live =
      upcoming.find((f) => f.status === "in_air") ??
      upcoming.find((f) =>
        ["boarding", "taxi_out", "departed_gate", "check_in"].includes(f.phase),
      ) ??
      upcoming[0] ??
      null;
    return { upcoming, past, live };
  }, [flights]);

  const list = segment === "upcoming" ? upcoming : past.slice(0, 24);

  return (
    <div className="relative h-[calc(100dvh-var(--tab-h)-var(--safe-bottom))] overflow-hidden">
      {/* Full-bleed map — Flighty signature */}
      <div className="absolute inset-x-0 top-0 h-[42%]">
        <HomeMap flight={live} />
      </div>

      {/* Bottom sheet */}
      <div className="sheet absolute inset-x-0 bottom-0 top-[38%] flex flex-col overflow-hidden">
        <div className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-[var(--surface-3)]" />

        <div className="flex items-center justify-between px-4 pb-2 pt-3">
          <div>
            <h1 className="display text-[28px] leading-none tracking-[-0.4px]">
              My Flights
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => seedDemo()}
              className="rounded-full px-2.5 py-1 text-[12px] font-semibold text-[var(--text-3)]"
            >
              Demo
            </button>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[var(--surface-3)] text-[13px] font-bold text-[var(--text-2)]">
              W
            </div>
          </div>
        </div>

        <Link
          href="/add"
          className="mx-4 mb-3 flex h-11 items-center gap-2 rounded-xl bg-[var(--surface-2)] px-3 text-[15px] text-[var(--text-2)]"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          Search to add flights
        </Link>

        {live && (live.status === "in_air" || live.phase === "boarding") && (
          <div className="px-4 pb-3">
            <LiveActivityBanner flight={live} />
          </div>
        )}

        <div className="mx-4 mb-2 flex rounded-[10px] bg-[var(--canvas)] p-1">
          {(
            [
              ["upcoming", "Upcoming"],
              ["past", "Past"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSegment(key)}
              className={`flex-1 rounded-lg py-1.5 text-[13px] font-semibold ${
                segment === key
                  ? "bg-[var(--blue)] text-white"
                  : "text-[var(--text-2)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {list.length === 0 ? (
            <div className="px-6 py-10 text-center text-[15px] text-[var(--text-2)]">
              No flights yet.{" "}
              <Link href="/add" className="font-semibold text-[var(--blue)]">
                Search to add
              </Link>
            </div>
          ) : (
            list.map((f) => <FlightCard key={f.id} flight={f} />)
          )}
        </div>
      </div>
    </div>
  );
}
