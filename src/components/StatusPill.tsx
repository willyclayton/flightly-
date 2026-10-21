import { statusTone } from "@/lib/status";
import type { Flight } from "@/lib/types";
import { flightCountdown } from "@/lib/countdown";

export function StatusPill({ flight }: { flight: Flight }) {
  const tone = statusTone(flight.status);
  const chip =
    tone === "good" ? "good" : tone === "warn" ? "warn" : tone === "bad" ? "bad" : "neutral";
  const countdown = flightCountdown(flight);

  let label = "ON TIME";
  if (flight.status === "cancelled") label = "CANCELLED";
  else if (flight.status === "diverted") label = "DIVERTED";
  else if (flight.status === "landed") label = "LANDED";
  else if (flight.status === "delayed" || countdown.tone === "warn") {
    const m = flight.delayPrediction?.predictedDelayMin;
    label = m ? `DELAYED ${m}m` : "DELAYED";
  } else if (flight.status === "in_air") label = "EN ROUTE";
  else if (flight.status === "early") label = "EARLY";

  return <span className={`status-chip ${chip}`}>{label}</span>;
}
