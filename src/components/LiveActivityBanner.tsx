"use client";

import Link from "next/link";
import type { Flight } from "@/lib/types";
import { getAirport } from "@/data/airports";
import { fmtTime } from "@/lib/format";
import { flightCountdown, timeToneClass } from "@/lib/countdown";
import { differenceInMinutes, parseISO } from "date-fns";

/** Mirrors Flighty’s Live Activity / Dynamic Island progress strip. */
export function LiveActivityBanner({ flight }: { flight: Flight }) {
  const dest = getAirport(flight.destIata);
  const countdown = flightCountdown(flight);
  const dep = parseISO(
    flight.actualDeparture ?? flight.estimatedDeparture ?? flight.scheduledDeparture,
  );
  const arr = parseISO(
    flight.actualArrival ?? flight.estimatedArrival ?? flight.scheduledArrival,
  );
  const total = Math.max(1, arr.getTime() - dep.getTime());
  const pct = Math.round(
    Math.min(100, Math.max(0, ((Date.now() - dep.getTime()) / total) * 100)),
  );
  const minsLeft = Math.max(0, differenceInMinutes(arr, new Date()));
  const gate =
    flight.gate ??
    flight.arrivalGate ??
    flight.gatePrediction?.gate ??
    "—";

  return (
    <Link
      href={`/flight/${flight.id}`}
      className="flex items-center gap-3 rounded-2xl bg-[var(--surface-2)] px-3 py-3"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[var(--canvas)] px-1.5 py-0.5 text-[11px] font-bold text-[var(--text-2)]">
            {flight.airlineIata}
          </span>
          <span className="truncate text-[13px] font-semibold">
            {flight.flightNumber}
          </span>
          <span className="tnum text-[12px] font-semibold text-[var(--text-2)]">
            {gate.startsWith("Gate") ? gate : `Gate ${gate}`}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-wide text-[var(--text-2)]">
            {flight.originIata}
          </span>
          <div className="live-track flex-1">
            <span style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[11px] font-bold tracking-wide text-[var(--text-2)]">
            {flight.destIata}
          </span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className={`text-[12px] font-bold uppercase tracking-wide ${timeToneClass(countdown.tone)}`}>
          {flight.status === "in_air" ||
          ["taxi_out", "airborne", "cruise", "descent", "approach"].includes(flight.phase)
            ? "En Route"
            : countdown.tone === "warn"
              ? "Delayed"
              : countdown.tone === "bad"
                ? countdown.label
                : "On Time"}
        </div>
        <div className="tnum mt-0.5 text-[13px] font-semibold text-[var(--text-2)]">
          {minsLeft > 0
            ? `${minsLeft}m · ${fmtTime(flight.estimatedArrival ?? flight.scheduledArrival, dest?.timezone)}`
            : fmtTime(flight.estimatedArrival ?? flight.scheduledArrival, dest?.timezone)}
        </div>
      </div>
    </Link>
  );
}
