"use client";

import { useEffect, useState } from "react";
import type { WeatherSnapshot } from "@/lib/types";
import { tempF } from "@/lib/weather";

export function WeatherChip({
  lat,
  lon,
  label,
}: {
  lat: number;
  lon: number;
  label: string;
}) {
  const [wx, setWx] = useState<WeatherSnapshot | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setWx(data as WeatherSnapshot);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  if (!wx) {
    return (
      <div className="rounded-2xl border border-[var(--divider)] px-3 py-2 text-sm text-[var(--text-2)]">
        {label} weather…
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--divider)] px-3 py-2 text-sm">
      <span className="text-[var(--text-3)]">{label}</span>{" "}
      <span className="font-semibold">
        {Math.round(wx.tempC)}°C / {tempF(wx.tempC)}°F
      </span>{" "}
      <span className="text-[var(--text-2)]">· {wx.summary}</span>
    </div>
  );
}
