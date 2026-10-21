"use client";

import { FriendsStrip } from "@/components/FriendsStrip";

export default function FriendsPage() {
  return (
    <div className="space-y-5 px-4 pb-28 pt-4">
      <div>
        <h1 className="display text-[28px]">Friends</h1>
        <p className="mt-1 text-[15px] text-[var(--text-2)]">
          Follow trips and share live status — Flighty Friends style.
        </p>
      </div>
      <FriendsStrip />
      <div className="card p-5">
        <h2 className="text-[17px] font-semibold">Invite</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[var(--text-2)]">
          Share a live flight link from any trip detail. Friends see the same map,
          countdown, and gate updates — no account required.
        </p>
      </div>
    </div>
  );
}
