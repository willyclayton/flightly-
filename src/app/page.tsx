"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { parseISO } from "date-fns";
import { useFlightly } from "@/lib/store";
import { FlightCard } from "@/components/FlightCard";
import { HomeMap } from "@/components/HomeMap";
import { LiveActivityBanner } from "@/components/LiveActivityBanner";
import { findConnections } from "@/lib/connections";
import { ConnectionAssistant } from "@/components/ConnectionAssistant";
import { FriendsStrip } from "@/components/FriendsStrip";

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

  const list = segment === "upcoming" ? upcoming : past.slice(0, 20);
  const connections = useMemo(() => findConnections(upcoming), [upcoming]);

  return (
    <div>
      <header className="flex items-center justify-between px-4 pb-2 pt-4">
        <h1 className="display text-[28px] leading-tight">Flights</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => seedDemo()}
            className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-[var(--text-2)]"
            title="Reload demo"
          >
            Demo
          </button>
          <Link
            href="/add"
            className="grid h-9 w-9 place-items-center rounded-full bg-[var(--blue)] text-xl font-semibold leading-none text-white"
            aria-label="Add flight"
          >
            +
          </Link>
        </div>
      </header>

      <HomeMap flight={live} />

      <div className="space-y-4 px-4 pb-8 pt-4">
        {live && (live.status === "in_air" || live.phase === "boarding") && (
          <LiveActivityBanner flight={live} />
        )}

        <div className="flex rounded-xl bg-[var(--surface-1)] p-1">
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
              className={`flex-1 rounded-[10px] py-2 text-[14px] font-semibold ${
                segment === key
                  ? "bg-[var(--blue)] text-white"
                  : "text-[var(--text-2)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {connections[0] && segment === "upcoming" && (
          <ConnectionAssistant
            inbound={connections[0].inbound}
            outbound={connections[0].outbound}
            leg={connections[0].leg}
          />
        )}

        {list.length === 0 ? (
          <div className="card p-8 text-center text-[var(--text-2)]">
            No flights here.{" "}
            <Link href="/add" className="font-semibold text-[var(--blue)]">
              Add one
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {list.map((f, i) => (
              <FlightCard key={f.id} flight={f} index={i} />
            ))}
          </div>
        )}

        {segment === "upcoming" && <FriendsStrip />}
      </div>
    </div>
  );
}
