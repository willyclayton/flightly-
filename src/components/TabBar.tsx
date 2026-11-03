"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "Flights",
    match: (p: string) => p === "/" || p.startsWith("/flight"),
    icon: (active: boolean) => (
      <span
        className={`grid h-8 w-8 place-items-center rounded-full ${
          active ? "bg-[var(--blue)] text-white" : "text-current"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
      </span>
    ),
  },
  {
    href: "/friends",
    label: "Friends",
    match: (p: string) => p.startsWith("/friends"),
    icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-8 1a3.5 3.5 0 1 0-3.5-3.5A3.5 3.5 0 0 0 8 12zm8 2c-2.8 0-8 1.4-8 4.2V20h16v-1.8C24 15.4 18.8 14 16 14zM8 14c-.3 0-.7 0-1 .1-2.3.5-7 1.7-7 4.1V20h6v-1.8c0-1.2.5-2.2 1.4-3C8.2 14.5 8.1 14 8 14z" />
      </svg>
    ),
  },
  {
    href: "/passport",
    label: "Passport",
    match: (p: string) => p.startsWith("/passport"),
    icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M6 2h9a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm1 2v16h8a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H7zm3.5 4a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm0 6.5c1.8 0 5.5.9 5.5 2.2V18H5v-.3c0-1.3 3.7-2.2 5.5-2.2z" />
      </svg>
    ),
  },
  {
    href: "/more",
    label: "More",
    match: (p: string) =>
      p.startsWith("/more") || p.startsWith("/airports") || p.startsWith("/live"),
    icon: () => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
      </svg>
    ),
  },
];

export function TabBar() {
  const pathname = usePathname();
  // Passport is a full-screen Flighty modal (X / Share chrome), not a tab root.
  if (pathname.startsWith("/share") || pathname.startsWith("/passport")) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex items-end justify-center gap-3 px-4"
      style={{ paddingBottom: "calc(10px + var(--safe-bottom))" }}
    >
      <nav className="pointer-events-auto flex h-[58px] max-w-[min(100%,340px)] flex-1 items-stretch rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(22,22,28,0.92)] px-1 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        {tabs.map((t) => {
          const active = t.match(pathname);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold tracking-wide ${
                active ? "text-[var(--blue)]" : "text-[var(--text-2)]"
              }`}
            >
              {t.icon(active)}
              {t.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/add"
        aria-label="Search flights"
        className="pointer-events-auto grid h-[58px] w-[58px] shrink-0 place-items-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(22,22,28,0.92)] text-white shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </Link>
    </div>
  );
}
