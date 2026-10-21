"use client";

import { DEMO_FRIENDS } from "@/lib/demo";

export function FriendsStrip() {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--blue)]">
            Flightly Friends
          </div>
          <h2 className="display text-2xl">People you follow</h2>
        </div>
      </div>
      <div className="scroll-x flex gap-3 pb-1">
        {DEMO_FRIENDS.map((f) => (
          <div
            key={f.name}
            className="card min-w-[220px] shrink-0 rounded-3xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[rgba(10,132,255,0.15)] text-sm font-semibold text-[var(--blue)]">
                {f.name.slice(0, 1)}
              </div>
              <div>
                <div className="font-semibold">{f.name}</div>
                <div className="text-xs text-[var(--text-2)]">{f.flight}</div>
              </div>
            </div>
            <div className="mt-3 text-sm text-[var(--text)]">{f.status}</div>
            <div className="text-xs text-[var(--text-3)]">{f.eta}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
