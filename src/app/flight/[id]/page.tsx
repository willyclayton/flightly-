"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFlightly } from "@/lib/store";
import { getAirport } from "@/data/airports";
import { getAirline } from "@/data/airlines";
import { fmtDate, fmtTime, durationLabel, delayLabel } from "@/lib/format";
import { StatusPill } from "@/components/StatusPill";
import { LiveMap } from "@/components/LiveMap";
import { DelayPanel } from "@/components/DelayPanel";
import { WheresMyPlane } from "@/components/WheresMyPlane";
import { Timeline } from "@/components/Timeline";
import { AirportOps } from "@/components/AirportOps";
import { WeatherChip } from "@/components/WeatherChip";
import { findConnections } from "@/lib/connections";
import { ConnectionAssistant } from "@/components/ConnectionAssistant";
import { phaseLabel } from "@/lib/status";
import { EmptyState, ProLabel, SectionCard, StatCell } from "@/components/ui";

export default function FlightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const flight = useFlightly((s) => s.flights.find((f) => f.id === id));
  const flights = useFlightly((s) => s.flights);
  const removeFlight = useFlightly((s) => s.removeFlight);
  const [copied, setCopied] = useState(false);

  const connections = useMemo(() => {
    if (!flight) return [];
    return findConnections(flights).filter(
      (c) => c.inbound.id === flight.id || c.outbound.id === flight.id,
    );
  }, [flight, flights]);

  if (!flight) {
    return (
      <div className="px-4 pt-10">
        <EmptyState title="Flight not found">
          <Link href="/" className="btn btn-primary mt-6 inline-flex">
            Back to flights
          </Link>
        </EmptyState>
      </div>
    );
  }

  const origin = getAirport(flight.originIata);
  const dest = getAirport(flight.destIata);
  const airline = getAirline(flight.airlineIata);
  const depIso = flight.estimatedDeparture ?? flight.scheduledDeparture;
  const arrIso = flight.estimatedArrival ?? flight.scheduledArrival;
  const depDelay = delayLabel(flight.scheduledDeparture, flight.estimatedDeparture);
  const token = flight.shareToken ?? flight.id;

  async function share() {
    await navigator.clipboard.writeText(`${window.location.origin}/share/${token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4 px-4 pb-8 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-[14px] font-semibold text-[var(--blue)]">
          ← Flights
        </Link>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => void share()}>
            {copied ? "Link copied" : "Share live link"}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              removeFlight(flight.id);
              router.push("/");
            }}
          >
            Remove
          </button>
        </div>
      </div>

      <section className="card p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[13px] font-semibold text-[var(--text-2)]">
              {airline?.name ?? flight.airlineIata} · {flight.flightNumber}
            </div>
            <h1 className="display mt-2 text-[36px] leading-none md:text-[44px]">
              {flight.originIata} → {flight.destIata}
            </h1>
            <p className="mt-2 text-[14px] text-[var(--text-2)]">
              {fmtDate(depIso, origin?.timezone)} · {phaseLabel(flight.phase)}
            </p>
          </div>
          <StatusPill flight={flight} />
        </div>

        <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div>
            <div className="display text-[40px] leading-none tracking-wide">
              {flight.originIata}
            </div>
            <div className="mt-1 text-[13px] text-[var(--text-2)]">{origin?.city}</div>
            <div className="tnum mt-2 text-[28px] font-bold leading-none">
              {fmtTime(depIso, origin?.timezone)}
            </div>
            <div className="mt-1 text-[12px] text-[var(--text-3)]">
              Scheduled {fmtTime(flight.scheduledDeparture, origin?.timezone)}
              {depDelay ? ` · ${depDelay}` : ""}
            </div>
          </div>
          <div className="text-center text-[12px] text-[var(--text-3)]">
            <div>{durationLabel(flight.durationMin ?? 0)}</div>
            <div className="my-2 text-[var(--blue)]">✈</div>
            <div className="tnum">{flight.distanceNm ?? "—"} nm</div>
          </div>
          <div className="text-right">
            <div className="display text-[40px] leading-none tracking-wide">
              {flight.destIata}
            </div>
            <div className="mt-1 text-[13px] text-[var(--text-2)]">{dest?.city}</div>
            <div className="tnum mt-2 text-[28px] font-bold leading-none">
              {fmtTime(arrIso, dest?.timezone)}
            </div>
            <div className="mt-1 text-[12px] text-[var(--text-3)]">
              Scheduled {fmtTime(flight.scheduledArrival, dest?.timezone)}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {origin && <WeatherChip lat={origin.lat} lon={origin.lon} label="Origin" />}
          {dest && <WeatherChip lat={dest.lat} lon={dest.lon} label="Destination" />}
        </div>
      </section>

      <LiveMap flight={flight} height={360} showTraffic />

      <DelayPanel flight={flight} />
      <WheresMyPlane flight={flight} />
      <Timeline flight={flight} />

      {connections.map((c) => (
        <ConnectionAssistant
          key={`${c.inbound.id}-${c.outbound.id}`}
          inbound={c.inbound}
          outbound={c.outbound}
          leg={c.leg}
        />
      ))}

      <div className="grid gap-4 lg:grid-cols-2">
        <AirportOps iata={flight.originIata} />
        <AirportOps iata={flight.destIata} />
      </div>

      <SectionCard>
        <ProLabel>Pilot-grade details</ProLabel>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCell
            label="Aircraft"
            value={flight.aircraft?.model ?? flight.aircraft?.type ?? "—"}
          />
          <StatCell label="Registration" value={flight.aircraft?.registration ?? "—"} />
          <StatCell
            label="Cabin / seat"
            value={`${flight.cabin ?? "—"} · ${flight.seat ?? "—"}`}
          />
          <StatCell label="Booking code" value={flight.bookingCode ?? "—"} />
          <StatCell
            label="Departure gate"
            value={
              flight.gate ??
              (flight.gatePrediction
                ? `${flight.gatePrediction.gate} (pred. ${Math.round(flight.gatePrediction.confidence * 100)}%)`
                : "—")
            }
          />
          <StatCell label="Baggage claim" value={flight.baggageClaim ?? "Pending"} />
        </div>
        {flight.notes && (
          <p className="mt-4 text-[14px] text-[var(--text-2)]">{flight.notes}</p>
        )}
      </SectionCard>
    </div>
  );
}
