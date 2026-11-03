export type FlightPhase =
  | "scheduled"
  | "check_in"
  | "boarding"
  | "departed_gate"
  | "taxi_out"
  | "airborne"
  | "cruise"
  | "descent"
  | "approach"
  | "landed"
  | "taxi_in"
  | "arrived"
  | "cancelled"
  | "diverted";

export type FlightStatus =
  | "on_time"
  | "early"
  | "delayed"
  | "cancelled"
  | "diverted"
  | "landed"
  | "in_air";

export type DelayCause =
  | "late_aircraft"
  | "weather"
  | "atc"
  | "ground_stop"
  | "crew"
  | "maintenance"
  | "congestion"
  | "unknown";

export interface Airport {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  timezone: string;
  terminals?: string[];
}

export interface Airline {
  iata: string;
  icao: string;
  name: string;
  callsign?: string;
}

export interface AircraftInfo {
  registration?: string;
  icao24?: string;
  type?: string;
  model?: string;
  ageYears?: number;
  name?: string;
}

export interface DelayPrediction {
  predictedDelayMin: number;
  confidence: number;
  cause: DelayCause;
  reason: string;
  predictedDepartureIso?: string;
  predictedArrivalIso?: string;
  publishedAt: string;
  aheadOfAirlineMin?: number;
}

export interface GatePrediction {
  terminal?: string;
  gate?: string;
  confidence: number;
  reason: string;
}

export interface AtcAdvisory {
  id: string;
  airport: string;
  type: "ground_stop" | "ground_delay" | "weather" | "runway" | "staffing" | "atc" | "general";
  title: string;
  summary: string;
  severity: "info" | "watch" | "warning";
  startsAt: string;
  endsAt?: string;
  probabilityExtend?: string;
}

export interface WeatherSnapshot {
  tempC: number;
  weatherCode: number;
  windKph?: number;
  visibilityKm?: number;
  summary: string;
  icon: string;
}

export interface LivePosition {
  lat: number;
  lon: number;
  altitudeFt?: number;
  speedKts?: number;
  heading?: number;
  verticalRateFpm?: number;
  onGround?: boolean;
  squawk?: string;
  updatedAt: string;
  source: "opensky" | "simulated" | "manual";
}

export interface ConnectionLeg {
  fromGate?: string;
  toGate?: string;
  walkMin: number;
  securityMin: number;
  transferMin: number;
  bufferMin: number;
  risk: "comfortable" | "tight" | "critical";
  guidance: string[];
}

export interface Flight {
  id: string;
  flightNumber: string;
  airlineIata: string;
  originIata: string;
  destIata: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  estimatedDeparture?: string;
  estimatedArrival?: string;
  actualDeparture?: string;
  actualArrival?: string;
  status: FlightStatus;
  phase: FlightPhase;
  terminal?: string;
  gate?: string;
  arrivalTerminal?: string;
  arrivalGate?: string;
  baggageClaim?: string;
  bookingCode?: string;
  seat?: string;
  cabin?: "economy" | "premium" | "business" | "first";
  aircraft?: AircraftInfo;
  inboundFlightNumber?: string;
  inboundEta?: string;
  delayPrediction?: DelayPrediction;
  gatePrediction?: GatePrediction;
  distanceNm?: number;
  durationMin?: number;
  notes?: string;
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface AirportOpsReport {
  airport: string;
  asOf: string;
  takeoffDelayTrendMin: number;
  landingDelayTrendMin: number;
  departuresOnTimePct: number;
  arrivalsOnTimePct: number;
  summary: string;
  advisories: AtcAdvisory[];
}

export interface PassportStats {
  flights: number;
  airports: number;
  countries: number;
  airlines: number;
  miles: number;
  hours: number;
  /** e.g. "192h 30m" — Flighty Passport primary time display */
  flightTimeLabel: string;
  longestNm: number;
  mostVisited: { iata: string; count: number }[];
  topAirlines: { iata: string; name: string; count: number }[];
  topRoutes: { route: string; count: number }[];
  weekdayFlights: { day: number; label: string; count: number }[];
  countriesList: { code: string; flag: string; name: string }[];
  delayHours: number;
  delayMinTotal: number;
  worstDelayMin: number;
  delayedFlights: number;
  year: number | "all";
}
