import { statusTone, phaseLabel } from "@/lib/status";
import type { Flight } from "@/lib/types";

export function StatusPill({ flight }: { flight: Flight }) {
  const tone = statusTone(flight.status);
  const chip =
    tone === "good" ? "good" : tone === "warn" ? "warn" : tone === "bad" ? "bad" : "neutral";

  let label = "ON TIME";
  if (flight.status === "delayed") {
    const mins = flight.delayPrediction?.predictedDelayMin;
    label = mins ? `DELAYED ${mins}m` : "DELAYED";
  } else if (flight.status === "early") label = "EARLY";
  else if (flight.status === "cancelled") label = "CANCELLED";
  else if (flight.status === "diverted") label = "DIVERTED";
  else if (flight.status === "landed") label = "LANDED";
  else if (flight.status === "in_air") label = phaseLabel(flight.phase).toUpperCase();
  else if (flight.status === "on_time") label = "ON TIME";

  return <span className={`status-chip ${chip}`}>{label}</span>;
}
