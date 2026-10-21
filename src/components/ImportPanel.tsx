"use client";

import { useState } from "react";
import { parseCsvFlights, parseIcsFlights } from "@/lib/ics";
import { useFlightly } from "@/lib/store";

export function ImportPanel() {
  const importFlights = useFlightly((s) => s.importFlights);
  const [message, setMessage] = useState<string | null>(null);

  async function onFile(file: File) {
    const text = await file.text();
    const name = file.name.toLowerCase();
    let flights = [];
    if (name.endsWith(".ics") || text.includes("BEGIN:VCALENDAR")) {
      flights = parseIcsFlights(text);
    } else {
      flights = parseCsvFlights(text);
    }
    const n = importFlights(flights);
    setMessage(
      n > 0
        ? `Imported ${n} flight${n === 1 ? "" : "s"}.`
        : "No new flights found. Use ICS with SUMMARY like “DL884 AUS→JFK” or CSV columns flightNumber,origin,destination,departure.",
    );
  }

  return (
    <section className="card rounded-3xl p-6">
      <div className="text-xs uppercase tracking-[0.2em] text-[var(--blue)]">
        Calendar & CSV import · Pro
      </div>
      <h3 className="display mt-2 text-2xl">Import in seconds</h3>
      <p className="mt-2 text-sm text-[var(--text-2)]">
        Drop an airline calendar (.ics) or a CSV export. No TripIt subscription required —
        Flightly keeps imports local on your device.
      </p>
      <label className="btn btn-ghost mt-5 inline-flex cursor-pointer">
        Choose file
        <input
          type="file"
          accept=".ics,.csv,text/calendar,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
          }}
        />
      </label>
      {message && <p className="mt-3 text-sm text-[var(--blue)]">{message}</p>}
      <p className="mt-4 text-xs text-[var(--text-3)]">
        CSV headers: flightNumber, origin, destination, departure (ISO or date).
      </p>
    </section>
  );
}
