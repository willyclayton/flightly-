"use client";

import Link from "next/link";
import { airportOpsReport } from "@/lib/predictions";
import { getAirport } from "@/data/airports";
import { ProLabel, SectionCard, StatCell } from "@/components/ui";

export function AirportOps({ iata }: { iata: string }) {
  const airport = getAirport(iata);
  const report = airportOpsReport(iata);

  return (
    <SectionCard>
      <ProLabel>Airport intelligence · Pro</ProLabel>
      <h3 className="display mt-2 text-[32px]">
        <Link href={`/airports/${iata}`} className="hover:text-[var(--blue)]">
          {iata}
        </Link>
      </h3>
      <p className="mt-1 text-[13px] text-[var(--text-2)]">
        {airport ? `${airport.name} · ${airport.city}` : iata}
      </p>

      <p className="mt-4 text-[15px]">{report.summary}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <StatCell label="Takeoff delay trend" value={`+${report.takeoffDelayTrendMin}m`} />
        <StatCell label="Landing delay trend" value={`+${report.landingDelayTrendMin}m`} />
        <StatCell label="Departures on time" value={`${report.departuresOnTimePct}%`} />
        <StatCell label="Arrivals on time" value={`${report.arrivalsOnTimePct}%`} />
      </div>

      {report.advisories.length > 0 && (
        <div className="mt-5 space-y-3">
          {report.advisories.map((a) => (
            <div
              key={a.id}
              className={`rounded-xl border px-4 py-3 ${
                a.severity === "warning"
                  ? "border-[rgba(255,69,58,0.35)] bg-[rgba(255,69,58,0.08)]"
                  : a.severity === "watch"
                    ? "border-[rgba(255,214,10,0.35)] bg-[rgba(255,214,10,0.08)]"
                    : "border-[var(--divider)]"
              }`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
                ATC advisory · {a.type.replaceAll("_", " ")}
              </div>
              <div className="mt-1 font-semibold">{a.title}</div>
              <p className="mt-1 text-[13px] text-[var(--text-2)]">{a.summary}</p>
              {a.probabilityExtend && (
                <p className="mt-2 text-[12px] text-[var(--delay)]">
                  Extension probability {a.probabilityExtend}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
