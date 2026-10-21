"use client";

import type { Flight } from "@/lib/types";
import { fmtTime } from "@/lib/format";
import { getAirport } from "@/data/airports";

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
  if (!pred || pred.predictedDelayMin < 10) {
    return (
      <section className="card rounded-3xl p-5">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--blue)]">
          Delay predictions · Pro
        </div>
        <h3 className="display mt-2 text-2xl">Looking clean</h3>
        <p className="mt-2 text-sm text-[var(--text-2)]">
          No meaningful delay signal yet. We keep watching the inbound aircraft and ATC feeds.
        </p>
      </section>
    );
  }

  const origin = getAirport(flight.originIata);

  return (
    <section className="card relative overflow-hidden rounded-3xl p-5">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[rgba(255,214,10,0.12)] blur-2xl" />
      <div className="text-xs uppercase tracking-[0.2em] text-[var(--delay)]">
        Delay predictions · Pro
      </div>
      <h3 className="display mt-2 text-3xl">+{pred.predictedDelayMin} minutes</h3>
      <p className="mt-2 max-w-xl text-sm text-[var(--text-2)]">{pred.reason}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Cause" value={CAUSE_LABEL[pred.cause] ?? pred.cause} />
        <Metric
          label="Confidence"
          value={`${Math.round(pred.confidence * 100)}%`}
        />
        <Metric
          label="Ahead of airline"
          value={
            pred.aheadOfAirlineMin && pred.aheadOfAirlineMin > 0
              ? `${pred.aheadOfAirlineMin}m`
              : "Synced"
          }
        />
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[var(--divider)] bg-[rgba(7,17,31,0.45)] p-4">
          <div className="text-xs text-[var(--text-3)]">Airline published departure</div>
          <div className="mt-1 text-xl font-semibold">
            {fmtTime(
              flight.estimatedDeparture ?? flight.scheduledDeparture,
              origin?.timezone,
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-[rgba(255,214,10,0.35)] bg-[rgba(255,214,10,0.08)] p-4">
          <div className="text-xs text-[var(--delay)]">Flightly predicted departure</div>
          <div className="mt-1 text-xl font-semibold">
            {pred.predictedDepartureIso
              ? fmtTime(pred.predictedDepartureIso, origin?.timezone)
              : "—"}
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--divider)] p-3">
      <div className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
