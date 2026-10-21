import { differenceInMinutes, parseISO } from "date-fns";
import type { Flight, FlightPhase, FlightStatus } from "@/lib/types";

export function derivePhase(flight: Flight, now = new Date()): FlightPhase {
  if (flight.status === "cancelled") return "cancelled";
  if (flight.status === "diverted") return "diverted";

  const dep = parseISO(flight.actualDeparture ?? flight.estimatedDeparture ?? flight.scheduledDeparture);
  const arr = parseISO(flight.actualArrival ?? flight.estimatedArrival ?? flight.scheduledArrival);
  const minsToDep = differenceInMinutes(dep, now);
  const minsSinceDep = differenceInMinutes(now, dep);
  const minsToArr = differenceInMinutes(arr, now);
  const minsSinceArr = differenceInMinutes(now, arr);

  if (flight.actualArrival || minsSinceArr >= 0) {
    if (minsSinceArr < 12) return "taxi_in";
    return "arrived";
  }
  if (flight.actualDeparture || minsSinceDep >= 0) {
    if (minsSinceDep < 15) return "taxi_out";
    if (minsToArr <= 25) return "approach";
    if (minsToArr <= 55) return "descent";
    if (minsSinceDep < 25) return "airborne";
    return "cruise";
  }
  if (minsToDep <= 0) return "departed_gate";
  if (minsToDep <= 35) return "boarding";
  if (minsToDep <= 24 * 60) return "check_in";
  return "scheduled";
}

export function deriveStatus(flight: Flight, now = new Date()): FlightStatus {
  if (flight.status === "cancelled") return "cancelled";
  if (flight.status === "diverted") return "diverted";
  const phase = derivePhase(flight, now);
  if (phase === "arrived" || phase === "taxi_in" || phase === "landed") return "landed";
  if (["taxi_out", "airborne", "cruise", "descent", "approach", "departed_gate"].includes(phase))
    return "in_air";

  const scheduled = parseISO(flight.scheduledDeparture);
  const estimated = parseISO(flight.estimatedDeparture ?? flight.scheduledDeparture);
  const delta = differenceInMinutes(estimated, scheduled);
  if (delta >= 15) return "delayed";
  if (delta <= -10) return "early";
  return "on_time";
}

export function enrichFlight(flight: Flight, now = new Date()): Flight {
  const phase = derivePhase(flight, now);
  const status = deriveStatus({ ...flight, phase }, now);
  return { ...flight, phase, status, updatedAt: now.toISOString() };
}

export function phaseLabel(phase: FlightPhase): string {
  const map: Record<FlightPhase, string> = {
    scheduled: "Scheduled",
    check_in: "Check-in open",
    boarding: "Boarding",
    departed_gate: "Departed gate",
    taxi_out: "Taxiing",
    airborne: "Airborne",
    cruise: "En route",
    descent: "Descending",
    approach: "On approach",
    landed: "Landed",
    taxi_in: "Taxiing in",
    arrived: "Arrived",
    cancelled: "Cancelled",
    diverted: "Diverted",
  };
  return map[phase];
}

export function statusTone(status: FlightStatus): "good" | "warn" | "bad" | "neutral" {
  if (status === "on_time" || status === "early" || status === "landed") return "good";
  if (status === "delayed" || status === "in_air") return "warn";
  if (status === "cancelled" || status === "diverted") return "bad";
  return "neutral";
}
