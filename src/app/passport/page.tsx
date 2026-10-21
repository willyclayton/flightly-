"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useFlightly } from "@/lib/store";
import { computePassport, mrzLines } from "@/lib/passport";
import { PassportMap } from "@/components/PassportMap";
import { getAirport } from "@/data/airports";
import { nmToMiles } from "@/lib/geo";

export default function PassportPage() {
  const router = useRouter();
  const flights = useFlightly((s) => s.flights);
  const [year, setYear] = useState<number | "all">("all");
  const [blacklight, setBlacklight] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const years = useMemo(() => {
    const ys = new Set<number>();
    for (const f of flights) {
      ys.add(new Date(f.scheduledDeparture).getFullYear());
    }
    return ["all" as const, ...[...ys].sort((a, b) => b - a)];
  }, [flights]);

  const stats = useMemo(() => computePassport(flights, year), [flights, year]);
  const yearLabel = year === "all" ? "ALL TIME" : String(year);
  const [mrz1, mrz2] = mrzLines(stats);
  const theme = blacklight ? "blacklight" : "passport";
  const maxWeek = Math.max(1, ...stats.weekdayFlights.map((d) => d.count));
  const maxAirport = Math.max(1, ...stats.mostVisited.map((m) => m.count));
  const maxAirline = Math.max(1, ...stats.topAirlines.map((a) => a.count));
  const maxRoute = Math.max(1, ...stats.topRoutes.map((r) => r.count));
  const maxMiles = Math.max(stats.miles, 1);

  return (
    <div
      className={`passport-screen min-h-[100dvh] pb-10 transition-colors duration-500 ${
        blacklight ? "passport-blacklight" : "passport-normal"
      }`}
    >
      {/* Header — Flighty Passport */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 pb-2 pt-[max(12px,env(safe-area-inset-top))] backdrop-blur-xl">
        <button
          type="button"
          aria-label="Close"
          className="grid h-9 w-9 place-items-center rounded-full text-[22px] text-[var(--pp-text)] opacity-80"
          onClick={() => router.push("/")}
        >
          ✕
        </button>
        <h1 className="text-[17px] font-semibold tracking-[-0.2px] text-[var(--pp-text)]">
          Flighty Passport
        </h1>
        <button
          type="button"
          aria-label="Share"
          className="grid h-9 w-9 place-items-center rounded-full text-[var(--pp-text)]"
          onClick={() => setShareOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M12 3v12" strokeLinecap="round" />
            <path d="m7 8 5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* Year tabs */}
      <div className="no-scrollbar flex gap-1 overflow-x-auto px-4 pb-3">
        {years.map((y) => {
          const active = year === y;
          const label = y === "all" ? "ALL TIME" : String(y);
          return (
            <button
              key={String(y)}
              type="button"
              onClick={() => setYear(y)}
              className={`shrink-0 rounded-[10px] px-3.5 py-1.5 text-[13px] font-semibold tracking-wide transition-colors ${
                active
                  ? "bg-[var(--pp-chip)] text-[var(--pp-text)]"
                  : "text-[var(--pp-muted)]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="space-y-4 px-4">
        {/* Airport ticker */}
        <div className="passport-ticker overflow-hidden rounded-full border border-[var(--pp-border)] bg-[var(--pp-surface)]/40 py-1.5">
          <div className="passport-ticker-track flex gap-4 whitespace-nowrap text-[11px] font-semibold tracking-[0.18em] text-[var(--pp-muted)]">
            {Array.from({ length: 3 }).flatMap((_, loop) =>
              stats.mostVisited.slice(0, 8).map((m) => (
                <span key={`${loop}-${m.iata}`} className="inline-flex items-center gap-2">
                  <span aria-hidden>✈</span>
                  {m.iata}
                </span>
              )),
            )}
          </div>
        </div>

        {/* Map */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${yearLabel}-${theme}`}
            initial={{ opacity: 0.4, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0.2, filter: "blur(4px)" }}
            transition={{ duration: 0.35 }}
          >
            <PassportMap flights={flights} year={year} theme={theme} />
          </motion.div>
        </AnimatePresence>

        {/* Country flags */}
        {stats.countriesList.length > 0 && (
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {stats.countriesList.map((c) => (
              <div
                key={c.code}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--pp-surface)] text-[18px] ring-1 ring-[var(--pp-border)]"
                title={c.code}
              >
                {c.flag}
              </div>
            ))}
          </div>
        )}

        {/* Passport identity card */}
        <section className="passport-card relative overflow-hidden rounded-[22px] border border-[var(--pp-border)] bg-[var(--pp-card)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-bold tracking-[0.06em] text-[var(--pp-text)]">
                {yearLabel} FLIGHTY PASSPORT
              </h2>
              <p className="mt-1 font-mono text-[10px] tracking-[0.14em] text-[var(--pp-muted)]">
                PASSPORT · PASS · PASAPORTE
              </p>
            </div>
            <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-lg bg-[var(--pp-chip)] text-[20px]">
              ✈
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={yearLabel}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }}
              className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5"
            >
              <Stat label="FLIGHTS" value={String(stats.flights)} large />
              <Stat
                label="FLIGHT DISTANCE"
                value={`${stats.miles.toLocaleString()} mi`}
                large
              />
              <Stat label="FLIGHT TIME" value={stats.flightTimeLabel} />
              <div className="grid grid-cols-2 gap-3">
                <Stat label="AIRPORTS" value={String(stats.airports)} />
                <Stat label="AIRLINES" value={String(stats.airlines)} />
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 border-t border-[var(--pp-border)] pt-4 font-mono text-[10px] leading-relaxed tracking-wider text-[var(--pp-muted)]">
            <div className="truncate">{mrz1}</div>
            <div className="truncate">{mrz2}</div>
          </div>
        </section>

        {/* Share / Blacklight controls */}
        {(shareOpen || blacklight) && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setBlacklight((v) => !v)}
              className={`flex-1 rounded-2xl px-4 py-3 text-[14px] font-semibold ${
                blacklight
                  ? "bg-[#c84dff] text-white shadow-[0_0_24px_rgba(200,77,255,0.55)]"
                  : "bg-[var(--pp-chip)] text-[var(--pp-text)]"
              }`}
            >
              {blacklight ? "Blacklight on" : "Blacklight"}
            </button>
            <button
              type="button"
              className="flex-1 rounded-2xl bg-[var(--pp-chip)] px-4 py-3 text-[14px] font-semibold text-[var(--pp-text)]"
              onClick={async () => {
                const text = `My ${yearLabel} Flighty Passport — ${stats.flights} flights · ${stats.miles.toLocaleString()} mi · ${stats.flightTimeLabel}`;
                try {
                  await navigator.clipboard.writeText(text);
                } catch {
                  /* ignore */
                }
              }}
            >
              Copy stats
            </button>
          </div>
        )}

        <div className="flex justify-center pb-1 pt-1 text-[var(--pp-muted)]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Detailed stats dashboard — scroll destination */}
        <section className="space-y-4 pb-6">
          <h3 className="text-[13px] font-bold uppercase tracking-[0.14em] text-[var(--pp-muted)]">
            Highlights
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Countries" value={String(stats.countries)} />
            <MiniStat
              label="Longest"
              value={`${Math.round(nmToMiles(stats.longestNm)).toLocaleString()} mi`}
            />
            <MiniStat label="Hours delayed" value={String(stats.delayHours)} />
            <MiniStat
              label="Worst delay"
              value={stats.worstDelayMin ? `+${stats.worstDelayMin}m` : "—"}
            />
          </div>

          {/* Weekday chart */}
          <div className="rounded-[20px] border border-[var(--pp-border)] bg-[var(--pp-card)] p-4">
            <h4 className="text-[15px] font-semibold text-[var(--pp-text)]">Flights by weekday</h4>
            <div className="mt-4 flex h-28 items-end justify-between gap-1.5">
              {stats.weekdayFlights.map((d) => (
                <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-20 w-full items-end">
                    <motion.div
                      className="mx-auto w-full max-w-[18px] rounded-t-md bg-[var(--pp-accent)]"
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.count / maxWeek) * 100}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 18 }}
                      style={{ minHeight: d.count ? 6 : 2 }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-[var(--pp-muted)]">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Distance progress */}
          <div className="rounded-[20px] border border-[var(--pp-border)] bg-[var(--pp-card)] p-4">
            <h4 className="text-[15px] font-semibold text-[var(--pp-text)]">Distance</h4>
            <p className="mt-1 text-[13px] text-[var(--pp-muted)]">
              {stats.miles.toLocaleString()} of your miles this period
            </p>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--pp-chip)]">
              <motion.div
                className="h-full rounded-full bg-[var(--pp-accent)]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (stats.miles / maxMiles) * 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <BarList
            title="Top airports"
            rows={stats.mostVisited.map((m) => {
              const a = getAirport(m.iata);
              return {
                key: m.iata,
                label: `${m.iata} · ${a?.city ?? ""}`,
                sub: a?.name ?? "",
                value: `${m.count}×`,
                pct: (m.count / maxAirport) * 100,
              };
            })}
          />

          <BarList
            title="Top airlines"
            rows={stats.topAirlines.map((a) => ({
              key: a.iata,
              label: `${a.iata} · ${a.name}`,
              sub: "",
              value: `${a.count}×`,
              pct: (a.count / maxAirline) * 100,
            }))}
          />

          <BarList
            title="Top routes"
            rows={stats.topRoutes.map((r) => ({
              key: r.route,
              label: r.route,
              sub: "",
              value: `${r.count}×`,
              pct: (r.count / maxRoute) * 100,
            }))}
          />
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  large,
}: {
  label: string;
  value: string;
  large?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--pp-muted)]">
        {label}
      </div>
      <div
        className={`tnum mt-1 font-bold tracking-[-0.03em] text-[var(--pp-text)] ${
          large ? "text-[28px]" : "text-[22px]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[var(--pp-border)] bg-[var(--pp-card)] px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--pp-muted)]">
        {label}
      </div>
      <div className="tnum mt-1 text-[22px] font-bold text-[var(--pp-text)]">{value}</div>
    </div>
  );
}

function BarList({
  title,
  rows,
}: {
  title: string;
  rows: { key: string; label: string; sub: string; value: string; pct: number }[];
}) {
  return (
    <div className="rounded-[20px] border border-[var(--pp-border)] bg-[var(--pp-card)] p-4">
      <h4 className="text-[15px] font-semibold text-[var(--pp-text)]">{title}</h4>
      <ul className="mt-3 space-y-3">
        {rows.length === 0 && (
          <li className="text-sm text-[var(--pp-muted)]">Fly somewhere first.</li>
        )}
        {rows.map((r) => (
          <li key={r.key}>
            <div className="mb-1.5 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[14px] font-semibold text-[var(--pp-text)]">
                  {r.label}
                </div>
                {r.sub ? (
                  <div className="truncate text-[11px] text-[var(--pp-muted)]">{r.sub}</div>
                ) : null}
              </div>
              <div className="shrink-0 text-[13px] font-bold text-[var(--pp-accent)]">
                {r.value}
              </div>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--pp-chip)]">
              <div
                className="h-full rounded-full bg-[var(--pp-accent)]"
                style={{ width: `${Math.max(6, r.pct)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
