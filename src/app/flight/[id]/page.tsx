"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFlightly } from "@/lib/store";
import { getAirport } from "@/data/airports";
import { getAirline } from "@/data/airlines";
import { fmtDate, fmtTime, durationLabel } from "@/lib/format";
import { LiveMap } from "@/components/LiveMap";
import { DelayPanel } from "@/components/DelayPanel";
import { WheresMyPlane } from "@/components/WheresMyPlane";
import { Timeline } from "@/components/Timeline";
import { AirportOps } from "@/components/AirportOps";
import { WeatherChip } from "@/components/WeatherChip";
import { findConnections } from "@/lib/connections";
import { ConnectionAssistant } from "@/components/ConnectionAssistant";
import { EmptyState, ProLabel, SectionCard, StatCell } from "@/components/ui";
import { flightCountdown, timeToneClass } from "@/lib/countdown";

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
  const countdown = flightCountdown(flight);
  const token = flight.shareToken ?? flight.id;
  const depGate =
    flight.gate ??
    (flight.gatePrediction ? `${flight.gatePrediction.gate}` : undefined);

  async function share() {
    await navigator.clipboard.writeText(`${window.location.origin}/share/${token}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="pb-8">
      {/* Sticky chrome */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--divider)] bg-[rgba(11,11,15,0.92)] px-4 py-3 backdrop-blur-xl">
        <Link href="/" className="text-[17px] font-semibold text-[var(--blue)]">
          ‹ Flights
        </Link>
        <div className="flex gap-4 text-[var(--text-2)]">
          <button type="button" className="text-[15px] font-semibold" onClick={() => void share()}>
            {copied ? "Copied" : "Share"}
          </button>
          <button
            type="button"
            className="text-[15px] font-semibold text-[var(--cancelled)]"
            onClick={() => {
              removeFlight(flight.id);
              router.push("/");
            }}
          >
            Remove
          </button>
        </div>
      </div>

      {/* Hero countdown — Flighty detail signature */}
      <div className="px-4 pb-2 pt-6 text-center">
        <div className="text-[13px] font-semibold tracking-wide text-[var(--text-2)]">
          {airline?.name ?? flight.airlineIata} · {flight.flightNumber}
        </div>
        <div
          className={`display mt-3 text-[34px] leading-[1.05] tracking-[-0.5px] ${timeToneClass(countdown.tone)}`}
        >
          {countdown.label}
        </div>
        <div className="mt-2 text-[14px] text-[var(--text-2)]">
          {fmtDate(depIso, origin?.timezone)}
        </div>
      </div>

      {/* Origin / Destination blocks */}
      <div className="mx-4 mt-4 overflow-hidden rounded-2xl border border-[var(--divider)] bg-[var(--surface-1)]">
        <div className="grid grid-cols-2 divide-x divide-[var(--divider)]">
          <div className="p-4">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
              Departure
            </div>
            <div className="display mt-2 text-[28px] tracking-[0.4px]">
              {flight.originIata}
            </div>
            <div className="mt-0.5 text-[13px] text-[var(--text-2)]">
              {origin?.city}
            </div>
            <div className={`tnum mt-3 text-[32px] font-bold leading-none ${timeToneClass(countdown.tone)}`}>
              {fmtTime(depIso, origin?.timezone)}
            </div>
            <div className="tnum mt-2 text-[15px] font-semibold tracking-wide text-[var(--text-2)]">
              {flight.terminal ? `Terminal ${flight.terminal}` : "Terminal —"}
              {depGate ? ` · Gate ${depGate}` : ""}
            </div>
          </div>
          <div className="p-4 text-right">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
              Arrival
            </div>
            <div className="display mt-2 text-[28px] tracking-[0.4px]">
              {flight.destIata}
            </div>
            <div className="mt-0.5 text-[13px] text-[var(--text-2)]">
              {dest?.city}
            </div>
            <div className="tnum mt-3 text-[32px] font-bold leading-none">
              {fmtTime(arrIso, dest?.timezone)}
            </div>
            <div className="tnum mt-2 text-[15px] font-semibold tracking-wide text-[var(--text-2)]">
              {flight.arrivalGate
                ? `Gate ${flight.arrivalGate}`
                : flight.baggageClaim
                  ? `Belt ${flight.baggageClaim}`
                  : "Gate —"}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--divider)] px-4 py-3 text-[13px] text-[var(--text-2)]">
          <span>{durationLabel(flight.durationMin ?? 0)}</span>
          <span className="text-[var(--blue)]">✈</span>
          <span className="tnum">
            {flight.distanceNm ? `${flight.distanceNm.toLocaleString()} nm` : "—"}
          </span>
          {flight.baggageClaim && (
            <span className="font-semibold text-[var(--text)]">
              Belt {flight.baggageClaim}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 px-4">
        {origin && <WeatherChip lat={origin.lat} lon={origin.lon} label="Origin" />}
        {dest && <WeatherChip lat={dest.lat} lon={dest.lon} label="Destination" />}
      </div>

      <div className="mt-4 px-4">
        <LiveMap flight={flight} height={280} showTraffic />
      </div>

      <div className="mt-4 space-y-3 px-4">
        <WheresMyPlane flight={flight} />
        <DelayPanel flight={flight} />
        <Timeline flight={flight} />

        {connections.map((c) => (
          <ConnectionAssistant
            key={`${c.inbound.id}-${c.outbound.id}`}
            inbound={c.inbound}
            outbound={c.outbound}
            leg={c.leg}
          />
        ))}

        <div className="grid gap-3 lg:grid-cols-2">
          <AirportOps iata={flight.originIata} />
          <AirportOps iata={flight.destIata} />
        </div>

        <SectionCard>
          <ProLabel>Flight details</ProLabel>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <StatCell
              label="Aircraft"
              value={flight.aircraft?.model ?? flight.aircraft?.type ?? "—"}
            />
            <StatCell
              label="Registration"
              value={flight.aircraft?.registration ?? "—"}
            />
            <StatCell
              label="Seat"
              value={flight.seat ? `${flight.cabin ?? ""} ${flight.seat}`.trim() : "—"}
            />
            <StatCell label="Booking code" value={flight.bookingCode ?? "—"} />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
