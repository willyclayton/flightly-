"use client";

import type { Flight, FlightPhase } from "@/lib/types";
import { phaseLabel } from "@/lib/status";
import { fmtTime } from "@/lib/format";
import { getAirport } from "@/data/airports";
import { ProLabel, SectionCard } from "@/components/ui";

const PREFLIGHT: FlightPhase[] = ["scheduled", "check_in", "boarding"];
const AT_AIRPORT: FlightPhase[] = [
  "departed_gate",
  "taxi_out",
  "airborne",
  "cruise",
  "descent",
];
const AFTER: FlightPhase[] = ["approach", "landed", "taxi_in", "arrived"];

function stepIndex(phase: FlightPhase): number {
  if (PREFLIGHT.includes(phase)) return 0;
  if (AT_AIRPORT.includes(phase)) return 1;
  if (AFTER.includes(phase) || phase === "cancelled" || phase === "diverted") return 2;
  return 0;
}

export function Timeline({ flight }: { flight: Flight }) {
  const origin = getAirport(flight.originIata);
  const dest = getAirport(flight.destIata);
  const active = stepIndex(flight.phase);

  const steps = [
    {
      title: "Preflight",
      items: [
        `Check-in${flight.bookingCode ? ` · ${flight.bookingCode}` : ""}`,
        flight.gate || flight.gatePrediction?.gate
          ? `Gate ${flight.gate ?? flight.gatePrediction?.gate}${flight.gate ? "" : " (predicted)"}`
          : "Gate TBA",
        `Depart ${fmtTime(flight.estimatedDeparture ?? flight.scheduledDeparture, origin?.timezone)}`,
      ],
    },
    {
      title: "At the airport",
      items: [
        phaseLabel(flight.phase),
        flight.aircraft?.registration
          ? `Tail ${flight.aircraft.registration}`
          : "Aircraft assignment",
        flight.terminal ? `Terminal ${flight.terminal}` : "Terminal TBA",
      ],
    },
    {
      title: "After landing",
      items: [
        `Arrive ${fmtTime(flight.estimatedArrival ?? flight.scheduledArrival, dest?.timezone)}`,
        flight.arrivalGate ? `Arrival gate ${flight.arrivalGate}` : "Arrival gate TBA",
        flight.baggageClaim
          ? `Baggage claim ${flight.baggageClaim}`
          : "Baggage claim pending",
      ],
    },
  ];

  return (
    <SectionCard>
      <ProLabel>Trip timeline</ProLabel>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {steps.map((step, i) => (
          <div
            key={step.title}
            className={`rounded-xl border p-4 ${
              i === active
                ? "border-[rgba(10,132,255,0.45)] bg-[rgba(10,132,255,0.08)]"
                : i < active
                  ? "border-[var(--divider)] opacity-70"
                  : "border-[var(--divider)]"
            }`}
          >
            <div className="text-[15px] font-semibold">{step.title}</div>
            <ul className="mt-3 space-y-2 text-[13px] text-[var(--text-2)]">
              {step.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--blue)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
