"use client";

import { use } from "react";
import Link from "next/link";
import { getAirport } from "@/data/airports";
import { AirportOps } from "@/components/AirportOps";
import { WeatherChip } from "@/components/WeatherChip";
import { EmptyState } from "@/components/ui";

export default function AirportDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const airport = getAirport(code);

  if (!airport) {
    return (
      <div className="px-4 pt-10">
        <EmptyState title="Airport not in catalog">
          <Link href="/airports" className="btn btn-primary mt-6 inline-flex">
            Browse airports
          </Link>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 pb-8 pt-4">
      <Link href="/airports" className="text-[14px] font-semibold text-[var(--blue)]">
        ← Airport
      </Link>
      <section className="card p-5 md:p-6">
        <div className="display text-[56px] leading-none text-[var(--blue)]">
          {airport.iata}
        </div>
        <h1 className="display mt-2 text-[28px]">{airport.name}</h1>
        <p className="mt-2 text-[14px] text-[var(--text-2)]">
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
                className="rounded-full border border-[var(--divider)] px-3 py-1 text-[13px] text-[var(--text-2)]"
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
