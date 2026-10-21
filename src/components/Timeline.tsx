"use client";

import type { Flight, FlightPhase } from "@/lib/types";
import { phaseLabel } from "@/lib/status";
import { fmtTime } from "@/lib/format";
import { getAirport } from "@/data/airports";

const PREFLIGHT: FlightPhase[] = ["scheduled", "check_in", "boarding"];
const AIRPORT: FlightPhase[] = ["departed_gate", "taxi_out", "airborne"];
const AFTER: FlightPhase[] = ["approach", "landed", "taxi_in", "arrived"];

export function Timeline({ flight }: { flight: Flight }) {
  const origin = getAirport(flight.originIata);
  const dest = getAirport(flight.destIata);
  const current = flight.phase;

  const steps = [
    {
      title: "Preflight",
      active: PREFLIGHT.includes(current) || current === "cruise" || current === "descent",
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
      active: AIRPORT.includes(current) || ["cruise", "descent", "approach"].includes(current),
      items: [
        phaseLabel(current),
        flight.aircraft?.registration
          ? `Tail ${flight.aircraft.registration}`
          : "Aircraft assignment",
        flight.terminal ? `Terminal ${flight.terminal}` : "Terminal TBA",
      ],
    },
    {
      title: "After landing",
      active: AFTER.includes(current),
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
    <section className="card rounded-3xl p-5">
      <div className="text-xs uppercase tracking-[0.2em] text-[var(--blue)]">
        Trip timeline
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.title}
            className={`rounded-2xl border p-4 ${
              step.active
                ? "border-[rgba(10,132,255,0.45)] bg-[rgba(10,132,255,0.08)]"
                : "border-[var(--divider)]"
            }`}
          >
            <div className="text-sm font-semibold">{step.title}</div>
            <ul className="mt-3 space-y-2 text-sm text-[var(--text-2)]">
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
    </section>
  );
}
