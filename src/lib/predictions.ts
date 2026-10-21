import { addMinutes, differenceInMinutes, parseISO, subHours } from "date-fns";
import type {
  AtcAdvisory,
  DelayCause,
  DelayPrediction,
  Flight,
  GatePrediction,
} from "@/lib/types";
import { getAirport } from "@/data/airports";

/** Deterministic pseudo-random from string — stable demo predictions. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pickCause(seed: number, weatherRisk: boolean): DelayCause {
  if (weatherRisk && seed % 5 === 0) return "weather";
  const causes: DelayCause[] = ["late_aircraft", "atc", "congestion", "ground_stop", "unknown"];
  return causes[seed % causes.length];
}

const CAUSE_COPY: Record<DelayCause, string> = {
  late_aircraft:
    "Your inbound aircraft is running behind. We expect the delay to cascade before the airline posts it.",
  weather: "Weather is disrupting the airport. Expect pushback and departure sequencing delays.",
  atc: "Air traffic control flow programs are active on this route or airport.",
  ground_stop: "A ground stop or ground delay program is affecting departures.",
  crew: "Crew legality or positioning may constrain departure.",
  maintenance: "A maintenance hold is likely based on aircraft turn patterns.",
  congestion: "Taxiway congestion and runway demand are stacking departures.",
  unknown: "We're seeing early signals of a delay without a clear published reason yet.",
};

export function predictDelay(flight: Flight, now = new Date()): DelayPrediction | undefined {
  const dep = parseISO(flight.estimatedDeparture ?? flight.scheduledDeparture);
  const hoursOut = (dep.getTime() - now.getTime()) / 3_600_000;

  // Only predict within ~25h window (Flighty Pro "where's my plane" horizon)
  if (hoursOut > 25 || hoursOut < -2) return undefined;
  if (flight.status === "cancelled" || flight.status === "landed") return undefined;

  const seed = hash(`${flight.id}:${flight.flightNumber}:${flight.scheduledDeparture.slice(0, 13)}`);

  // Weather-ish risk for coastal hubs in demo logic
  const weatherRisk = ["JFK", "EWR", "LGA", "BOS", "SFO", "SEA", "ORD", "DEN"].includes(
    flight.originIata,
  );

  let predicted = 0;
  let confidence = 0.55;
  let cause = pickCause(seed, weatherRisk);

  if (flight.inboundEta) {
    const inboundLate = differenceInMinutes(
      parseISO(flight.inboundEta),
      parseISO(flight.scheduledDeparture),
    );
    if (inboundLate > 15) {
      predicted = Math.max(predicted, Math.round(inboundLate * 0.85 + 10));
      cause = "late_aircraft";
      confidence = 0.92;
    }
  }

  // Hub congestion baseline
  const busyHubs = new Set(["ATL", "ORD", "DFW", "DEN", "CLT", "LAX", "LHR", "CDG", "FRA", "AMS"]);
  if (busyHubs.has(flight.originIata)) {
    predicted += 8 + (seed % 18);
    confidence = Math.max(confidence, 0.7);
    if (cause === "unknown") cause = "congestion";
  }

  // Evening banks tend to slip more
  const hour = dep.getUTCHours();
  if (hour >= 20 || hour <= 2) {
    predicted += 12 + (seed % 20);
    confidence = Math.min(0.95, confidence + 0.08);
  }

  // Existing published delay
  if (flight.estimatedDeparture) {
    const published = differenceInMinutes(
      parseISO(flight.estimatedDeparture),
      parseISO(flight.scheduledDeparture),
    );
    if (published > predicted) {
      predicted = published;
      confidence = 0.98;
    } else if (predicted > published + 10) {
      // We see more delay than airline admits — classic Flighty Pro pitch
      confidence = Math.max(confidence, 0.88);
    }
  }

  if (predicted < 12 && hoursOut > 6) {
    // Quiet flights stay quiet
    if (seed % 4 !== 0) return undefined;
    predicted = 15 + (seed % 25);
    confidence = 0.62;
  }

  if (predicted < 10) return undefined;

  const aheadOfAirlineMin =
    flight.estimatedDeparture &&
    differenceInMinutes(parseISO(flight.estimatedDeparture), parseISO(flight.scheduledDeparture)) <
      predicted
      ? predicted -
        differenceInMinutes(
          parseISO(flight.estimatedDeparture),
          parseISO(flight.scheduledDeparture),
        )
      : predicted;

  return {
    predictedDelayMin: predicted,
    confidence: Math.round(confidence * 100) / 100,
    cause,
    reason: CAUSE_COPY[cause],
    predictedDepartureIso: addMinutes(parseISO(flight.scheduledDeparture), predicted).toISOString(),
    predictedArrivalIso: addMinutes(
      parseISO(flight.scheduledArrival),
      Math.round(predicted * 0.9),
    ).toISOString(),
    publishedAt: subHours(now, seed % 5).toISOString(),
    aheadOfAirlineMin: Math.max(0, aheadOfAirlineMin),
  };
}

export function predictGate(flight: Flight): GatePrediction | undefined {
  if (flight.gate) {
    return {
      terminal: flight.terminal,
      gate: flight.gate,
      confidence: 1,
      reason: "Confirmed by the airline.",
    };
  }
  const origin = getAirport(flight.originIata);
  if (!origin?.terminals?.length) return undefined;
  const seed = hash(`${flight.flightNumber}:${flight.originIata}:${flight.scheduledDeparture}`);
  const terminal = origin.terminals[seed % origin.terminals.length];
  const gateNum = 1 + (seed % 48);
  return {
    terminal,
    gate: `${terminal.replace(/\D/g, "") || ""}${gateNum}`.replace(/^(\d+)$/, (m) =>
      terminal.match(/[A-Z]/) ? `${terminal.match(/[A-Z]/)?.[0] ?? "A"}${m}` : `B${m}`,
    ),
    confidence: 0.64 + (seed % 20) / 100,
    reason: `Historical turn pattern for ${flight.airlineIata} at ${flight.originIata}.`,
  };
}

export function buildAirportAdvisories(iata: string, now = new Date()): AtcAdvisory[] {
  const seed = hash(`${iata}:${now.toISOString().slice(0, 13)}`);
  const advisories: AtcAdvisory[] = [];
  if (seed % 3 === 0) {
    advisories.push({
      id: `adv_${iata}_wx`,
      airport: iata,
      type: "weather",
      title: "Weather advisory",
      summary: `Thunderstorms near ${iata} may extend taxi and departure times. Probability of extension 30–60%.`,
      severity: "watch",
      startsAt: now.toISOString(),
      endsAt: addMinutes(now, 45 + (seed % 40)).toISOString(),
      probabilityExtend: "30–60%",
    });
  }
  if (seed % 5 === 0) {
    advisories.push({
      id: `adv_${iata}_gs`,
      airport: iata,
      type: "ground_stop",
      title: `Flights from ${iata} slowed`,
      summary: `A ground delay program is metering departures for volume and spacing. Expect +20–45m.`,
      severity: "warning",
      startsAt: now.toISOString(),
      endsAt: addMinutes(now, 90).toISOString(),
    });
  }
  if (seed % 4 === 1) {
    advisories.push({
      id: `adv_${iata}_atc`,
      airport: iata,
      type: "atc",
      title: "ATC flow program",
      summary: "En-route restrictions are active on high-demand corridors. Sequencing delays likely.",
      severity: "info",
      startsAt: now.toISOString(),
    });
  }
  return advisories;
}

export function airportOpsReport(iata: string, now = new Date()) {
  const seed = hash(`${iata}:ops:${now.toISOString().slice(0, 10)}`);
  const takeoff = 5 + (seed % 35);
  const landing = 3 + (seed % 28);
  const depPct = Math.max(42, 92 - takeoff);
  const arrPct = Math.max(48, 94 - landing);
  const advisories = buildAirportAdvisories(iata, now);
  let summary = `${iata} is running smoothly with light delay trends.`;
  if (takeoff > 25) summary = `${iata} departures are stacking — takeoff delays trending +${takeoff}m.`;
  else if (advisories.some((a) => a.severity === "warning"))
    summary = `${iata} has active ATC constraints. Plan extra buffer.`;
  else if (landing > 18) summary = `Arrivals into ${iata} are holding — landing delays +${landing}m.`;

  return {
    airport: iata,
    asOf: now.toISOString(),
    takeoffDelayTrendMin: takeoff,
    landingDelayTrendMin: landing,
    departuresOnTimePct: depPct,
    arrivalsOnTimePct: arrPct,
    summary,
    advisories,
  };
}
