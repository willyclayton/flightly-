"use client";

import Link from "next/link";
import type { Flight } from "@/lib/types";
import { getAirport } from "@/data/airports";
import { fmtTime } from "@/lib/format";
import { flightCountdown, timeToneClass } from "@/lib/countdown";

/** Compact My Flights list row — matches Flighty’s sheet cells. */
export function FlightCard({
  flight,
  variant = "dark",
}: {
  flight: Flight;
  index?: number;
  variant?: "dark" | "light";
}) {
  const origin = getAirport(flight.originIata);
  const dest = getAirport(flight.destIata);
  const depIso = flight.estimatedDeparture ?? flight.scheduledDeparture;
  const arrIso = flight.estimatedArrival ?? flight.scheduledArrival;
  const countdown = flightCountdown(flight);
  const light = variant === "light";
  const muted = light ? "text-[#6e6e76]" : "text-[var(--text-2)]";
  const strong = light ? "text-[#0b0b0f]" : "text-[var(--text)]";
  const line = light ? "border-[#ebebef]" : "border-[var(--divider)]";
  const press = light ? "active:bg-[#f5f5f7]" : "active:bg-[var(--surface-3)]";
  const cityLine = light
    ? `${origin?.city ?? flight.originIata} to ${dest?.city ?? flight.destIata}`
    : `${origin?.city ?? flight.originIata} – ${dest?.city ?? flight.destIata}`;

  return (
    <Link
      href={`/flight/${flight.id}`}
      className={`block border-b ${line} px-4 py-3.5 ${press}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={`text-[13px] font-semibold tracking-wide ${muted}`}>
            {flight.airlineIata} {flight.flightNumber.replace(flight.airlineIata, "")}
          </div>
          {light ? (
            <div className={`mt-1 display text-[20px] tracking-[-0.3px] ${strong}`}>
              {cityLine}
            </div>
          ) : (
            <>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="display text-[22px] tracking-[0.4px]">
                  {flight.originIata}
                </span>
                <span className="text-[13px] text-[var(--text-3)]">→</span>
                <span className="display text-[22px] tracking-[0.4px]">
                  {flight.destIata}
                </span>
              </div>
              <div className={`mt-0.5 truncate text-[13px] ${muted}`}>{cityLine}</div>
            </>
          )}
          {light && (
            <div className={`tnum mt-1 text-[13px] ${muted}`}>
              {flight.originIata} {fmtTime(depIso, origin?.timezone)}
              {"  ·  "}
              {flight.destIata} {fmtTime(arrIso, dest?.timezone)}
            </div>
          )}
        </div>

        <div className="shrink-0 text-right">
          {!light && (
            <>
              <div className={`tnum text-[15px] font-bold ${timeToneClass(countdown.tone)}`}>
                {fmtTime(depIso, origin?.timezone)}
              </div>
              <div className={`tnum mt-0.5 text-[15px] font-bold ${strong}`}>
                {fmtTime(arrIso, dest?.timezone)}
              </div>
            </>
          )}
          <div
            className={`mt-1 max-w-[140px] text-[12px] font-semibold leading-tight ${timeToneClass(countdown.tone)}`}
          >
            {countdown.label}
          </div>
        </div>
      </div>

      {(flight.gate || flight.terminal || flight.gatePrediction?.gate) && (
        <div className={`tnum mt-2 text-[13px] font-semibold tracking-wide ${muted}`}>
          {flight.terminal ? `T${flight.terminal}` : ""}
          {flight.terminal && (flight.gate || flight.gatePrediction?.gate) ? " · " : ""}
          {flight.gate
            ? `Gate ${flight.gate}`
            : flight.gatePrediction?.gate
              ? `Gate ${flight.gatePrediction.gate}`
              : ""}
        </div>
      )}
    </Link>
  );
}
