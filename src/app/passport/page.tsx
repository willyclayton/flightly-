"use client";

import { useMemo, useState } from "react";
import { useFlightly } from "@/lib/store";
import { computePassport } from "@/lib/passport";
import { PassportMap } from "@/components/PassportMap";
import { getAirport } from "@/data/airports";
import { getAirline } from "@/data/airlines";
import { nmToMiles } from "@/lib/geo";
import { durationLabel } from "@/lib/format";

export default function PassportPage() {
  const flights = useFlightly((s) => s.flights);
  const [year, setYear] = useState<number | "all">("all");
  const years = useMemo(() => {
    const ys = new Set<number>();
    for (const f of flights) {
      ys.add(new Date(f.scheduledDeparture).getFullYear());
    }
    return ["all" as const, ...[...ys].sort((a, b) => b - a)];
  }, [flights]);

  const stats = useMemo(() => computePassport(flights, year), [flights, year]);

  return (
    <div className="space-y-6 px-4 pb-8 pt-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="display text-[28px]">Profile</h1>
          <p className="mt-1 text-[15px] text-[var(--text-2)]">
            Passport · unlimited history on your device
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {years.map((y) => (
            <button
              key={String(y)}
              type="button"
              onClick={() => setYear(y)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                year === y
                  ? "bg-[rgba(10,132,255,0.16)] text-[var(--blue)]"
                  : "text-[var(--text-2)] hover:text-[var(--text)]"
              }`}
            >
              {y === "all" ? "All time" : y}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Flights" value={String(stats.flights)} />
        <Stat label="Miles" value={stats.miles.toLocaleString()} />
        <Stat label="Hours" value={String(stats.hours)} />
        <Stat label="Airports" value={String(stats.airports)} />
        <Stat label="Countries" value={String(stats.countries)} />
        <Stat label="Airlines" value={String(stats.airlines)} />
        <Stat
          label="Longest sector"
          value={`${Math.round(nmToMiles(stats.longestNm)).toLocaleString()} mi`}
        />
        <Stat
          label="Avg block"
          value={
            stats.flights
              ? durationLabel(Math.round((stats.hours * 60) / stats.flights))
              : "—"
          }
        />
      </div>

      <PassportMap flights={flights} />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="display text-2xl">Most visited</h2>
          <ul className="mt-4 space-y-3">
            {stats.mostVisited.map((m) => {
              const a = getAirport(m.iata);
              return (
                <li
                  key={m.iata}
                  className="flex items-center justify-between border-b border-[var(--divider)] pb-3 last:border-0"
                >
                  <div>
                    <div className="font-semibold">
                      {m.iata} · {a?.city ?? ""}
                    </div>
                    <div className="text-xs text-[var(--text-2)]">{a?.name}</div>
                  </div>
                  <div className="text-[var(--blue)]">{m.count}×</div>
                </li>
              );
            })}
            {stats.mostVisited.length === 0 && (
              <li className="text-sm text-[var(--text-2)]">Fly somewhere first.</li>
            )}
          </ul>
        </div>
        <div className="card p-5">
          <h2 className="display text-2xl">Airlines flown</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {[...new Set(flights.map((f) => f.airlineIata))].map((code) => {
              const al = getAirline(code);
              return (
                <span
                  key={code}
                  className="rounded-full border border-[var(--divider)] px-3 py-1 text-sm"
                >
                  {code}
                  {al ? ` · ${al.name}` : ""}
                </span>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
        {label}
      </div>
      <div className="display tnum mt-2 text-[28px]">{value}</div>
    </div>
  );
}
