import type { LivePosition } from "@/lib/types";
import { interpolateGreatCircle, initialBearing, haversineNm } from "@/lib/geo";
import { getAirport } from "@/data/airports";
import { differenceInMinutes, parseISO } from "date-fns";
import type { Flight } from "@/lib/types";

export interface OpenSkyState {
  icao24: string;
  callsign: string | null;
  originCountry: string;
  lon: number | null;
  lat: number | null;
  baroAltitude: number | null;
  onGround: boolean;
  velocity: number | null;
  trueTrack: number | null;
  verticalRate: number | null;
  squawk: string | null;
  geoAltitude: number | null;
}

/** Parse OpenSky state vector array into a typed object. */
export function parseStateVector(row: unknown[]): OpenSkyState | null {
  if (!Array.isArray(row) || row.length < 17) return null;
  return {
    icao24: String(row[0]),
    callsign: row[1] ? String(row[1]).trim() : null,
    originCountry: String(row[2] ?? ""),
    lon: typeof row[5] === "number" ? row[5] : null,
    lat: typeof row[6] === "number" ? row[6] : null,
    baroAltitude: typeof row[7] === "number" ? row[7] : null,
    onGround: Boolean(row[8]),
    velocity: typeof row[9] === "number" ? row[9] : null,
    trueTrack: typeof row[10] === "number" ? row[10] : null,
    verticalRate: typeof row[11] === "number" ? row[11] : null,
    squawk: row[14] ? String(row[14]) : null,
    geoAltitude: typeof row[13] === "number" ? row[13] : null,
  };
}

export function stateToPosition(state: OpenSkyState): LivePosition | null {
  if (state.lat == null || state.lon == null) return null;
  return {
    lat: state.lat,
    lon: state.lon,
    altitudeFt: state.baroAltitude != null ? Math.round(state.baroAltitude * 3.28084) : undefined,
    speedKts: state.velocity != null ? Math.round(state.velocity * 1.94384) : undefined,
    heading: state.trueTrack ?? undefined,
    verticalRateFpm:
      state.verticalRate != null ? Math.round(state.verticalRate * 196.85) : undefined,
    onGround: state.onGround,
    squawk: state.squawk ?? undefined,
    updatedAt: new Date().toISOString(),
    source: "opensky",
  };
}

/**
 * Simulate a live position along the route when OpenSky has no match.
 * Used for demo flights and offline premium UX.
 */
export function simulatePosition(flight: Flight, now = new Date()): LivePosition | null {
  const origin = getAirport(flight.originIata);
  const dest = getAirport(flight.destIata);
  if (!origin || !dest) return null;

  const dep = parseISO(flight.actualDeparture ?? flight.estimatedDeparture ?? flight.scheduledDeparture);
  const arr = parseISO(flight.actualArrival ?? flight.estimatedArrival ?? flight.scheduledArrival);
  const total = Math.max(1, differenceInMinutes(arr, dep));
  const elapsed = differenceInMinutes(now, dep);

  if (elapsed < -30) return null;

  let fraction = elapsed / total;
  let onGround = false;
  let altitudeFt = 35000;
  let speedKts = 470;

  if (elapsed < 0) {
    return {
      lat: origin.lat,
      lon: origin.lon,
      altitudeFt: 0,
      speedKts: 0,
      heading: initialBearing(origin.lat, origin.lon, dest.lat, dest.lon),
      onGround: true,
      updatedAt: now.toISOString(),
      source: "simulated",
    };
  }

  if (fraction < 0.08) {
    // taxi / climb
    fraction = fraction / 0.08 * 0.05;
    altitudeFt = Math.round(fraction * 12000 / 0.05);
    speedKts = 180 + Math.round(fraction * 2000);
    onGround = fraction < 0.01;
  } else if (fraction > 0.92) {
    const land = (fraction - 0.92) / 0.08;
    fraction = 0.95 + land * 0.05;
    altitudeFt = Math.max(0, Math.round(12000 * (1 - land)));
    speedKts = Math.max(0, Math.round(220 * (1 - land)));
    onGround = land > 0.85;
  } else {
    fraction = 0.05 + ((fraction - 0.08) / 0.84) * 0.9;
  }

  if (fraction >= 1) {
    return {
      lat: dest.lat,
      lon: dest.lon,
      altitudeFt: 0,
      speedKts: 0,
      heading: initialBearing(origin.lat, origin.lon, dest.lat, dest.lon),
      onGround: true,
      updatedAt: now.toISOString(),
      source: "simulated",
    };
  }

  const pos = interpolateGreatCircle(origin.lat, origin.lon, dest.lat, dest.lon, fraction);
  return {
    lat: pos.lat,
    lon: pos.lon,
    altitudeFt,
    speedKts,
    heading: initialBearing(pos.lat, pos.lon, dest.lat, dest.lon),
    onGround,
    updatedAt: now.toISOString(),
    source: "simulated",
  };
}

