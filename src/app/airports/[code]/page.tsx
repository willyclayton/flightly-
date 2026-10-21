"use client";

import { use } from "react";
import Link from "next/link";
import { getAirport } from "@/data/airports";
import { AirportOps } from "@/components/AirportOps";
import { WeatherChip } from "@/components/WeatherChip";

export default function AirportDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const airport = getAirport(code);

  if (!airport) {
    return (
      <div className="card rounded-3xl p-10 text-center">
        <h1 className="display text-3xl">Airport not in catalog</h1>
        <Link href="/airports" className="btn btn-primary mt-6 inline-flex">
          Browse airports
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/airports" className="text-sm text-[var(--text-2)] hover:text-[var(--text)]">
        ← Airports
      </Link>
      <section className="card rounded-[2rem] p-6 md:p-8">
        <div className="display text-6xl text-[var(--blue)]">{airport.iata}</div>
        <h1 className="display mt-2 text-3xl md:text-4xl">{airport.name}</h1>
        <p className="mt-2 text-[var(--text-2)]">
          {airport.city}, {airport.country} · {airport.icao} · {airport.timezone}
        </p>
        <div className="mt-5">
          <WeatherChip lat={airport.lat} lon={airport.lon} label="Now" />
        </div>
        {airport.terminals && (
          <div className="mt-5 flex flex-wrap gap-2">
            {airport.terminals.map((t) => (
              <span
                key={t}
                className="rounded-full border border-[var(--divider)] px-3 py-1 text-sm text-[var(--text-2)]"
              >
                Terminal {t}
              </span>
            ))}
          </div>
        )}
      </section>
      <AirportOps iata={airport.iata} />
    </div>
  );
}
