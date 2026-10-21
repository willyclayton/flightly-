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

interface FlightlyState {
  hydrated: boolean;
  hasSeeded: boolean;
  flights: Flight[];
  seedDemo: () => void;
  clearDemo: () => void;
  addFlight: (
    input: Partial<Flight> &
      Pick<
        Flight,
        | "flightNumber"
        | "airlineIata"
        | "originIata"
        | "destIata"
        | "scheduledDeparture"
        | "scheduledArrival"
      >,
  ) => Flight;
  updateFlight: (id: string, patch: Partial<Flight>) => void;
  removeFlight: (id: string) => void;
  refreshPredictions: () => void;
  importFlights: (flights: Flight[]) => number;
}

function withMeta(flight: Flight): Flight {
  const now = new Date();
  const f = { ...flight };

  if (!f.distanceNm || !f.durationMin) {
    const o = getAirport(f.originIata);
    const d = getAirport(f.destIata);
    if (o && d) {
      f.distanceNm = Math.round(haversineNm(o.lat, o.lon, d.lat, d.lon));
      f.durationMin = estimateBlockMinutes(f.distanceNm);
    }
  }

  f.delayPrediction = predictDelay(f, now);
  f.gatePrediction = predictGate(f);
  return enrichFlight(f, now);
}

function flightKey(f: Pick<Flight, "flightNumber" | "scheduledDeparture" | "originIata" | "destIata">) {
  return `${f.flightNumber}:${f.scheduledDeparture}:${f.originIata}:${f.destIata}`;
}

export const useFlightly = create<FlightlyState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      hasSeeded: false,
      flights: [],

      seedDemo: () => set({ flights: buildDemoFlights().map(withMeta), hasSeeded: true }),

      clearDemo: () =>
        set({
          flights: get().flights.filter((f) => !f.isDemo),
          hasSeeded: true,
        }),

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
        set({ flights: [flight, ...get().flights], hasSeeded: true });
        return flight;
      },

      updateFlight: (id, patch) => {
        set({
          flights: get().flights.map((f) =>
            f.id === id
              ? withMeta({ ...f, ...patch, updatedAt: new Date().toISOString() })
              : f,
          ),
        });
      },

      removeFlight: (id) => set({ flights: get().flights.filter((f) => f.id !== id) }),

      refreshPredictions: () => set({ flights: get().flights.map(withMeta) }),

      importFlights: (incoming) => {
        const existing = new Set(get().flights.map(flightKey));
        const fresh = incoming.map(withMeta).filter((f) => !existing.has(flightKey(f)));
        if (fresh.length) {
          set({ flights: [...fresh, ...get().flights], hasSeeded: true });
        }
        return fresh.length;
      },
    }),
    {
      name: "flightly-v1",
      partialize: (s) => ({
        flights: s.flights,
        hasSeeded: s.hasSeeded,
      }),
    },
  ),
);
