import { addMinutes } from "date-fns";
import type { Flight } from "@/lib/types";
import { getAirport } from "@/data/airports";
import { haversineNm, estimateBlockMinutes } from "@/lib/geo";

export function createManualFlight(opts: {
  flightNumber: string;
  airlineIata: string;
  originIata: string;
  destIata: string;
  departureLocal: string;
  durationMin?: number;
  gate?: string;
  terminal?: string;
  bookingCode?: string;
  seat?: string;
  registration?: string;
}): Pick<
  Flight,
  | "flightNumber"
  | "airlineIata"
  | "originIata"
  | "destIata"
  | "scheduledDeparture"
  | "scheduledArrival"
  | "estimatedDeparture"
  | "estimatedArrival"
  | "terminal"
  | "gate"
  | "bookingCode"
  | "seat"
  | "distanceNm"
  | "durationMin"
  | "aircraft"
> {
  const o = getAirport(opts.originIata);
  const d = getAirport(opts.destIata);
  const nm = o && d ? Math.round(haversineNm(o.lat, o.lon, d.lat, d.lon)) : 500;
  const duration = opts.durationMin ?? estimateBlockMinutes(nm);
  // datetime-local values are timezone-naive; Date parses them as local.
  const dep = new Date(opts.departureLocal);
  if (Number.isNaN(dep.getTime())) {
    throw new Error("Invalid departure time");
  }
  const arr = addMinutes(dep, duration);

  return {
    flightNumber: opts.flightNumber.toUpperCase(),
    airlineIata: opts.airlineIata.toUpperCase(),
    originIata: opts.originIata.toUpperCase(),
    destIata: opts.destIata.toUpperCase(),
    scheduledDeparture: dep.toISOString(),
    scheduledArrival: arr.toISOString(),
    estimatedDeparture: dep.toISOString(),
    estimatedArrival: arr.toISOString(),
    terminal: opts.terminal || undefined,
    gate: opts.gate || undefined,
    bookingCode: opts.bookingCode || undefined,
    seat: opts.seat || undefined,
    distanceNm: nm,
    durationMin: duration,
    aircraft: opts.registration
      ? { registration: opts.registration.toUpperCase() }
      : undefined,
  };
}
