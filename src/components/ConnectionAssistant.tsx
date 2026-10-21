"use client";

import Link from "next/link";
import type { ConnectionLeg, Flight } from "@/lib/types";

export function ConnectionAssistant({
  inbound,
  outbound,
  leg,
}: {
  inbound: Flight;
  outbound: Flight;
  leg: ConnectionLeg;
}) {
  const tone =
    leg.risk === "comfortable"
      ? "good"
      : leg.risk === "tight"
        ? "warn"
        : "bad";

  return (
    <section className="card rounded-3xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--blue)]">
            Connection assistant · Pro
          </div>
          <h3 className="display mt-2 text-2xl">
            {inbound.destIata} transfer · {leg.bufferMin}m buffer
          </h3>
        </div>
        <span className={`rounded-full border border-[var(--divider)] px-3 py-1 text-xs font-semibold uppercase tracking-wide tone-${tone}`}>
          {leg.risk}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link href={`/flight/${inbound.id}`} className="rounded-full border border-[var(--divider)] px-3 py-1 hover:border-[var(--blue)]">
          {inbound.flightNumber} arrive
        </Link>
        <span className="text-[var(--text-3)]">→</span>
        <Link href={`/flight/${outbound.id}`} className="rounded-full border border-[var(--divider)] px-3 py-1 hover:border-[var(--blue)]">
          {outbound.flightNumber} depart
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <Chip label="Walk" value={`${leg.walkMin}m`} />
        <Chip label="Security" value={`${leg.securityMin}m`} />
        <Chip label="Transfer" value={`${leg.transferMin}m`} />
        <Chip
          label="Gates"
          value={
            leg.fromGate || leg.toGate
              ? `${leg.fromGate ?? "?"} → ${leg.toGate ?? "?"}`
              : "TBA"
          }
        />
      </div>

      <ul className="mt-5 space-y-2 text-sm text-[var(--text-2)]">
        {leg.guidance.map((g) => (
          <li key={g} className="flex gap-2">
            <span className="text-[var(--blue)]">→</span>
            {g}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--divider)] p-3">
      <div className="text-[11px] uppercase tracking-wider text-[var(--text-3)]">{label}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
