"use client";

import { useMemo } from "react";
import Link from "next/link";
import { parseISO } from "date-fns";
import { useFlightly } from "@/lib/store";
import { getAirport } from "@/data/airports";
import { fmtTime } from "@/lib/format";
import { flightCountdown, timeToneClass } from "@/lib/countdown";
import { LiveMap } from "@/components/LiveMap";

/**
 * Glanceable “widget mode” for during a flight.
 * Add to Home Screen, then open /live for a lock-screen-like strip + big status.
 * (True iOS Lock Screen widgets still need a native app.)
 */
export default function LiveWidgetPage() {
  const flights = useFlightly((s) => s.flights);

  const flight = useMemo(() => {
    const now = Date.now();
    const upcoming = [...flights]
      .filter(
        (f) =>
          parseISO(f.actualArrival ?? f.estimatedArrival ?? f.scheduledArrival).getTime() >=
            now - 2 * 3600_000 && f.status !== "cancelled",
      )
      .sort(
        (a, b) =>
          parseISO(a.scheduledDeparture).getTime() -
          parseISO(b.scheduledDeparture).getTime(),
      );
    return (
      upcoming.find((f) => f.status === "in_air") ??
      upcoming.find((f) =>
        ["boarding", "taxi_out", "departed_gate", "check_in"].includes(f.phase),
      ) ??
      upcoming[0] ??
      null
    );
  }, [flights]);

  if (!flight) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="display text-[28px]">No active flight</h1>
        <p className="text-[15px] text-[var(--text-2)]">
          Add a trip, then reopen Live for a glanceable status screen.
        </p>
        <Link href="/add" className="btn btn-primary">
          Add a flight
        </Link>
        <Link href="/" className="text-[15px] font-semibold text-[var(--blue)]">
          My Flights
        </Link>
      </div>
    );
  }

  const origin = getAirport(flight.originIata);
  const dest = getAirport(flight.destIata);
  const countdown = flightCountdown(flight);
  const depIso = flight.estimatedDeparture ?? flight.scheduledDeparture;
  const arrIso = flight.estimatedArrival ?? flight.scheduledArrival;
  const gate = flight.gate ?? flight.gatePrediction?.gate ?? "—";

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[var(--canvas)] pb-[calc(24px+var(--safe-bottom))]">
      <div className="flex items-center justify-between px-4 pt-4">
        <Link href="/" className="text-[15px] font-semibold text-[var(--blue)]">
          ‹ Flights
        </Link>
        <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-[var(--text-3)]">
          Live
        </span>
        <Link
          href={`/flight/${flight.id}`}
          className="text-[15px] font-semibold text-[var(--text-2)]"
        >
          Details
        </Link>
      </div>

      <div className="mt-8 px-4 text-center">
        <div className="text-[13px] font-semibold text-[var(--text-2)]">
          {flight.airlineIata} {flight.flightNumber} · Gate {gate}
        </div>
        <div
          className={`display mt-3 text-[40px] leading-none tracking-[-0.5px] ${timeToneClass(countdown.tone)}`}
        >
          {countdown.label}
        </div>
        <div className="mt-4 flex items-end justify-center gap-6">
          <div>
            <div className="display text-[36px] tracking-[0.4px]">{flight.originIata}</div>
            <div className={`tnum mt-1 text-[22px] font-bold ${timeToneClass(countdown.tone)}`}>
              {fmtTime(depIso, origin?.timezone)}
            </div>
          </div>
          <div className="pb-2 text-[var(--blue)]">✈</div>
          <div>
            <div className="display text-[36px] tracking-[0.4px]">{flight.destIata}</div>
            <div className="tnum mt-1 text-[22px] font-bold">
              {fmtTime(arrIso, dest?.timezone)}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-4 mt-6 overflow-hidden rounded-2xl border border-[var(--divider)]">
        <LiveMap flight={flight} height={260} />
      </div>

      <p className="mt-4 px-6 text-center text-[12px] text-[var(--text-3)]">
        Pin this page to your Home Screen for a flight-time glance view. iOS Lock Screen
        widgets need a native app — this is the closest free web version.
      </p>
    </div>
  );
}
