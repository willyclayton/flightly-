"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Flight, LivePosition } from "@/lib/types";
import { getAirport } from "@/data/airports";
import { simulatePosition } from "@/lib/opensky";

const MapInner = dynamic(() => import("@/components/LiveMapInner"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center rounded-3xl bg-[rgba(10,22,40,0.8)] text-sm text-[var(--text-2)]">
      Loading radar…
    </div>
  ),
});

export function LiveMap({
  flight,
  height = 320,
  showTraffic = false,
}: {
  flight: Flight;
  height?: number;
  showTraffic?: boolean;
}) {
  const origin = getAirport(flight.originIata);
  const dest = getAirport(flight.destIata);
  const [position, setPosition] = useState<LivePosition | null>(null);
  const [traffic, setTraffic] = useState<LivePosition[]>([]);
  const [source, setSource] = useState<string>("…");

  const callsign = useMemo(() => {
    // OpenSky often uses ICAO airline + number; try both
    return flight.flightNumber.replace(/\s+/g, "").toUpperCase();
  }, [flight.flightNumber]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const sim = simulatePosition(flight);
      let live: LivePosition | null = null;

      try {
        const params = new URLSearchParams();
        if (flight.aircraft?.icao24) params.set("icao24", flight.aircraft.icao24);
        else params.set("callsign", callsign);
        const res = await fetch(`/api/opensky?${params.toString()}`);
        if (res.ok) {
          const data = (await res.json()) as { position: LivePosition | null };
          live = data.position;
        }
      } catch {
        // ignore — fall back to simulation
      }

      if (cancelled) return;
      if (live) {
        setPosition(live);
        setSource("OpenSky live");
      } else if (sim) {
        setPosition(sim);
        setSource(sim.source === "simulated" ? "Simulated track" : sim.source);
      }

      if (showTraffic && origin && dest) {
        const lamin = Math.min(origin.lat, dest.lat) - 2;
        const lamax = Math.max(origin.lat, dest.lat) + 2;
        const lomin = Math.min(origin.lon, dest.lon) - 2;
        const lomax = Math.max(origin.lon, dest.lon) + 2;
        try {
          const res = await fetch(
            `/api/opensky?bbox=${lamin},${lomin},${lamax},${lomax}`,
          );
          if (res.ok) {
            const data = (await res.json()) as { positions: LivePosition[] };
            if (!cancelled) setTraffic(data.positions ?? []);
          }
        } catch {
          /* ignore */
        }
      }
    }

    load();
    const t = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [flight, callsign, showTraffic, origin, dest]);

  if (!origin || !dest) {
    return (
      <div className="grid place-items-center rounded-3xl border border-[var(--divider)] p-8 text-sm text-[var(--text-2)]">
        Airport coordinates unavailable
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--divider)]" style={{ height }}>
      <MapInner
        origin={{ lat: origin.lat, lon: origin.lon, label: origin.iata }}
        dest={{ lat: dest.lat, lon: dest.lon, label: dest.iata }}
        position={position}
        traffic={traffic}
      />
      <div className="pointer-events-none absolute mt-[-2.5rem] ml-3 rounded-full bg-[rgba(7,17,31,0.75)] px-3 py-1 text-[11px] text-[var(--text-2)]">
        {source}
        {position?.altitudeFt != null && !position.onGround
          ? ` · FL${Math.round(position.altitudeFt / 100)}`
          : ""}
        {position?.speedKts != null ? ` · ${position.speedKts} kts` : ""}
      </div>
    </div>
  );
}
