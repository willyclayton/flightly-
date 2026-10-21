"use client";

import { useEffect, useState } from "react";
import type { Flight, LivePosition } from "@/lib/types";
import {
  inboundProgress,
  routeProgress,
  simulatePosition,
} from "@/lib/opensky";
import { getAirport } from "@/data/airports";
import { fmtTime } from "@/lib/format";
import { phaseLabel } from "@/lib/status";
import { ProLabel, SectionCard, StatCell } from "@/components/ui";
import { parseISO, subMinutes } from "date-fns";

export function WheresMyPlane({ flight }: { flight: Flight }) {
  const [pos, setPos] = useState<LivePosition | null>(null);
  const origin = getAirport(flight.originIata);
  const inbound = inboundProgress(flight);
  const airborne =
    flight.status === "in_air" ||
    ["taxi_out", "airborne", "cruise", "descent", "approach"].includes(flight.phase);
  const selfProgress = routeProgress(flight);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Prefer live OpenSky fix when we have a hex or callsign
      try {
        const params = new URLSearchParams();
        if (flight.aircraft?.icao24) params.set("icao24", flight.aircraft.icao24);
        else params.set("callsign", flight.flightNumber.replace(/\s+/g, ""));
        const res = await fetch(`/api/opensky?${params.toString()}`);
        if (res.ok) {
          const data = (await res.json()) as { position: LivePosition | null };
          if (!cancelled && data.position) {
            setPos(data.position);
            return;
          }
        }
      } catch {
        /* fall through */
      }

      if (cancelled) return;

      if (airborne) {
        setPos(simulatePosition(flight));
        return;
      }

      // Pre-departure: simulate inbound aircraft toward origin
      if (flight.inboundEta && origin) {
        const eta = parseISO(flight.inboundEta);
        const feeder =
          ["DFW", "ORD", "ATL", "DEN", "LAX"].find((c) => c !== flight.originIata) ??
          "DFW";
        const nearby = getAirport(feeder);
        if (nearby) {
          setPos(
            simulatePosition({
              ...flight,
              id: `${flight.id}_inbound`,
              originIata: nearby.iata,
              destIata: origin.iata,
              scheduledDeparture: subMinutes(eta, 200).toISOString(),
              scheduledArrival: eta.toISOString(),
              estimatedDeparture: subMinutes(eta, 200).toISOString(),
              estimatedArrival: eta.toISOString(),
              actualDeparture: subMinutes(eta, 180).toISOString(),
            }),
          );
          return;
        }
      }

      setPos(null);
    }

    void load();
    const t = setInterval(() => void load(), 30_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [flight, airborne, origin]);

  if (!flight.aircraft && !flight.inboundFlightNumber && !flight.inboundEta) {
    return (
      <SectionCard>
        <ProLabel>Where&apos;s my plane · Pro</ProLabel>
        <p className="mt-3 text-[15px] text-[var(--text-2)]">
          Add a tail number or inbound flight to unlock 25-hour aircraft tracking.
        </p>
      </SectionCard>
    );
  }

  const pct = Math.round((airborne ? selfProgress : (inbound?.fraction ?? 0)) * 100);
  const title =
    flight.aircraft?.registration ??
    flight.inboundFlightNumber ??
    flight.flightNumber;

  return (
    <SectionCard>
      <div className="flex items-start justify-between gap-3">
        <div>
          <ProLabel>Where&apos;s my plane · Pro</ProLabel>
          <h3 className="display mt-2 text-[28px] leading-tight">{title}</h3>
          <p className="mt-1 text-[13px] text-[var(--text-2)]">
            {flight.aircraft?.model ?? flight.aircraft?.type ?? "Aircraft"}
            {flight.aircraft?.ageYears ? ` · ${flight.aircraft.ageYears}y old` : ""}
            {flight.aircraft?.name ? ` · “${flight.aircraft.name}”` : ""}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--divider)] px-3 py-2 text-right">
          <div className="text-[11px] text-[var(--text-3)]">
            {airborne ? "Phase" : "Inbound"}
          </div>
          <div className="text-[13px] font-semibold">
            {airborne
              ? phaseLabel(flight.phase)
              : (flight.inboundFlightNumber ?? "—")}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex justify-between text-[13px] text-[var(--text-2)]">
          <span>
            {airborne
              ? `${flight.originIata} → ${flight.destIata}`
              : (inbound?.label ?? "Waiting for inbound")}
          </span>
          <span className="tnum">{pct}%</span>
        </div>
        <div className="live-track">
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <StatCell
          label={airborne ? "Altitude" : "ETA to airport"}
          value={
            airborne
              ? pos?.altitudeFt != null
                ? `FL${Math.round(pos.altitudeFt / 100)}`
                : "—"
              : flight.inboundEta
                ? fmtTime(flight.inboundEta, origin?.timezone)
                : "—"
          }
        />
        <StatCell
          label={airborne ? "Groundspeed" : "Remaining"}
          value={
            airborne
              ? pos?.speedKts != null
                ? `${pos.speedKts} kts`
                : "—"
              : inbound?.nmRemaining != null
                ? `${inbound.nmRemaining} nm`
                : "—"
          }
        />
        <StatCell
          label="Live fix"
          value={
            pos
              ? `${pos.lat.toFixed(2)}, ${pos.lon.toFixed(2)}`
              : "Waiting for ADS-B"
          }
        />
      </div>

      {!airborne && flight.delayPrediction?.cause === "late_aircraft" && (
        <p className="mt-4 rounded-xl border border-[rgba(255,214,10,0.3)] bg-[rgba(255,214,10,0.08)] px-4 py-3 text-[14px] text-[var(--delay)]">
          Late inbound is the #1 delay cause. Predicted departure{" "}
          {flight.delayPrediction.predictedDepartureIso
            ? fmtTime(flight.delayPrediction.predictedDepartureIso, origin?.timezone)
            : `+${flight.delayPrediction.predictedDelayMin}m`}
          — often hours before the airline updates.
        </p>
      )}
    </SectionCard>
  );
}
