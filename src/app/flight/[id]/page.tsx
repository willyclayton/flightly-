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
      <div className="card rounded-3xl p-10 text-center">
        <h1 className="display text-3xl">Flight not found</h1>
        <Link href="/" className="btn btn-primary mt-6 inline-flex">
          Back to trips
        </Link>
      </div>
    );
  }

  const origin = getAirport(flight.originIata);
  const dest = getAirport(flight.destIata);
  const airline = getAirline(flight.airlineIata);
  const depIso = flight.estimatedDeparture ?? flight.scheduledDeparture;
  const arrIso = flight.estimatedArrival ?? flight.scheduledArrival;

  async function share() {
    const url = `${window.location.origin}/share/${flight!.shareToken}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4 px-4 pb-8 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="text-sm font-semibold text-[var(--blue)]">
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

      <section className="card overflow-hidden rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[var(--text-2)]">
              {airline?.name ?? flight.airlineIata} · {flight.flightNumber}
            </div>
            <h1 className="display mt-2 text-4xl md:text-5xl">
              {flight.originIata} → {flight.destIata}
            </h1>
            <p className="mt-2 text-[var(--text-2)]">
              {fmtDate(depIso, origin?.timezone)} · {phaseLabel(flight.phase)}
            </p>
          </div>
          <StatusPill flight={flight} />
        </div>

        <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div>
            <div className="display text-5xl">{flight.originIata}</div>
            <div className="text-sm text-[var(--text-2)]">{origin?.city}</div>
            <div className="mt-2 text-2xl font-semibold">
              {fmtTime(depIso, origin?.timezone)}
            </div>
            <div className="text-xs text-[var(--text-3)]">
              Scheduled {fmtTime(flight.scheduledDeparture, origin?.timezone)}
              {delayLabel(flight.scheduledDeparture, flight.estimatedDeparture)
                ? ` · ${delayLabel(flight.scheduledDeparture, flight.estimatedDeparture)}`
                : ""}
            </div>
          </div>
          <div className="text-center text-sm text-[var(--text-3)]">
            <div>{durationLabel(flight.durationMin ?? 0)}</div>
            <div className="my-2 text-[var(--blue)]">✈</div>
            <div>{flight.distanceNm ?? "—"} nm</div>
          </div>
          <div className="text-right">
            <div className="display text-5xl">{flight.destIata}</div>
            <div className="text-sm text-[var(--text-2)]">{dest?.city}</div>
            <div className="mt-2 text-2xl font-semibold">
              {fmtTime(arrIso, dest?.timezone)}
            </div>
            <div className="text-xs text-[var(--text-3)]">
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

      <div className="grid gap-6 lg:grid-cols-2">
        <AirportOps iata={flight.originIata} />
        <AirportOps iata={flight.destIata} />
      </div>

      <section className="card rounded-3xl p-5">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--blue)]">
          Pilot-grade details
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Aircraft" value={flight.aircraft?.model ?? flight.aircraft?.type ?? "—"} />
          <Detail label="Registration" value={flight.aircraft?.registration ?? "—"} />
          <Detail label="Cabin / seat" value={`${flight.cabin ?? "—"} · ${flight.seat ?? "—"}`} />
          <Detail label="Booking code" value={flight.bookingCode ?? "—"} />
          <Detail
            label="Departure gate"
            value={
              flight.gate ??
              (flight.gatePrediction
                ? `${flight.gatePrediction.gate} (pred. ${Math.round(flight.gatePrediction.confidence * 100)}%)`
                : "—")
            }
          />
          <Detail label="Baggage claim" value={flight.baggageClaim ?? "Pending"} />
        </div>
        {flight.notes && (
          <p className="mt-4 text-sm text-[var(--text-2)]">{flight.notes}</p>
        )}
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--divider)] p-3">
      <div className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
