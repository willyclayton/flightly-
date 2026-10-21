"use client";

import Link from "next/link";
import { useFlightly } from "@/lib/store";

const links = [
  { href: "/airports", title: "Airports", sub: "Live conditions & delay trends" },
  { href: "/live", title: "Live", sub: "Glanceable in-flight status" },
  { href: "/add", title: "Add flight", sub: "Search or import ICS / CSV" },
  { href: "/passport", title: "Passport", sub: "Miles, map, blacklight share" },
];

export default function MorePage() {
  const seedDemo = useFlightly((s) => s.seedDemo);
  const clearAll = useFlightly((s) => s.clearAll);

  return (
    <div className="space-y-5 px-4 pb-28 pt-4">
      <div>
        <h1 className="display text-[28px]">More</h1>
        <p className="mt-1 text-[15px] text-[var(--text-2)]">Airports, Live, imports, and tools</p>
      </div>

      <ul className="card divide-y divide-[var(--divider)] overflow-hidden">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="flex items-center justify-between px-4 py-4">
              <div>
                <div className="text-[16px] font-semibold">{l.title}</div>
                <div className="text-[13px] text-[var(--text-2)]">{l.sub}</div>
              </div>
              <span className="text-[var(--text-3)]">›</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="card space-y-2 p-4">
        <button
          type="button"
          className="btn btn-ghost w-full"
          onClick={() => seedDemo()}
        >
          Reload demo trips
        </button>
        <button
          type="button"
          className="btn btn-ghost w-full text-[var(--cancelled)]"
          onClick={() => {
            if (confirm("Clear all on-device flights?")) clearAll();
          }}
        >
          Clear all flights
        </button>
      </div>
    </div>
  );
}
