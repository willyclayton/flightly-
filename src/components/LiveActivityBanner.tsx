"use client";

import Link from "next/link";
import type { Flight } from "@/lib/types";
import { getAirport } from "@/data/airports";
import { fmtTime } from "@/lib/format";
import { StatusPill } from "@/components/StatusPill";
import { differenceInMinutes, parseISO } from "date-fns";

export function LiveActivityBanner({ flight }: { flight: Flight }) {
  const origin = getAirport(flight.originIata);
  const dest = getAirport(flight.destIata);
  const dep = parseISO(flight.actualDeparture ?? flight.estimatedDeparture ?? flight.scheduledDeparture);
  const arr = parseISO(flight.actualArrival ?? flight.estimatedArrival ?? flight.scheduledArrival);
  const now = Date.now();
  const total = Math.max(1, arr.getTime() - dep.getTime());
  const elapsed = Math.min(total, Math.max(0, now - dep.getTime()));
  const pct = Math.round((elapsed / total) * 100);
  const eta = flight.estimatedArrival ?? flight.scheduledArrival;
  const minsLeft = differenceInMinutes(arr, new Date());

  return (
    <Link
      href={`/flight/${flight.id}`}
      className="flex items-center gap-3 rounded-2xl bg-[var(--surface-2)] px-3 py-3"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 text-[13px] font-semibold">
          <span className="rounded-md bg-[var(--surface-3)] px-1.5 py-0.5 text-[11px] text-[var(--text-2)]">
            {flight.airlineIata}
          </span>
          <span className="truncate">{flight.flightNumber}</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[var(--text-2)]">
            {flight.originIata}
          </span>
          <div className="live-track flex-1">
            <span style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[11px] font-semibold text-[var(--text-2)]">
            {flight.destIata}
          </span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <StatusPill flight={flight} />
        <div className="tnum mt-1 text-[13px] font-semibold text-[var(--text-2)]">
          {minsLeft > 0
            ? `${minsLeft}m · ${fmtTime(eta, dest?.timezone ?? origin?.timezone)}`
            : fmtTime(eta, dest?.timezone)}
        </div>
      </div>
    </Link>
  );
}
