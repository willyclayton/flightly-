"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "Flights",
    match: (p: string) => p === "/" || p.startsWith("/flight"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
      </svg>
    ),
  },
  {
    href: "/add",
    label: "Search",
    match: (p: string) => p.startsWith("/add"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/airports",
    label: "Airport",
    match: (p: string) => p.startsWith("/airports"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 3 3 9v2l9-3.5L21 11V9L12 3zm-7 9v7h3v-5h4v5h3v-7l-5-1.5L5 12zm-2 9h18v2H3v-2z" />
      </svg>
    ),
  },
  {
    href: "/passport",
    label: "Profile",
    match: (p: string) => p.startsWith("/passport"),
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z" />
      </svg>
    ),
  },
];

export function TabBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/share")) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--divider)] bg-[rgba(11,11,15,0.92)] backdrop-blur-xl"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <div className="mx-auto flex h-16 max-w-lg items-stretch md:max-w-2xl lg:max-w-4xl">
        {tabs.map((t) => {
          const active = t.match(pathname);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold tracking-wide ${
                active ? "text-[var(--blue)]" : "text-[var(--text-2)]"
              }`}
            >
              {t.icon}
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
