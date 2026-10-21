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
    <div className="relative h-[calc(100dvh-var(--tab-h)-var(--safe-bottom))] overflow-hidden bg-black">
      {/* Full-bleed map — Flighty signature */}
      <div className="absolute inset-x-0 top-0 h-[46%]">
        <HomeMap flight={live} />
      </div>

      {/* Light bottom sheet — Flighty My Flights */}
      <div className="sheet sheet-flighty absolute inset-x-0 bottom-0 top-[34%] flex flex-col overflow-hidden">
        <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-[#d8d8de]" />

        <div className="flex items-center justify-between px-5 pb-2 pt-3">
          <h1 className="display text-[30px] leading-none tracking-[-0.5px] text-[#0b0b0f]">
            My Flights
          </h1>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              aria-label="Share"
              className="grid h-9 w-9 place-items-center rounded-full text-[#0b0b0f]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M12 3v12" strokeLinecap="round" />
                <path d="m7 8 5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => seedDemo()}
              className="grid h-9 w-9 place-items-center rounded-full bg-[#ebebef] text-[13px] font-bold text-[#3a3a40]"
              title="Reload demo"
            >
              W
            </button>
          </div>
        </div>

        {live && (live.status === "in_air" || live.phase === "boarding") && (
          <div className="px-4 pb-2">
            <div className="overflow-hidden rounded-2xl bg-[#0b0b0f]">
              <LiveActivityBanner flight={live} />
            </div>
          </div>
        )}

        <div className="mx-4 mb-2 flex rounded-full bg-[#f2f2f7] p-1">
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
              className={`flex-1 rounded-full py-2 text-[13px] font-semibold ${
                segment === key
                  ? "bg-white text-[#0b0b0f] shadow-sm"
                  : "text-[#6e6e76]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white">
          {list.length === 0 ? (
            <div className="px-6 py-10 text-center text-[15px] text-[#6e6e76]">
              No flights yet.{" "}
              <Link href="/add" className="font-semibold text-[var(--blue)]">
                Search to add
              </Link>
            </div>
          ) : (
            list.map((f) => <FlightCard key={f.id} flight={f} variant="light" />)
          )}
        </div>
      </div>
    </div>
  );
}
