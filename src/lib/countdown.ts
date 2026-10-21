import { differenceInMinutes, parseISO } from "date-fns";
import type { Flight } from "@/lib/types";

export function flightCountdown(flight: Flight, now = new Date()): {
  label: string;
  tone: "good" | "warn" | "bad" | "neutral";
  minutes: number;
} {
  const dep = parseISO(
    flight.estimatedDeparture ?? flight.scheduledDeparture,
  );
  const arr = parseISO(flight.estimatedArrival ?? flight.scheduledArrival);
  const scheduledDep = parseISO(flight.scheduledDeparture);
  const delayMin = differenceInMinutes(dep, scheduledDep);

  if (flight.status === "cancelled") {
    return { label: "Cancelled", tone: "bad", minutes: 0 };
  }
  if (flight.status === "diverted") {
    return { label: "Diverted", tone: "bad", minutes: 0 };
  }

  if (
    flight.status === "landed" ||
    flight.phase === "arrived" ||
    flight.phase === "taxi_in"
  ) {
    const early = differenceInMinutes(arr, parseISO(flight.scheduledArrival));
    if (early <= -5) {
      return {
        label: `Landed ${Math.abs(early)}m early`,
        tone: "good",
        minutes: 0,
      };
    }
    if (early >= 15) {
      return { label: `Landed ${early}m late`, tone: "warn", minutes: 0 };
    }
    return { label: "Landed", tone: "good", minutes: 0 };
  }

  if (
    flight.status === "in_air" ||
    ["taxi_out", "airborne", "cruise", "descent", "approach", "departed_gate"].includes(
      flight.phase,
    )
  ) {
    const mins = Math.max(0, differenceInMinutes(arr, now));
    return {
      label: mins >= 60
        ? `Landing in ${Math.floor(mins / 60)}h ${mins % 60}m`
        : `Landing in ${mins}m`,
      tone: delayMin >= 15 ? "warn" : "good",
      minutes: mins,
    };
  }

  const mins = differenceInMinutes(dep, now);
  if (mins <= 0) {
    return { label: "Departing now", tone: delayMin >= 15 ? "warn" : "good", minutes: 0 };
  }

  const until =
    mins >= 60
      ? `${Math.floor(mins / 60)}h ${mins % 60}m`
      : `${mins}m`;

  if (delayMin >= 15) {
    return {
      label: `Delayed · Departs in ${until}`,
      tone: "warn",
      minutes: mins,
    };
  }
  if (delayMin <= -10) {
    return {
      label: `Early · Departs in ${until}`,
      tone: "good",
      minutes: mins,
    };
  }
  return {
    label: `Departs in ${until}`,
    tone: "good",
    minutes: mins,
  };
}

export function timeToneClass(tone: "good" | "warn" | "bad" | "neutral"): string {
  if (tone === "good") return "text-[var(--on-time)]";
  if (tone === "warn") return "text-[var(--delay)]";
  if (tone === "bad") return "text-[var(--cancelled)]";
  return "text-[var(--text-2)]";
}
