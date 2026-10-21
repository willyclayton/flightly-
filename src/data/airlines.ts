import type { Airline } from "@/lib/types";

export const AIRLINES: Airline[] = [
  { iata: "AA", icao: "AAL", name: "American Airlines", callsign: "AMERICAN" },
  { iata: "DL", icao: "DAL", name: "Delta Air Lines", callsign: "DELTA" },
  { iata: "UA", icao: "UAL", name: "United Airlines", callsign: "UNITED" },
  { iata: "WN", icao: "SWA", name: "Southwest Airlines", callsign: "SOUTHWEST" },
  { iata: "B6", icao: "JBU", name: "JetBlue Airways", callsign: "JETBLUE" },
  { iata: "AS", icao: "ASA", name: "Alaska Airlines", callsign: "ALASKA" },
  { iata: "NK", icao: "NKS", name: "Spirit Airlines", callsign: "SPIRIT" },
  { iata: "F9", icao: "FFT", name: "Frontier Airlines", callsign: "FRONTIER" },
  { iata: "HA", icao: "HAL", name: "Hawaiian Airlines", callsign: "HAWAIIAN" },
  { iata: "BA", icao: "BAW", name: "British Airways", callsign: "SPEEDBIRD" },
  { iata: "VS", icao: "VIR", name: "Virgin Atlantic", callsign: "VIRGIN" },
  { iata: "AF", icao: "AFR", name: "Air France", callsign: "AIRFRANS" },
  { iata: "KL", icao: "KLM", name: "KLM Royal Dutch Airlines", callsign: "KLM" },
  { iata: "LH", icao: "DLH", name: "Lufthansa", callsign: "LUFTHANSA" },
  { iata: "LX", icao: "SWR", name: "Swiss International Air Lines", callsign: "SWISS" },
  { iata: "OS", icao: "AUA", name: "Austrian Airlines", callsign: "AUSTRIAN" },
  { iata: "IB", icao: "IBE", name: "Iberia", callsign: "IBERIA" },
  { iata: "AZ", icao: "ITY", name: "ITA Airways", callsign: "ITARROW" },
  { iata: "TP", icao: "TAP", name: "TAP Air Portugal", callsign: "AIR PORTUGAL" },
  { iata: "EI", icao: "EIN", name: "Aer Lingus", callsign: "SHAMROCK" },
  { iata: "SK", icao: "SAS", name: "Scandinavian Airlines", callsign: "SCANDINAVIAN" },
  { iata: "AY", icao: "FIN", name: "Finnair", callsign: "FINNAIR" },
  { iata: "TK", icao: "THY", name: "Turkish Airlines", callsign: "TURKISH" },
  { iata: "EK", icao: "UAE", name: "Emirates", callsign: "EMIRATES" },
  { iata: "QR", icao: "QTR", name: "Qatar Airways", callsign: "QATARI" },
  { iata: "EY", icao: "ETD", name: "Etihad Airways", callsign: "ETIHAD" },
  { iata: "SQ", icao: "SIA", name: "Singapore Airlines", callsign: "SINGAPORE" },
  { iata: "CX", icao: "CPA", name: "Cathay Pacific", callsign: "CATHAY" },
  { iata: "NH", icao: "ANA", name: "All Nippon Airways", callsign: "ALL NIPPON" },
  { iata: "JL", icao: "JAL", name: "Japan Airlines", callsign: "JAPAN AIR" },
  { iata: "KE", icao: "KAL", name: "Korean Air", callsign: "KOREANAIR" },
  { iata: "OZ", icao: "AAR", name: "Asiana Airlines", callsign: "ASIANA" },
  { iata: "QF", icao: "QFA", name: "Qantas", callsign: "QANTAS" },
  { iata: "NZ", icao: "ANZ", name: "Air New Zealand", callsign: "NEW ZEALAND" },
  { iata: "AC", icao: "ACA", name: "Air Canada", callsign: "AIR CANADA" },
  { iata: "WS", icao: "WJA", name: "WestJet", callsign: "WESTJET" },
  { iata: "AM", icao: "AMX", name: "Aeroméxico", callsign: "AEROMEXICO" },
  { iata: "LA", icao: "LAN", name: "LATAM Airlines", callsign: "LAN" },
  { iata: "AV", icao: "AVA", name: "Avianca", callsign: "AVIANCA" },
  { iata: "G3", icao: "GLO", name: "Gol Linhas Aéreas", callsign: "GOL" },
  { iata: "JJ", icao: "TAM", name: "LATAM Brasil", callsign: "TAM" },
  { iata: "ET", icao: "ETH", name: "Ethiopian Airlines", callsign: "ETHIOPIAN" },
  { iata: "SA", icao: "SAA", name: "South African Airways", callsign: "SPRINGBOK" },
  { iata: "MS", icao: "MSR", name: "EgyptAir", callsign: "EGYPTAIR" },
  { iata: "KQ", icao: "KQA", name: "Kenya Airways", callsign: "KENYA" },
  { iata: "AI", icao: "AIC", name: "Air India", callsign: "AIRINDIA" },
  { iata: "6E", icao: "IGO", name: "IndiGo", callsign: "IFLY" },
  { iata: "TG", icao: "THA", name: "Thai Airways", callsign: "THAI" },
  { iata: "MH", icao: "MAS", name: "Malaysia Airlines", callsign: "MALAYSIAN" },
  { iata: "CA", icao: "CCA", name: "Air China", callsign: "AIR CHINA" },
  { iata: "MU", icao: "CES", name: "China Eastern", callsign: "CHINA EASTERN" },
  { iata: "CZ", icao: "CSN", name: "China Southern", callsign: "CHINA SOUTHERN" },
  { iata: "FR", icao: "RYR", name: "Ryanair", callsign: "RYANAIR" },
  { iata: "U2", icao: "EZY", name: "easyJet", callsign: "EASY" },
  { iata: "W6", icao: "WZZ", name: "Wizz Air", callsign: "WIZZ AIR" },
];

const byIata = new Map(AIRLINES.map((a) => [a.iata, a]));

export function getAirline(code: string): Airline | undefined {
  return byIata.get(code.trim().toUpperCase());
}

export function parseFlightNumber(raw: string): { airlineIata: string; number: string } | null {
  const cleaned = raw.replace(/\s+/g, "").toUpperCase();
  const m = cleaned.match(/^([A-Z0-9]{2})(\d{1,4}[A-Z]?)$/);
  if (!m) return null;
  return { airlineIata: m[1], number: m[2] };
}
