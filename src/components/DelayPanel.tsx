"use client";

import type { Flight } from "@/lib/types";
import { fmtTime } from "@/lib/format";
import { getAirport } from "@/data/airports";
import { ProLabel, SectionCard, StatCell } from "@/components/ui";

const CAUSE_LABEL: Record<string, string> = {
  late_aircraft: "Late arriving aircraft",
  weather: "Weather",
  atc: "Air traffic control",
  ground_stop: "Ground stop / GDP",
  crew: "Crew",
  maintenance: "Maintenance",
  congestion: "Airport congestion",
  unknown: "Early signal",
};

export function DelayPanel({ flight }: { flight: Flight }) {
  const pred = flight.delayPrediction;
  const origin = getAirport(flight.originIata);

  if (!pred || pred.predictedDelayMin < 10) {
    return (
      <SectionCard>
        <ProLabel>Delay predictions · Pro</ProLabel>
        <h3 className="display mt-2 text-[28px]">Looking clean</h3>
        <p className="mt-2 text-[15px] text-[var(--text-2)]">
          No meaningful delay signal yet. We keep watching the inbound aircraft and ATC feeds.
        </p>
      </SectionCard>
    );
  }

  return (
    <SectionCard className="relative overflow-hidden">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[rgba(255,214,10,0.1)] blur-2xl" />
      <ProLabel>Delay predictions · Pro</ProLabel>
      <h3 className="display mt-2 text-[32px] text-[var(--delay)]">
        +{pred.predictedDelayMin} minutes
      </h3>
      <p className="mt-2 max-w-xl text-[15px] text-[var(--text-2)]">{pred.reason}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <StatCell label="Cause" value={CAUSE_LABEL[pred.cause] ?? pred.cause} />
        <StatCell label="Confidence" value={`${Math.round(pred.confidence * 100)}%`} />
        <StatCell
          label="Ahead of airline"
          value={
            pred.aheadOfAirlineMin && pred.aheadOfAirlineMin > 0
              ? `${pred.aheadOfAirlineMin}m`
              : "Synced"
          }
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface-2)]/40 p-4">
          <div className="text-[11px] text-[var(--text-3)]">Airline published departure</div>
          <div className="tnum mt-1 text-xl font-semibold">
            {fmtTime(
              flight.estimatedDeparture ?? flight.scheduledDeparture,
              origin?.timezone,
            )}
          </div>
        </div>
        <div className="rounded-xl border border-[rgba(255,214,10,0.35)] bg-[rgba(255,214,10,0.08)] p-4">
          <div className="text-[11px] text-[var(--delay)]">Flightly predicted departure</div>
          <div className="tnum mt-1 text-xl font-semibold">
            {pred.predictedDepartureIso
              ? fmtTime(pred.predictedDepartureIso, origin?.timezone)
              : "—"}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
