import { parseISO } from "date-fns";
import type { Flight, PassportStats } from "@/lib/types";
import { getAirport } from "@/data/airports";
import { nmToMiles } from "@/lib/geo";

export function computePassport(flights: Flight[], year: number | "all" = "all"): PassportStats {
  const landed = flights.filter((f) => {
    const when = parseISO(f.actualArrival ?? f.scheduledArrival);
    if (year !== "all" && when.getFullYear() !== year) return false;
    return (
      f.phase === "arrived" ||
      f.status === "landed" ||
      when.getTime() < Date.now() - 60 * 60 * 1000
    );
  });

  const airports = new Set<string>();
  const countries = new Set<string>();
  const airlines = new Set<string>();
  const visitCount = new Map<string, number>();
  let miles = 0;
  let hours = 0;
  let longestNm = 0;

  for (const f of landed) {
    airports.add(f.originIata);
    airports.add(f.destIata);
    airlines.add(f.airlineIata);
    const o = getAirport(f.originIata);
    const d = getAirport(f.destIata);
    if (o) countries.add(o.country);
    if (d) countries.add(d.country);
    visitCount.set(f.originIata, (visitCount.get(f.originIata) ?? 0) + 1);
    visitCount.set(f.destIata, (visitCount.get(f.destIata) ?? 0) + 1);
    const nm = f.distanceNm ?? 0;
    miles += nmToMiles(nm);
    hours += (f.durationMin ?? 0) / 60;
    longestNm = Math.max(longestNm, nm);
  }

  const mostVisited = [...visitCount.entries()]
    .map(([iata, count]) => ({ iata, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return {
    flights: landed.length,
    airports: airports.size,
    countries: countries.size,
    airlines: airlines.size,
    miles: Math.round(miles),
    hours: Math.round(hours),
    longestNm,
    mostVisited,
    year,
  };
}

export function routeArcs(flights: Flight[]): Array<{
  from: { lat: number; lon: number; iata: string };
  to: { lat: number; lon: number; iata: string };
}> {
  const arcs = [];
  for (const f of flights) {
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
