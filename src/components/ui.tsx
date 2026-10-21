import type { ReactNode } from "react";

export function ProLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--blue)]">
      {children}
    </div>
  );
}

export function SectionCard({
  children,
  className = "p-5",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`card ${className}`.trim()}>{children}</section>;
}

export function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--divider)] bg-[var(--surface-2)]/40 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-3)]">
        {label}
      </div>
      <div className="tnum mt-1 text-[15px] font-semibold">{value}</div>
    </div>
  );
}

export function EmptyState({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="card p-10 text-center">
      <h1 className="display text-[28px]">{title}</h1>
      {children}
    </div>
  );
}
