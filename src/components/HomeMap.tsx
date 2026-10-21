"use client";

import dynamic from "next/dynamic";
import type { Flight } from "@/lib/types";
import { getAirport } from "@/data/airports";
import { simulatePosition } from "@/lib/opensky";

const MapInner = dynamic(() => import("@/components/LiveMapInner"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center bg-[var(--map-land)] text-sm text-[var(--text-2)]">
      Loading map…
    </div>
  ),
});

export function HomeMap({ flight }: { flight: Flight | null }) {
  if (!flight) {
    return (
      <div className="grid h-[280px] place-items-center bg-[var(--map-land)] text-sm text-[var(--text-2)]">
        Add a flight to see your route
      </div>
    );
  }

  const origin = getAirport(flight.originIata);
  const dest = getAirport(flight.destIata);
  if (!origin || !dest) return null;

  const position = simulatePosition(flight);

  return (
    <div className="h-[280px] overflow-hidden md:h-[340px]">
      <MapInner
        origin={{ lat: origin.lat, lon: origin.lon, label: origin.iata }}
        dest={{ lat: dest.lat, lon: dest.lon, label: dest.iata }}
        position={position}
        traffic={[]}
      />
    </div>
  );
}
