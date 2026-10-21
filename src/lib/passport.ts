import { parseISO, getDay, differenceInMinutes } from "date-fns";
import type { Flight, PassportStats } from "@/lib/types";
import { getAirport } from "@/data/airports";
import { getAirline } from "@/data/airlines";
import { nmToMiles } from "@/lib/geo";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** ISO 3166-1 alpha-2 → regional-indicator flag emoji */
export function countryFlag(code: string): string {
  const cc = code.trim().toUpperCase();
  if (cc.length !== 2) return "🏳️";
  return String.fromCodePoint(
    ...[...cc].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0)),
  );
}

function filterLanded(flights: Flight[], year: number | "all") {
  return flights.filter((f) => {
    const when = parseISO(f.actualArrival ?? f.scheduledArrival);
    if (year !== "all" && when.getFullYear() !== year) return false;
    return (
      f.phase === "arrived" ||
      f.status === "landed" ||
      when.getTime() < Date.now() - 60 * 60 * 1000
    );
  });
}

export function computePassport(
  flights: Flight[],
  year: number | "all" = "all",
): PassportStats {
  const landed = filterLanded(flights, year);

  const airports = new Set<string>();
  const countries = new Set<string>();
  const airlines = new Set<string>();
  const visitCount = new Map<string, number>();
  const airlineCount = new Map<string, number>();
  const routeCount = new Map<string, number>();
  const weekday = [0, 0, 0, 0, 0, 0, 0];
  let miles = 0;
  let minutes = 0;
  let longestNm = 0;
  let delayMinTotal = 0;
  let worstDelayMin = 0;
  let delayedFlights = 0;

  for (const f of landed) {
    airports.add(f.originIata);
    airports.add(f.destIata);
    airlines.add(f.airlineIata);
    airlineCount.set(f.airlineIata, (airlineCount.get(f.airlineIata) ?? 0) + 1);

    const o = getAirport(f.originIata);
    const d = getAirport(f.destIata);
    if (o) countries.add(o.country);
    if (d) countries.add(d.country);

    visitCount.set(f.originIata, (visitCount.get(f.originIata) ?? 0) + 1);
    visitCount.set(f.destIata, (visitCount.get(f.destIata) ?? 0) + 1);

    const route = `${f.originIata}–${f.destIata}`;
    routeCount.set(route, (routeCount.get(route) ?? 0) + 1);

    const when = parseISO(f.actualDeparture ?? f.scheduledDeparture);
    weekday[getDay(when)] += 1;

    const nm = f.distanceNm ?? 0;
    miles += nmToMiles(nm);
    minutes += f.durationMin ?? 0;
    longestNm = Math.max(longestNm, nm);

    const depDelay = Math.max(
      0,
      differenceInMinutes(
        parseISO(f.actualDeparture ?? f.estimatedDeparture ?? f.scheduledDeparture),
        parseISO(f.scheduledDeparture),
      ),
    );
    const pred = f.delayPrediction?.predictedDelayMin ?? 0;
    const delay = Math.max(depDelay, pred, f.status === "delayed" ? 15 : 0);
    if (delay > 0) {
      delayedFlights += 1;
      delayMinTotal += delay;
      worstDelayMin = Math.max(worstDelayMin, delay);
    }
  }

  const mostVisited = [...visitCount.entries()]
    .map(([iata, count]) => ({ iata, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const topAirlines = [...airlineCount.entries()]
    .map(([iata, count]) => ({
      iata,
      name: getAirline(iata)?.name ?? iata,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const topRoutes = [...routeCount.entries()]
    .map(([route, count]) => ({ route, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const weekdayFlights = WEEKDAYS.map((label, day) => ({
    day,
    label,
    count: weekday[day],
  }));

  const countryList = [...countries]
    .map((code) => ({
      code,
      flag: countryFlag(code),
      name: code,
    }))
    .sort((a, b) => a.code.localeCompare(b.code));

  const hoursWhole = Math.floor(minutes / 60);
  const minsRem = Math.round(minutes % 60);

  return {
    flights: landed.length,
    airports: airports.size,
    countries: countries.size,
    airlines: airlines.size,
    miles: Math.round(miles),
    hours: Math.round(minutes / 60),
    flightTimeLabel: `${hoursWhole}h ${minsRem}m`,
    longestNm,
    mostVisited,
    topAirlines,
    topRoutes,
    weekdayFlights,
    countriesList: countryList,
    delayHours: Math.round(delayMinTotal / 60),
    delayMinTotal,
    worstDelayMin,
    delayedFlights,
    year,
  };
}

export function routeArcs(
  flights: Flight[],
  year: number | "all" = "all",
): Array<{
  from: { lat: number; lon: number; iata: string };
  to: { lat: number; lon: number; iata: string };
}> {
  const landed = filterLanded(flights, year);
  const arcs = [];
  for (const f of landed) {
    const o = getAirport(f.originIata);
    const d = getAirport(f.destIata);
    if (!o || !d) continue;
    arcs.push({
      from: { lat: o.lat, lon: o.lon, iata: o.iata },
      to: { lat: d.lat, lon: d.lon, iata: d.iata },
    });
  }
  return arcs;
}

export function mrzLines(stats: PassportStats, memberName = "WILL"): [string, string] {
  const year =
    stats.year === "all" ? "ALL" : String(stats.year).padStart(4, "0");
  const name = memberName.toUpperCase().replace(/[^A-Z]/g, "").padEnd(10, "<").slice(0, 10);
  const line1 = `${year}<<<${name}<<<<<<MEMBER<<<<<<<<FLIGHTY<<<<<`;
  const line2 = `ISSUED<<<<<<<<<<<<<<<<<<<<<<<<<<FLIGHTY.COM<<<<<`;
  return [line1.slice(0, 44), line2.slice(0, 44)];
}
