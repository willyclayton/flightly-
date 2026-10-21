import { addHours, addMinutes, subDays, subHours } from "date-fns";
import type { Flight } from "@/lib/types";
import { haversineNm, estimateBlockMinutes } from "@/lib/geo";
import { getAirport } from "@/data/airports";
import { predictDelay, predictGate } from "@/lib/predictions";
import { enrichFlight } from "@/lib/status";
import { shareToken, uid } from "@/lib/format";
import { parseFlightNumber } from "@/data/airlines";

function route(origin: string, dest: string, dep: Date) {
  const o = getAirport(origin);
  const d = getAirport(dest);
  if (!o || !d) {
    throw new Error(`Unknown airport in demo route: ${origin}→${dest}`);
  }
  const nm = Math.round(haversineNm(o.lat, o.lon, d.lat, d.lon));
  const duration = estimateBlockMinutes(nm);
  return {
    distanceNm: nm,
    durationMin: duration,
    scheduledDeparture: dep.toISOString(),
    scheduledArrival: addMinutes(dep, duration).toISOString(),
  };
}

export function buildDemoFlights(now = new Date()): Flight[] {
  const flights: Flight[] = [];

  // Upcoming: AUS → JFK tomorrow morning with late inbound prediction story
  {
    const dep = addHours(now, 18);
    const base = route("AUS", "JFK", dep);
    let f: Flight = {
      id: uid(),
      flightNumber: "DL884",
      airlineIata: "DL",
      originIata: "AUS",
      destIata: "JFK",
      ...base,
      estimatedDeparture: base.scheduledDeparture,
      estimatedArrival: base.scheduledArrival,
      status: "on_time",
      phase: "scheduled",
      terminal: "1",
      gate: undefined,
      arrivalTerminal: "4",
      bookingCode: "XYZ2AB",
      seat: "14A",
      cabin: "economy",
      aircraft: {
        registration: "N378DN",
        icao24: "a455a8",
        type: "A321",
        model: "Airbus A321-211",
        ageYears: 8,
        name: "Spirit of Atlanta",
      },
      inboundFlightNumber: "DL1271",
      inboundEta: addMinutes(dep, 55).toISOString(),
      baggageClaim: undefined,
      shareToken: shareToken(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      isDemo: true,
      notes: "Morning coffee run — watch the inbound.",
    };
    f.delayPrediction = predictDelay(f, now);
    f.gatePrediction = predictGate(f);
    f = enrichFlight(f, now);
    flights.push(f);
  }

  // In the air: SFO → LHR (simulated cruise)
  {
    const dep = subHours(now, 4);
    const base = route("SFO", "LHR", dep);
    let f: Flight = {
      id: uid(),
      flightNumber: "BA286",
      airlineIata: "BA",
      originIata: "SFO",
      destIata: "LHR",
      ...base,
      estimatedDeparture: base.scheduledDeparture,
      estimatedArrival: addMinutes(parse(base.scheduledArrival), -18).toISOString(),
      actualDeparture: addMinutes(dep, 8).toISOString(),
      status: "in_air",
      phase: "cruise",
      terminal: "I",
      gate: "A11",
      arrivalTerminal: "5",
      arrivalGate: "A15",
      bookingCode: "BA9K2M",
      seat: "2K",
      cabin: "business",
      aircraft: {
        registration: "G-ZBLB",
        type: "B789",
        model: "Boeing 787-9 Dreamliner",
        ageYears: 6,
      },
      shareToken: shareToken(),
      createdAt: subDays(now, 20).toISOString(),
      updatedAt: now.toISOString(),
      isDemo: true,
    };
    f = enrichFlight(f, now);
    flights.push(f);
  }

  // Connection pair: JFK → CDG then CDG → FCO
  {
    const dep1 = addHours(now, 40);
    const base1 = route("JFK", "CDG", dep1);
    let f1: Flight = {
      id: uid(),
      flightNumber: "AF007",
      airlineIata: "AF",
      originIata: "JFK",
      destIata: "CDG",
      ...base1,
      estimatedDeparture: base1.scheduledDeparture,
      estimatedArrival: base1.scheduledArrival,
      status: "on_time",
      phase: "scheduled",
      terminal: "1",
      gate: "B32",
      arrivalTerminal: "2E",
      arrivalGate: "K42",
      bookingCode: "AFCONN",
      seat: "18C",
      cabin: "economy",
      aircraft: { type: "B77W", model: "Boeing 777-300ER", registration: "F-GSQJ" },
      shareToken: shareToken(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      isDemo: true,
    };
    f1.gatePrediction = predictGate(f1);
    f1 = enrichFlight(f1, now);
    flights.push(f1);

    const dep2 = addMinutes(parse(base1.scheduledArrival), 85);
    const base2 = route("CDG", "FCO", dep2);
    let f2: Flight = {
      id: uid(),
      flightNumber: "AF1004",
      airlineIata: "AF",
      originIata: "CDG",
      destIata: "FCO",
      ...base2,
      estimatedDeparture: base2.scheduledDeparture,
      estimatedArrival: base2.scheduledArrival,
      status: "on_time",
      phase: "scheduled",
      terminal: "2F",
      gate: undefined,
      arrivalTerminal: "1",
      bookingCode: "AFCONN",
      seat: "22F",
      cabin: "economy",
      aircraft: { type: "A320", model: "Airbus A320-214" },
      shareToken: shareToken(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      isDemo: true,
    };
    f2.gatePrediction = predictGate(f2);
    f2.delayPrediction = predictDelay(f2, now);
    f2 = enrichFlight(f2, now);
    flights.push(f2);
  }

  // Past passport filler
  const past: Array<[string, string, string, number]> = [
    ["UA1523", "SFO", "ORD", 45],
    ["UA688", "ORD", "BOS", 44],
    ["B61234", "BOS", "LAX", 30],
    ["AS512", "LAX", "SEA", 28],
    ["DL401", "SEA", "ATL", 21],
    ["DL890", "ATL", "MIA", 20],
    ["AA100", "JFK", "LHR", 90],
    ["BA460", "LHR", "BCN", 88],
    ["IB610", "BCN", "FCO", 87],
    ["AZ610", "FCO", "JFK", 85],
    ["B6701", "MIA", "LAS", 60],
    ["WN2201", "LAS", "DEN", 59],
    ["UA482", "DEN", "SFO", 58],
    ["SQ25", "SFO", "SIN", 120],
    ["SQ11", "SIN", "NRT", 118],
    ["NH6", "NRT", "JFK", 115],
  ];

  for (const [fn, o, d, daysAgo] of past) {
    if (!getAirport(o) || !getAirport(d)) continue;
    const parsed = parseFlightNumber(fn);
    const airlineIata = parsed?.airlineIata ?? fn.slice(0, 2);
    const flightNumber = parsed ? parsed.airlineIata + parsed.number : fn;
    const dep = subDays(now, daysAgo);
    const base = route(o, d, addHours(dep, 9));
    let f: Flight = {
      id: uid(),
      flightNumber,
      airlineIata,
      originIata: o,
      destIata: d,
      ...base,
      estimatedDeparture: base.scheduledDeparture,
      estimatedArrival: base.scheduledArrival,
      actualDeparture: addMinutes(parse(base.scheduledDeparture), -4 + (daysAgo % 20)).toISOString(),
      actualArrival: addMinutes(parse(base.scheduledArrival), -12 + (daysAgo % 15)).toISOString(),
      status: "landed",
      phase: "arrived",
      terminal: "1",
      gate: `B${(daysAgo % 40) + 1}`,
      arrivalGate: `C${(daysAgo % 30) + 1}`,
      baggageClaim: `${(daysAgo % 8) + 1}`,
      cabin: daysAgo % 5 === 0 ? "business" : "economy",
      aircraft: { type: daysAgo % 2 ? "B738" : "A320" },
      shareToken: shareToken(),
      createdAt: subDays(now, daysAgo + 5).toISOString(),
      updatedAt: parse(base.scheduledArrival).toISOString(),
      isDemo: true,
    };
    f = enrichFlight(f, parse(base.scheduledArrival));
    flights.push(f);
  }

  return flights;
}

function parse(iso: string): Date {
  return new Date(iso);
}

export const DEMO_FRIENDS = [
  { name: "Maya", flight: "UA441 · SFO→EWR", status: "Boarding", eta: "On time" },
  { name: "Chris", flight: "DL212 · ATL→LGA", status: "Delayed 32m", eta: "Late aircraft" },
  { name: "Priya", flight: "BA178 · LHR→JFK", status: "En route", eta: "22m early" },
];
