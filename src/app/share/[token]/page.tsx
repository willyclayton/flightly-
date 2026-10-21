"use client";

import { use } from "react";
import Link from "next/link";
import { useFlightly } from "@/lib/store";
import { getAirport } from "@/data/airports";
import { fmtDate, fmtTime } from "@/lib/format";
import { StatusPill } from "@/components/StatusPill";
import { LiveMap } from "@/components/LiveMap";
import { phaseLabel } from "@/lib/status";
import { EmptyState, ProLabel } from "@/components/ui";

export default function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const flight = useFlightly((s) => s.flights.find((f) => f.shareToken === token));

  if (!flight) {
    return (
      <div className="px-4 pt-16">
        <EmptyState title="Shared flight unavailable">
          <p className="mx-auto mt-3 max-w-sm text-[14px] text-[var(--text-2)]">
            Flightly stores trips on-device. Open this link on the device that created the
            share, or ask for a fresh link.
          </p>
          <Link href="/" className="btn btn-primary mt-6 inline-flex">
            Open Flightly
          </Link>
        </EmptyState>
      </div>
    );
  }

  const origin = getAirport(flight.originIata);
  const dest = getAirport(flight.destIata);

  return (
    <div className="mx-auto max-w-lg space-y-5 px-4 py-6">
      <div className="text-center">
        <ProLabel>Live share</ProLabel>
        <h1 className="display mt-2 text-[36px]">
          {flight.originIata} → {flight.destIata}
        </h1>
        <p className="mt-2 text-[14px] text-[var(--text-2)]">
          {flight.flightNumber} · {fmtDate(flight.scheduledDeparture, origin?.timezone)} ·{" "}
          {phaseLabel(flight.phase)}
        </p>
        <div className="mt-4 flex justify-center">
          <StatusPill flight={flight} />
        </div>
      </div>

      <div className="card grid grid-cols-2 gap-4 p-5 text-center">
        <div>
          <div className="display text-[36px]">{flight.originIata}</div>
          <div className="text-[13px] text-[var(--text-2)]">{origin?.city}</div>
          <div className="tnum mt-2 text-xl font-semibold">
            {fmtTime(
              flight.estimatedDeparture ?? flight.scheduledDeparture,
              origin?.timezone,
            )}
          </div>
        </div>
        <div>
          <div className="display text-[36px]">{flight.destIata}</div>
          <div className="text-[13px] text-[var(--text-2)]">{dest?.city}</div>
          <div className="tnum mt-2 text-xl font-semibold">
            {fmtTime(
              flight.estimatedArrival ?? flight.scheduledArrival,
              dest?.timezone,
            )}
          </div>
        </div>
      </div>

      <LiveMap flight={flight} height={280} />

      <div className="text-center">
        <Link href={`/flight/${flight.id}`} className="btn btn-primary">
          Open full Pro view
        </Link>
      </div>
    </div>
  );
}
