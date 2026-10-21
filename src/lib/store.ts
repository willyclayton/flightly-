"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Flight } from "@/lib/types";
import { buildDemoFlights } from "@/lib/demo";
import { enrichFlight } from "@/lib/status";
import { predictDelay, predictGate } from "@/lib/predictions";
import { shareToken, uid } from "@/lib/format";
import { getAirport } from "@/data/airports";
import { haversineNm, estimateBlockMinutes } from "@/lib/geo";
import { addMinutes, parseISO } from "date-fns";

interface FlightlyState {
  hydrated: boolean;
  hasSeeded: boolean;
  flights: Flight[];
  proUnlocked: true;
  seedDemo: () => void;
  clearDemo: () => void;
  addFlight: (input: Partial<Flight> & Pick<Flight, "flightNumber" | "airlineIata" | "originIata" | "destIata" | "scheduledDeparture" | "scheduledArrival">) => Flight;
  updateFlight: (id: string, patch: Partial<Flight>) => void;
  removeFlight: (id: string) => void;
  getFlight: (id: string) => Flight | undefined;
  getByShareToken: (token: string) => Flight | undefined;
  refreshPredictions: () => void;
  importFlights: (flights: Flight[]) => number;
}

function withMeta(flight: Flight): Flight {
  const now = new Date();
  let f = { ...flight };
  if (!f.distanceNm || !f.durationMin) {
    const o = getAirport(f.originIata);
    const d = getAirport(f.destIata);
    if (o && d) {
      f.distanceNm = Math.round(haversineNm(o.lat, o.lon, d.lat, d.lon));
      f.durationMin = estimateBlockMinutes(f.distanceNm);
    }
  }
  f.delayPrediction = predictDelay(f, now) ?? f.delayPrediction;
  f.gatePrediction = predictGate(f) ?? f.gatePrediction;
  f = enrichFlight(f, now);
  return f;
}

export const useFlightly = create<FlightlyState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      hasSeeded: false,
      flights: [],
      proUnlocked: true,

      seedDemo: () => {
        const demo = buildDemoFlights().map(withMeta);
        set({ flights: demo, hasSeeded: true });
      },

      clearDemo: () => {
        set({
          flights: get().flights.filter((f) => !f.isDemo),
          hasSeeded: true,
        });
      },

      addFlight: (input) => {
        const now = new Date().toISOString();
        const flight = withMeta({
          id: uid(),
          status: "on_time",
          phase: "scheduled",
          shareToken: shareToken(),
          createdAt: now,
          updatedAt: now,
          estimatedDeparture: input.estimatedDeparture ?? input.scheduledDeparture,
          estimatedArrival: input.estimatedArrival ?? input.scheduledArrival,
          ...input,
        } as Flight);
        set({ flights: [flight, ...get().flights] });
        return flight;
      },

      updateFlight: (id, patch) => {
        set({
          flights: get().flights.map((f) =>
            f.id === id ? withMeta({ ...f, ...patch, updatedAt: new Date().toISOString() }) : f,
          ),
        });
      },

      removeFlight: (id) => {
        set({ flights: get().flights.filter((f) => f.id !== id) });
      },

      getFlight: (id) => get().flights.find((f) => f.id === id),

      getByShareToken: (token) => get().flights.find((f) => f.shareToken === token),

      refreshPredictions: () => {
        set({ flights: get().flights.map(withMeta) });
      },

      importFlights: (incoming) => {
        const existing = new Set(
          get().flights.map(
            (f) => `${f.flightNumber}:${f.scheduledDeparture}:${f.originIata}:${f.destIata}`,
          ),
        );
        const fresh = incoming
          .map(withMeta)
          .filter(
            (f) =>
              !existing.has(
                `${f.flightNumber}:${f.scheduledDeparture}:${f.originIata}:${f.destIata}`,
              ),
          );
        if (fresh.length) set({ flights: [...fresh, ...get().flights] });
        return fresh.length;
      },
    }),
    {
      name: "flightly-v1",
      partialize: (s) => ({
        flights: s.flights,
        proUnlocked: s.proUnlocked,
        hasSeeded: s.hasSeeded,
      }),
    },
  ),
);

export function createManualFlight(opts: {
  flightNumber: string;
  airlineIata: string;
  originIata: string;
  destIata: string;
  departureLocal: string;
  durationMin?: number;
  gate?: string;
  terminal?: string;
  bookingCode?: string;
  seat?: string;
  registration?: string;
}): Omit<Flight, "id" | "createdAt" | "updatedAt" | "shareToken" | "status" | "phase"> & {
  flightNumber: string;
  airlineIata: string;
  originIata: string;
  destIata: string;
  scheduledDeparture: string;
  scheduledArrival: string;
} {
  const o = getAirport(opts.originIata);
  const d = getAirport(opts.destIata);
  const nm =
    o && d ? Math.round(haversineNm(o.lat, o.lon, d.lat, d.lon)) : 500;
  const duration = opts.durationMin ?? estimateBlockMinutes(nm);
  const dep = parseISO(opts.departureLocal);
  const arr = addMinutes(dep, duration);
  return {
    flightNumber: opts.flightNumber.toUpperCase(),
    airlineIata: opts.airlineIata.toUpperCase(),
    originIata: opts.originIata.toUpperCase(),
    destIata: opts.destIata.toUpperCase(),
    scheduledDeparture: dep.toISOString(),
    scheduledArrival: arr.toISOString(),
    estimatedDeparture: dep.toISOString(),
    estimatedArrival: arr.toISOString(),
    terminal: opts.terminal,
    gate: opts.gate,
    bookingCode: opts.bookingCode,
    seat: opts.seat,
    distanceNm: nm,
    durationMin: duration,
    aircraft: opts.registration
      ? { registration: opts.registration.toUpperCase() }
      : undefined,
  };
}
