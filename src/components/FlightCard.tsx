"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Flight } from "@/lib/types";
import { getAirport } from "@/data/airports";
import { getAirline } from "@/data/airlines";
import { fmtTime, durationLabel } from "@/lib/format";
import { StatusPill } from "@/components/StatusPill";
import { nmToMiles } from "@/lib/geo";

export function FlightCard({ flight, index = 0 }: { flight: Flight; index?: number }) {
  const origin = getAirport(flight.originIata);
  const dest = getAirport(flight.destIata);
  const airline = getAirline(flight.airlineIata);
  const depIso = flight.estimatedDeparture ?? flight.scheduledDeparture;
  const arrIso = flight.estimatedArrival ?? flight.scheduledArrival;
  const gate =
    flight.gate ??
    (flight.gatePrediction?.gate ? `${flight.gatePrediction.gate} pred.` : "Gate —");
  const arrGate = flight.arrivalGate ?? "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.28 }}
    >
      <Link
        href={`/flight/${flight.id}`}
        className="card block p-[18px] transition active:scale-[0.98]"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="text-[17px] font-semibold">
            {airline?.name?.split(" ")[0] ?? flight.airlineIata} · {flight.flightNumber}
          </div>
          <StatusPill flight={flight} />
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="display text-2xl tracking-[0.5px]">{flight.originIata}</div>
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[var(--blue)]">✈</span>
            <div className="h-px w-full bg-[rgba(10,132,255,0.35)]" />
          </div>
          <div className="display text-2xl tracking-[0.5px]">{flight.destIata}</div>
        </div>

        <div className="mt-4 flex items-start justify-between">
          <div>
            <div className="display tnum text-[32px] leading-none">
              {fmtTime(depIso, origin?.timezone)}
            </div>
            <div className="tnum mt-1 text-[15px] font-semibold tracking-wide text-[var(--text-2)]">
              {flight.terminal ? `Term ${flight.terminal} · ` : ""}
              {gate}
            </div>
            <div className="mt-1 text-[13px] text-[var(--text-2)]">
              {origin?.city ?? flight.originIata}
            </div>
          </div>
          <div className="text-right">
            <div className="display tnum text-[32px] leading-none">
              {fmtTime(arrIso, dest?.timezone)}
            </div>
            <div className="tnum mt-1 text-[15px] font-semibold tracking-wide text-[var(--text-2)]">
              Gate {arrGate}
            </div>
            <div className="mt-1 text-[13px] text-[var(--text-2)]">
              {dest?.city ?? flight.destIata}
            </div>
          </div>
        </div>

        <div className="mt-4 text-[13px] text-[var(--text-2)]">
          {durationLabel(flight.durationMin ?? 0)}
          {flight.distanceNm
            ? ` · ${Math.round(nmToMiles(flight.distanceNm)).toLocaleString()} mi`
            : ""}
          {flight.aircraft?.type ? ` · ${flight.aircraft.type}` : ""}
          {flight.delayPrediction && flight.delayPrediction.predictedDelayMin >= 15
            ? ` · Pred +${flight.delayPrediction.predictedDelayMin}m`
            : ""}
        </div>
      </Link>
    </motion.div>
  );
}
