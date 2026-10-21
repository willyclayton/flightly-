"use client";

import Link from "next/link";
import type { ConnectionLeg, Flight } from "@/lib/types";
import { ProLabel, SectionCard, StatCell } from "@/components/ui";

export function ConnectionAssistant({
  inbound,
  outbound,
  leg,
}: {
  inbound: Flight;
  outbound: Flight;
  leg: ConnectionLeg;
}) {
  const chip =
    leg.risk === "comfortable" ? "good" : leg.risk === "tight" ? "warn" : "bad";

  return (
    <SectionCard>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <ProLabel>Connection assistant · Pro</ProLabel>
          <h3 className="display mt-2 text-[28px] leading-tight">
            {inbound.destIata} transfer · {leg.bufferMin}m buffer
          </h3>
        </div>
        <span className={`status-chip ${chip}`}>{leg.risk}</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px]">
        <Link
          href={`/flight/${inbound.id}`}
          className="rounded-full border border-[var(--divider)] px-3 py-1.5 font-semibold hover:border-[var(--blue)]"
        >
          {inbound.flightNumber} arrive
        </Link>
        <span className="text-[var(--text-3)]">→</span>
        <Link
          href={`/flight/${outbound.id}`}
          className="rounded-full border border-[var(--divider)] px-3 py-1.5 font-semibold hover:border-[var(--blue)]"
        >
          {outbound.flightNumber} depart
        </Link>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <StatCell label="Walk" value={`${leg.walkMin}m`} />
        <StatCell label="Security" value={`${leg.securityMin}m`} />
        <StatCell label="Transfer" value={`${leg.transferMin}m`} />
        <StatCell
          label="Gates"
          value={
            leg.fromGate || leg.toGate
              ? `${leg.fromGate ?? "?"} → ${leg.toGate ?? "?"}`
              : "TBA"
          }
        />
      </div>

      <ul className="mt-5 space-y-2 text-[14px] text-[var(--text-2)]">
        {leg.guidance.map((g) => (
          <li key={g} className="flex gap-2">
            <span className="text-[var(--blue)]">→</span>
            {g}
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