export function inboundProgress(flight: Flight, now = new Date()): {
  label: string;
  eta?: string;
  fraction: number;
  nmRemaining?: number;
} | null {
  if (!flight.inboundEta) return null;
  const origin = getAirport(flight.originIata);
  if (!origin) return null;

  const eta = parseISO(flight.inboundEta);
  const mins = differenceInMinutes(eta, now);
  if (mins <= 0) {
    return { label: "Inbound aircraft arrived", eta: flight.inboundEta, fraction: 1 };
  }

  const fraction = Math.max(0.05, Math.min(0.95, 1 - mins / 300));
  const nmRemaining = Math.round(
    haversineNm(origin.lat - 4, origin.lon - 3, origin.lat, origin.lon) * (1 - fraction),
  );
  return {
    label: `Inbound ${flight.inboundFlightNumber ?? "aircraft"} · ${mins}m out`,
    eta: flight.inboundEta,
    fraction,
    nmRemaining,
  };
}

/** Progress of *this* flight along its own route (0–1). */
export function routeProgress(flight: Flight, now = new Date()): number {
  const dep = parseISO(
    flight.actualDeparture ?? flight.estimatedDeparture ?? flight.scheduledDeparture,
  );
  const arr = parseISO(
    flight.actualArrival ?? flight.estimatedArrival ?? flight.scheduledArrival,
  );
  const total = Math.max(1, arr.getTime() - dep.getTime());
  return Math.min(1, Math.max(0, (now.getTime() - dep.getTime()) / total));
}

export async function fetchOpenSkyByCallsign(
  callsign: string,
): Promise<LivePosition | null> {
  const cs = callsign.replace(/\s+/g, "").toUpperCase().padEnd(8, " ");
  try {
    const res = await fetch(
      `https://opensky-network.org/api/states/all?callsign=${encodeURIComponent(cs.trim())}`,
      { next: { revalidate: 15 }, signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { states?: unknown[][] };
    if (!data.states?.length) return null;
    const state = parseStateVector(data.states[0]);
    return state ? stateToPosition(state) : null;
  } catch {
    return null;
  }
}

export async function fetchOpenSkyByIcao24(icao24: string): Promise<LivePosition | null> {
  try {
    const res = await fetch(
      `https://opensky-network.org/api/states/all?icao24=${encodeURIComponent(icao24.toLowerCase())}`,
      { next: { revalidate: 15 }, signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { states?: unknown[][] };
    if (!data.states?.length) return null;
    const state = parseStateVector(data.states[0]);
    return state ? stateToPosition(state) : null;
  } catch {
    return null;
  }
}

export async function fetchOpenSkyBbox(
  lamin: number,
  lomin: number,
  lamax: number,
  lomax: number,
): Promise<LivePosition[]> {
  try {
    const url = `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;
    const res = await fetch(url, { next: { revalidate: 20 }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return [];
    const data = (await res.json()) as { states?: unknown[][] };
    return (data.states ?? [])
      .map(parseStateVector)
      .filter((s): s is OpenSkyState => !!s)
      .map(stateToPosition)
      .filter((p): p is LivePosition => !!p)
      .slice(0, 80);
  } catch {
    return [];
  }
}
