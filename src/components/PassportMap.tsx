"use client";

import { useMemo } from "react";
import type { Flight } from "@/lib/types";
import { routeArcs } from "@/lib/passport";
import { interpolateGreatCircle } from "@/lib/geo";

function project(lat: number, lon: number, w: number, h: number) {
  const x = ((lon + 180) / 360) * w;
  const y = ((90 - lat) / 180) * h;
  return { x, y };
}

export function PassportMap({ flights }: { flights: Flight[] }) {
  const arcs = useMemo(() => routeArcs(flights), [flights]);
  const w = 960;
  const h = 420;

  const paths = arcs.map((arc, i) => {
    const pts = [];
    for (let s = 0; s <= 24; s++) {
      const p = interpolateGreatCircle(
        arc.from.lat,
        arc.from.lon,
        arc.to.lat,
        arc.to.lon,
        s / 24,
      );
      const { x, y } = project(p.lat, p.lon, w, h);
      pts.push(`${s === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return { d: pts.join(" "), key: `${arc.from.iata}-${arc.to.iata}-${i}` };
  });

  const airports = useMemo(() => {
    const map = new Map<string, { lat: number; lon: number; iata: string }>();
    for (const a of arcs) {
      map.set(a.from.iata, a.from);
      map.set(a.to.iata, a.to);
    }
    return [...map.values()];
  }, [arcs]);

  return (
    <div className="card overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="Flight map">
        <defs>
          <radialGradient id="ocean" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#16161B" />
            <stop offset="100%" stopColor="#0B0B0F" />
          </radialGradient>
          <linearGradient id="arc" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(10,132,255,0.2)" />
            <stop offset="50%" stopColor="rgba(10,132,255,0.95)" />
            <stop offset="100%" stopColor="rgba(10,132,255,0.4)" />
          </linearGradient>
        </defs>
        <rect width={w} height={h} fill="url(#ocean)" />
        {/* Simplified continents silhouette via faint grid */}
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={(w / 12) * i}
            y1={0}
            x2={(w / 12) * i}
            y2={h}
            stroke="rgba(143,183,220,0.06)"
          />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={(h / 6) * i}
            x2={w}
            y2={(h / 6) * i}
            stroke="rgba(143,183,220,0.06)"
          />
        ))}
        {paths.map((p) => (
          <path
            key={p.key}
            d={p.d}
            fill="none"
            stroke="url(#arc)"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.85"
          />
        ))}
        {airports.map((a) => {
          const { x, y } = project(a.lat, a.lon, w, h);
          return (
            <g key={a.iata}>
              <circle cx={x} cy={y} r="3.2" fill="#0A84FF" />
              <text
                x={x + 6}
                y={y - 6}
                fill="#8E8E96"
                fontSize="10"
                fontFamily="var(--font-body), sans-serif"
              >
                {a.iata}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
