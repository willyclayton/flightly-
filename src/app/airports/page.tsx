"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AIRPORTS, searchAirports } from "@/data/airports";
import { airportOpsReport } from "@/lib/predictions";

export default function AirportsPage() {
  const [q, setQ] = useState("");
  const results = useMemo(() => (q ? searchAirports(q, 40) : AIRPORTS.slice(0, 40)), [q]);

  return (
    <div className="space-y-4 px-4 pb-8 pt-4">
      <div>
        <h1 className="display text-[28px] tracking-[-0.4px]">Airport</h1>
        <p className="mt-1 text-[15px] text-[var(--text-2)]">
          Live conditions and delay trends
        </p>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Flight number or airport"
      />

      <div className="grid gap-3">
        {results.map((a) => {
          const ops = airportOpsReport(a.iata);
          return (
            <Link
              key={a.iata}
              href={`/airports/${a.iata}`}
              className="card p-5 transition hover:border-[rgba(10,132,255,0.35)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="display text-3xl">{a.iata}</div>
                  <div className="mt-1 font-semibold">{a.city}</div>
                  <div className="text-sm text-[var(--text-2)]">{a.name}</div>
                </div>
                <div className="text-right text-xs text-[var(--text-3)]">
                  <div>+{ops.takeoffDelayTrendMin}m dep</div>
                  <div>+{ops.landingDelayTrendMin}m arr</div>
                </div>
              </div>
              <p className="mt-4 text-sm text-[var(--text-2)]">{ops.summary}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
