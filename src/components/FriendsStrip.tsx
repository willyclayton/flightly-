"use client";

import { DEMO_FRIENDS } from "@/lib/demo";
import { ProLabel } from "@/components/ui";

export function FriendsStrip() {
  return (
    <section>
      <ProLabel>Flightly Friends</ProLabel>
      <h2 className="display mt-1 text-[22px]">People you follow</h2>
      <div className="scroll-x mt-3 flex gap-3 pb-1">
        {DEMO_FRIENDS.map((f) => (
          <div key={f.name} className="card min-w-[210px] shrink-0 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[rgba(10,132,255,0.15)] text-[14px] font-semibold text-[var(--blue)]">
                {f.name.slice(0, 1)}
              </div>
              <div>
                <div className="text-[15px] font-semibold">{f.name}</div>
                <div className="text-[12px] text-[var(--text-2)]">{f.flight}</div>
              </div>
            </div>
            <div className="mt-3 text-[14px]">{f.status}</div>
            <div className="text-[12px] text-[var(--text-3)]">{f.eta}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
