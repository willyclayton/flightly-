"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Flights", icon: "✈" },
  { href: "/add", label: "Search", icon: "⌕" },
  { href: "/airports", label: "Airport", icon: "⌂" },
  { href: "/passport", label: "Profile", icon: "☺" },
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
          const active =
            t.href === "/"
              ? pathname === "/" || pathname.startsWith("/flight")
              : pathname.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold tracking-wide ${
                active ? "text-[var(--blue)]" : "text-[var(--text-2)]"
              }`}
            >
              <span className="text-xl leading-none">{t.icon}</span>
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
