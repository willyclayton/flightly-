"use client";

import { useState } from "react";
import { parseCsvFlights, parseIcsFlights } from "@/lib/ics";
import { useFlightly } from "@/lib/store";
import { ProLabel, SectionCard } from "@/components/ui";

export function ImportPanel() {
  const importFlights = useFlightly((s) => s.importFlights);
  const [message, setMessage] = useState<string | null>(null);

  async function onFile(file: File) {
    const text = await file.text();
    const name = file.name.toLowerCase();
    const flights =
      name.endsWith(".ics") || text.includes("BEGIN:VCALENDAR")
        ? parseIcsFlights(text)
        : parseCsvFlights(text);
    const n = importFlights(flights);
    setMessage(
      n > 0
        ? `Imported ${n} flight${n === 1 ? "" : "s"}.`
        : "No new flights found. Use ICS with SUMMARY like “DL884 AUS→JFK” or CSV columns flightNumber,origin,destination,departure.",
    );
  }

  return (
    <SectionCard className="p-6">
      <ProLabel>Calendar & CSV import · Pro</ProLabel>
      <h3 className="display mt-2 text-[28px]">Import in seconds</h3>
      <p className="mt-2 text-[15px] text-[var(--text-2)]">
        Drop an airline calendar (.ics) or CSV export. Imports stay on this device —
        no TripIt subscription required.
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
      {message && <p className="mt-3 text-[14px] text-[var(--blue)]">{message}</p>}
      <p className="mt-4 text-[12px] text-[var(--text-3)]">
        CSV headers: flightNumber, origin, destination, departure (ISO or date).
      </p>
    </SectionCard>
  );
}
