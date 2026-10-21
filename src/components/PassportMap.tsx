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

/** Simplified landmass blobs — Flighty Passport purple world silhouette */
const LAND: Array<Array<[number, number]>> = [
  // N America
  [
    [-168, 72], [-140, 70], [-120, 55], [-95, 50], [-80, 45], [-70, 45],
    [-65, 45], [-80, 25], [-100, 20], [-110, 30], [-125, 35], [-130, 50],
    [-155, 60], [-168, 65],
  ],
  // S America
  [
    [-80, 10], [-70, 5], [-60, -5], [-55, -20], [-70, -50], [-75, -40],
    [-80, -20], [-80, 0],
  ],
  // Europe
  [
    [-10, 60], [0, 58], [10, 60], [30, 60], [40, 50], [30, 40], [10, 36],
    [-10, 36], [-10, 50],
  ],
  // Africa
  [
    [-20, 35], [10, 35], [40, 30], [50, 10], [40, -30], [20, -35],
    [10, -20], [-10, 5], [-20, 20],
  ],
  // Asia
  [
    [40, 60], [80, 70], [140, 70], [150, 50], [140, 30], [100, 10],
    [70, 20], [50, 30], [40, 50],
  ],
  // Australia
  [
    [110, -10], [150, -10], [155, -30], [140, -40], [115, -35], [110, -20],
  ],
];

type Theme = "passport" | "blacklight";

export function PassportMap({
  flights,
  year = "all",
  theme = "passport",
}: {
  flights: Flight[];
  year?: number | "all";
  theme?: Theme;
}) {
  const arcs = useMemo(() => routeArcs(flights, year), [flights, year]);
  const w = 960;
  const h = 460;

  const colors =
    theme === "blacklight"
      ? {
          ocean: ["#0a0018", "#120028"],
          land: "#2a1055",
          landStroke: "rgba(210,120,255,0.35)",
          arc: ["rgba(180,80,255,0.25)", "rgba(255,90,255,1)", "rgba(120,200,255,0.6)"],
          dot: "#e8a0ff",
          glow: "rgba(255,90,255,0.55)",
          label: "#d4b8ff",
        }
      : {
          ocean: ["#1a0b3c", "#0e0522"],
          land: "#3a1f6e",
          landStroke: "rgba(180,140,255,0.25)",
          arc: ["rgba(200,120,255,0.2)", "rgba(220,140,255,0.95)", "rgba(140,180,255,0.45)"],
          dot: "#f0e6ff",
          glow: "rgba(200,140,255,0.4)",
          label: "#b8a0d8",
        };

  const paths = arcs.map((arc, i) => {
    const pts = [];
    for (let s = 0; s <= 28; s++) {
      const p = interpolateGreatCircle(
        arc.from.lat,
        arc.from.lon,
        arc.to.lat,
        arc.to.lon,
        s / 28,
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

  const landPaths = LAND.map((poly, i) => {
    const d = poly
      .map(([lon, lat], j) => {
        const { x, y } = project(lat, lon, w, h);
        return `${j === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
    return { d: `${d} Z`, key: `land-${i}` };
  });

  return (
    <div className="passport-map overflow-hidden rounded-[18px]">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="Flight map">
        <defs>
          <radialGradient id={`ocean-${theme}`} cx="50%" cy="42%" r="72%">
            <stop offset="0%" stopColor={colors.ocean[0]} />
            <stop offset="100%" stopColor={colors.ocean[1]} />
          </radialGradient>
          <linearGradient id={`arc-${theme}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.arc[0]} />
            <stop offset="50%" stopColor={colors.arc[1]} />
            <stop offset="100%" stopColor={colors.arc[2]} />
          </linearGradient>
          <filter id={`glow-${theme}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width={w} height={h} fill={`url(#ocean-${theme})`} />
        {landPaths.map((p) => (
          <path
            key={p.key}
            d={p.d}
            fill={colors.land}
            stroke={colors.landStroke}
            strokeWidth="1"
          />
        ))}
        {paths.map((p) => (
          <path
            key={p.key}
            d={p.d}
            fill="none"
            stroke={`url(#arc-${theme})`}
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.92"
            filter={`url(#glow-${theme})`}
            className="passport-arc"
          />
        ))}
        {airports.map((a) => {
          const { x, y } = project(a.lat, a.lon, w, h);
          return (
            <g key={a.iata}>
              <circle cx={x} cy={y} r="5" fill={colors.glow} opacity="0.45" />
              <circle cx={x} cy={y} r="2.6" fill={colors.dot} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
