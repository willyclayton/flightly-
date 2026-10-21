import { differenceInMinutes, parseISO } from "date-fns";
import type { ConnectionLeg, Flight } from "@/lib/types";
import { getAirport } from "@/data/airports";

/** Gate-to-gate connection guidance inspired by Flighty Connection Assistant. */
export function analyzeConnection(inbound: Flight, outbound: Flight): ConnectionLeg | null {
  if (inbound.destIata !== outbound.originIata) return null;

  const arrive = parseISO(
    inbound.actualArrival ??
      inbound.estimatedArrival ??
      inbound.delayPrediction?.predictedArrivalIso ??
      inbound.scheduledArrival,
  );
  const depart = parseISO(
    outbound.estimatedDeparture ??
      outbound.delayPrediction?.predictedDepartureIso ??
      outbound.scheduledDeparture,
  );
  const bufferMin = differenceInMinutes(depart, arrive);
  const airport = getAirport(inbound.destIata);
  const sameTerminal =
    inbound.arrivalTerminal &&
    outbound.terminal &&
    inbound.arrivalTerminal === outbound.terminal;

  const international =
    airport &&
    ((inbound.originIata && getAirport(inbound.originIata)?.country !== airport.country) ||
      (outbound.destIata && getAirport(outbound.destIata)?.country !== airport.country));

  const walkMin = sameTerminal ? 6 + Math.abs((inbound.arrivalGate?.length ?? 1) % 8) : 12 + 8;
  const securityMin = international ? 25 : sameTerminal ? 0 : 12;
  const transferMin = international ? 15 : 5;
  const needed = walkMin + securityMin + transferMin + 10;

  let risk: ConnectionLeg["risk"] = "comfortable";
  if (bufferMin < needed) risk = "critical";
  else if (bufferMin < needed + 20) risk = "tight";

  const guidance: string[] = [];
  guidance.push(
    `You have ${bufferMin} minutes between arrival and departure at ${inbound.destIata}.`,
  );
  if (inbound.arrivalGate && outbound.gate) {
    guidance.push(`Walk from gate ${inbound.arrivalGate} to gate ${outbound.gate} (~${walkMin} min).`);
  } else if (outbound.gatePrediction?.gate) {
    guidance.push(
      `Predicted departure gate ${outbound.gatePrediction.gate} — budget ~${walkMin} min walking.`,
    );
  } else {
    guidance.push(`Budget ~${walkMin} minutes to reach your next gate.`);
  }
  if (securityMin > 0) guidance.push(`Allow ~${securityMin} minutes for security / transfer screening.`);
  if (international) guidance.push("International connection — keep passport and boarding pass ready.");
  if (risk === "critical")
    guidance.push("Critical connection. Consider asking the airline about protected alternatives now.");
  else if (risk === "tight")
    guidance.push("Tight connection. Sit near the front if you can, and don't linger at the jet bridge.");
  else guidance.push("Comfortable buffer — still watch for gate changes on the outbound.");

  return {
    fromGate: inbound.arrivalGate,
    toGate: outbound.gate ?? outbound.gatePrediction?.gate,
    walkMin,
    securityMin,
    transferMin,
    bufferMin,
    risk,
    guidance,
  };
}

export function findConnections(flights: Flight[]): Array<{
  inbound: Flight;
  outbound: Flight;
  leg: ConnectionLeg;
}> {
  const sorted = [...flights].sort(
    (a, b) =>
      parseISO(a.scheduledDeparture).getTime() - parseISO(b.scheduledDeparture).getTime(),
  );
  const out: Array<{ inbound: Flight; outbound: Flight; leg: ConnectionLeg }> = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const leg = analyzeConnection(sorted[i], sorted[j]);
      if (!leg) continue;
      if (leg.bufferMin < 0 || leg.bufferMin > 8 * 60) continue;
      out.push({ inbound: sorted[i], outbound: sorted[j], leg });
      break;
    }
  }
  return out;
}
