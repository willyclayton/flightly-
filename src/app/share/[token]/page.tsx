"use client";

import { use } from "react";
import Link from "next/link";
import { useFlightly } from "@/lib/store";
import { getAirport } from "@/data/airports";
import { fmtDate, fmtTime } from "@/lib/format";
import { StatusPill } from "@/components/StatusPill";
import { LiveMap } from "@/components/LiveMap";
import { phaseLabel } from "@/lib/status";

export default function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const flight = useFlightly((s) => s.flights.find((f) => f.shareToken === token));

  if (!flight) {
    return (
      <div className="card mx-auto max-w-lg rounded-3xl p-10 text-center">
        <h1 className="display text-3xl">Shared flight unavailable</h1>
        <p className="mt-3 text-sm text-[var(--text-2)]">
          Flightly stores trips on-device. Open this link on the device that created
          the share, or ask your friend to send a fresh link.
        </p>
        <Link href="/" className="btn btn-primary mt-6 inline-flex">
          Open Flightly
        </Link>
      </div>
    );
  }

  const origin = getAirport(flight.originIata);
  const dest = getAirport(flight.destIata);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.2em] text-[var(--blue)]">
          Live share
        </div>
        <h1 className="display mt-2 text-4xl">
          {flight.originIata} → {flight.destIata}
        </h1>
        <p className="mt-2 text-[var(--text-2)]">
          {flight.flightNumber} · {fmtDate(flight.scheduledDeparture, origin?.timezone)} ·{" "}
          {phaseLabel(flight.phase)}
        </p>
        <div className="mt-4 flex justify-center">
          <StatusPill flight={flight} />
        </div>
      </div>

      <div className="card grid grid-cols-2 gap-4 rounded-3xl p-6 text-center">
        <div>
          <div className="display text-4xl">{flight.originIata}</div>
          <div className="text-sm text-[var(--text-2)]">{origin?.city}</div>
          <div className="mt-2 text-xl font-semibold">
            {fmtTime(
              flight.estimatedDeparture ?? flight.scheduledDeparture,
              origin?.timezone,
            )}
          </div>
        </div>
        <div>
          <div className="display text-4xl">{flight.destIata}</div>
          <div className="text-sm text-[var(--text-2)]">{dest?.city}</div>
          <div className="mt-2 text-xl font-semibold">
            {fmtTime(
              flight.estimatedArrival ?? flight.scheduledArrival,
              dest?.timezone,
            )}
          </div>
        </div>
      </div>

      <LiveMap flight={flight} height={300} />

      <div className="text-center">
        <Link href={`/flight/${flight.id}`} className="btn btn-primary">
          Open full Pro view
        </Link>
      </div>
    </div>
  );
}
