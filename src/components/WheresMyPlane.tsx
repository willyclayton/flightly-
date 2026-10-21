"use client";

import { useEffect, useState } from "react";
import type { Flight, LivePosition } from "@/lib/types";
import { inboundProgress, simulatePosition } from "@/lib/opensky";
import { getAirport } from "@/data/airports";
import { fmtTime, relativeLabel } from "@/lib/format";
import { parseISO, subMinutes } from "date-fns";

export function WheresMyPlane({ flight }: { flight: Flight }) {
  const [pos, setPos] = useState<LivePosition | null>(null);
  const progress = inboundProgress(flight);
  const origin = getAirport(flight.originIata);

  useEffect(() => {
    if (!flight.inboundEta) {
      setPos(null);
      return;
    }
    // Simulate inbound aircraft approaching origin
    const eta = parseISO(flight.inboundEta);
    const fakeInbound: Flight = {
      ...flight,
      id: `${flight.id}_inbound`,
      originIata: flight.originIata,
      destIata: flight.originIata,
      scheduledDeparture: subMinutes(eta, 180).toISOString(),
      scheduledArrival: eta.toISOString(),
      estimatedDeparture: subMinutes(eta, 180).toISOString(),
      estimatedArrival: eta.toISOString(),
      actualDeparture: subMinutes(eta, 160).toISOString(),
    };
    // Use a nearby "origin" offset via simulate from a synthetic route
    const nearby = getAirport(
      ["DFW", "ORD", "ATL", "DEN", "LAX"].find((c) => c !== flight.originIata) ?? "DFW",
    );
    if (nearby && origin) {
      const synthetic: Flight = {
        ...fakeInbound,
        originIata: nearby.iata,
        destIata: origin.iata,
        scheduledDeparture: subMinutes(eta, 200).toISOString(),
        scheduledArrival: eta.toISOString(),
        estimatedDeparture: subMinutes(eta, 200).toISOString(),
        estimatedArrival: eta.toISOString(),
        actualDeparture: subMinutes(eta, 180).toISOString(),
      };
      setPos(simulatePosition(synthetic));
    }
  }, [flight, origin]);

  if (!flight.aircraft && !flight.inboundFlightNumber) {
    return (
      <section className="card rounded-3xl p-5">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--blue)]">
          Where&apos;s my plane · Pro
        </div>
        <p className="mt-3 text-sm text-[var(--text-2)]">
          Add a tail number or inbound flight to unlock 25-hour aircraft tracking.
        </p>
      </section>
    );
  }

  const pct = Math.round((progress?.fraction ?? 0.35) * 100);

  return (
    <section className="card rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--blue)]">
            Where&apos;s my plane · Pro
          </div>
          <h3 className="display mt-2 text-2xl">
            {flight.aircraft?.registration ?? flight.inboundFlightNumber}
          </h3>
          <p className="mt-1 text-sm text-[var(--text-2)]">
            {flight.aircraft?.model ?? flight.aircraft?.type ?? "Aircraft"}
            {flight.aircraft?.ageYears ? ` · ${flight.aircraft.ageYears}y old` : ""}
            {flight.aircraft?.name ? ` · “${flight.aircraft.name}”` : ""}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--divider)] px-3 py-2 text-right">
          <div className="text-[11px] text-[var(--text-3)]">Inbound</div>
          <div className="font-semibold">{flight.inboundFlightNumber ?? "—"}</div>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-xs text-[var(--text-2)]">
          <span>{progress?.label ?? "Tracking"}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[rgba(10,132,255,0.12)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--blue)] to-[var(--blue)] transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Stat
          label="ETA to your gate airport"
          value={
            flight.inboundEta
              ? fmtTime(flight.inboundEta, origin?.timezone)
              : "—"
          }
        />
        <Stat
          label="Remaining"
          value={
            progress?.nmRemaining != null ? `${progress.nmRemaining} nm` : relativeLabel(flight.inboundEta ?? new Date().toISOString())
          }
        />
        <Stat
          label="Live fix"
          value={
            pos
              ? `${pos.lat.toFixed(2)}, ${pos.lon.toFixed(2)}`
              : "Waiting for ADS-B"
          }
        />
      </div>

      {flight.delayPrediction?.cause === "late_aircraft" && (
        <p className="mt-4 rounded-2xl border border-[rgba(255,214,10,0.3)] bg-[rgba(255,214,10,0.08)] px-4 py-3 text-sm text-[var(--delay)]">
          Late inbound is the #1 delay cause. Predicted departure{" "}
          {flight.delayPrediction.predictedDepartureIso
            ? fmtTime(flight.delayPrediction.predictedDepartureIso, origin?.timezone)
            : `+${flight.delayPrediction.predictedDelayMin}m`}
          — often hours before the airline updates.
        </p>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--divider)] p-3">
      <div className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
