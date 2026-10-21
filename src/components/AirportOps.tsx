"use client";

import Link from "next/link";
import { airportOpsReport } from "@/lib/predictions";
import { getAirport } from "@/data/airports";

export function AirportOps({ iata }: { iata: string }) {
  const airport = getAirport(iata);
  const report = airportOpsReport(iata);

  return (
    <section className="card rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--blue)]">
            Airport intelligence · Pro
          </div>
          <h3 className="display mt-2 text-3xl">
            <Link href={`/airports/${iata}`} className="hover:text-[var(--blue)]">
              {iata}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-[var(--text-2)]">
            {airport ? `${airport.name} · ${airport.city}` : iata}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm text-[var(--text)]">{report.summary}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <Stat label="Takeoff delay trend" value={`+${report.takeoffDelayTrendMin}m`} />
        <Stat label="Landing delay trend" value={`+${report.landingDelayTrendMin}m`} />
        <Stat label="Departures on time" value={`${report.departuresOnTimePct}%`} />
        <Stat label="Arrivals on time" value={`${report.arrivalsOnTimePct}%`} />
      </div>

      {report.advisories.length > 0 && (
        <div className="mt-5 space-y-3">
          {report.advisories.map((a) => (
            <div
              key={a.id}
              className={`rounded-2xl border px-4 py-3 ${
                a.severity === "warning"
                  ? "border-[rgba(255,69,58,0.35)] bg-[rgba(255,69,58,0.08)]"
                  : a.severity === "watch"
                    ? "border-[rgba(255,214,10,0.35)] bg-[rgba(255,214,10,0.08)]"
                    : "border-[var(--divider)]"
              }`}
            >
              <div className="text-xs uppercase tracking-wider text-[var(--text-3)]">
                ATC advisory · {a.type.replace("_", " ")}
              </div>
              <div className="mt-1 font-semibold">{a.title}</div>
              <p className="mt-1 text-sm text-[var(--text-2)]">{a.summary}</p>
              {a.probabilityExtend && (
                <p className="mt-2 text-xs text-[var(--delay)]">
                  Extension probability {a.probabilityExtend}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--divider)] p-3">
      <div className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
