"use client";

import { useEffect, useState } from "react";
import { useFlightly } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const refreshPredictions = useFlightly((s) => s.refreshPredictions);
  const seedDemo = useFlightly((s) => s.seedDemo);

  useEffect(() => {
    const finish = () => {
      const { flights, hasSeeded } = useFlightly.getState();
      if (!hasSeeded && flights.length === 0) seedDemo();
      useFlightly.setState({ hydrated: true });
      refreshPredictions();
      setReady(true);
    };

    const unsub = useFlightly.persist.onFinishHydration(finish);
    if (useFlightly.persist.hasHydrated()) finish();

    const t = setInterval(() => refreshPredictions(), 60_000);
    return () => {
      unsub?.();
      clearInterval(t);
    };
  }, [refreshPredictions, seedDemo]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-[var(--canvas)]">
        <div className="text-center">
          <div className="display text-[28px]">Flightly</div>
          <p className="mt-2 text-[13px] text-[var(--text-2)]">Loading flights…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
