import Papa from "papaparse";
import { addMinutes, parseISO } from "date-fns";
import type { Flight } from "@/lib/types";
import { parseFlightNumber } from "@/data/airlines";
import { getAirport } from "@/data/airports";
import { haversineNm, estimateBlockMinutes } from "@/lib/geo";
import { shareToken, uid } from "@/lib/format";

function unfoldIcs(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n[ \t]/g, "")
    .split("\n");
}

function icsValue(line: string): string {
  const idx = line.indexOf(":");
  return idx >= 0 ? line.slice(idx + 1).trim() : "";
}

function parseIcsDate(raw: string): Date | null {
  // 20261021T143000Z or 20261021T143000
  const m = raw.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?/);
  if (!m) return null;
  const iso = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}${raw.endsWith("Z") ? "Z" : ""}`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Parse airline-ish calendar events into flights. */
export function parseIcsFlights(icsText: string): Flight[] {
  const lines = unfoldIcs(icsText);
  const events: Record<string, string>[] = [];
  let cur: Record<string, string> | null = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      cur = {};
      continue;
    }
    if (line === "END:VEVENT" && cur) {
      events.push(cur);
      cur = null;
      continue;
    }
    if (!cur) continue;
    const key = line.split(":")[0].split(";")[0];
    cur[key] = icsValue(line);
  }

  const now = new Date().toISOString();
  const flights: Flight[] = [];

  for (const ev of events) {
    const summary = ev.SUMMARY ?? "";
    const desc = ev.DESCRIPTION ?? "";
    const loc = ev.LOCATION ?? "";
    const blob = `${summary} ${desc} ${loc}`;

    const fnMatch =
      blob.match(/\b([A-Z0-9]{2})\s?(\d{1,4}[A-Z]?)\b/) ||
      summary.match(/\b([A-Z]{2})\d{1,4}\b/);
    const routeMatch =
      blob.match(/\b([A-Z]{3})\s*(?:→|->|–|-|to)\s*([A-Z]{3})\b/i) ||
      loc.match(/\b([A-Z]{3})\b.*\b([A-Z]{3})\b/);

    if (!fnMatch || !routeMatch) continue;
    const flightNumber = `${fnMatch[1]}${fnMatch[2] ?? fnMatch[0].slice(2)}`.replace(/\s/g, "");
    const parsed = parseFlightNumber(flightNumber);
    if (!parsed) continue;
    const originIata = routeMatch[1].toUpperCase();
    const destIata = routeMatch[2].toUpperCase();
    if (!getAirport(originIata) || !getAirport(destIata)) continue;

    const start = parseIcsDate(ev.DTSTART ?? "");
    if (!start) continue;
    const end = parseIcsDate(ev.DTEND ?? "") ?? null;
    const o = getAirport(originIata)!;
    const d = getAirport(destIata)!;
    const nm = Math.round(haversineNm(o.lat, o.lon, d.lat, d.lon));
    const duration = end
      ? Math.max(30, Math.round((end.getTime() - start.getTime()) / 60000))
      : estimateBlockMinutes(nm);
    const arr = end ?? addMinutes(start, duration);

    flights.push({
      id: uid(),
      flightNumber: parsed.airlineIata + parsed.number,
      airlineIata: parsed.airlineIata,
      originIata,
      destIata,
      scheduledDeparture: start.toISOString(),
      scheduledArrival: arr.toISOString(),
      estimatedDeparture: start.toISOString(),
      estimatedArrival: arr.toISOString(),
      status: "on_time",
      phase: "scheduled",
      distanceNm: nm,
      durationMin: duration,
      shareToken: shareToken(),
      createdAt: now,
      updatedAt: now,
      notes: "Imported from calendar",
    });
  }

  return flights;
}

export function parseCsvFlights(csvText: string): Flight[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  const now = new Date().toISOString();
  const flights: Flight[] = [];

  for (const row of parsed.data) {
    const flightNumber = (
      row.flightNumber ||
      row.flight ||
      row.Flight ||
      row.FLIGHT ||
      ""
    )
      .replace(/\s+/g, "")
      .toUpperCase();
    const originIata = (row.origin || row.from || row.Origin || "").toUpperCase();
    const destIata = (row.destination || row.to || row.Destination || "").toUpperCase();
    const depRaw = row.departure || row.date || row.Departure || "";
    if (!flightNumber || !originIata || !destIata || !depRaw) continue;
    const pn = parseFlightNumber(flightNumber);
    if (!pn || !getAirport(originIata) || !getAirport(destIata)) continue;
    let dep: Date;
    try {
      dep = parseISO(depRaw.includes("T") ? depRaw : `${depRaw}T12:00:00`);
      if (Number.isNaN(dep.getTime())) dep = new Date(depRaw);
    } catch {
      continue;
    }
    const o = getAirport(originIata)!;
    const d = getAirport(destIata)!;
    const nm = Math.round(haversineNm(o.lat, o.lon, d.lat, d.lon));
    const duration = estimateBlockMinutes(nm);
    const arr = addMinutes(dep, duration);
    flights.push({
      id: uid(),
      flightNumber: pn.airlineIata + pn.number,
      airlineIata: pn.airlineIata,
      originIata,
      destIata,
      scheduledDeparture: dep.toISOString(),
      scheduledArrival: arr.toISOString(),
      estimatedDeparture: dep.toISOString(),
      estimatedArrival: arr.toISOString(),
      status: "on_time",
      phase: "scheduled",
      distanceNm: nm,
      durationMin: duration,
      shareToken: shareToken(),
      createdAt: now,
      updatedAt: now,
      notes: "Imported from CSV",
    });
  }

  return flights;
}
