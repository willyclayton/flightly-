import type { Airport } from "@/lib/types";

/** Curated major airports — enough for a rich personal Flighty experience offline. */
export const AIRPORTS: Airport[] = [
  { iata: "JFK", icao: "KJFK", name: "John F. Kennedy International", city: "New York", country: "US", lat: 40.6413, lon: -73.7781, timezone: "America/New_York", terminals: ["1", "2", "4", "5", "7", "8"] },
  { iata: "LGA", icao: "KLGA", name: "LaGuardia", city: "New York", country: "US", lat: 40.7769, lon: -73.874, timezone: "America/New_York", terminals: ["A", "B", "C"] },
  { iata: "EWR", icao: "KEWR", name: "Newark Liberty International", city: "Newark", country: "US", lat: 40.6895, lon: -74.1745, timezone: "America/New_York", terminals: ["A", "B", "C"] },
  { iata: "LAX", icao: "KLAX", name: "Los Angeles International", city: "Los Angeles", country: "US", lat: 33.9425, lon: -118.4081, timezone: "America/Los_Angeles", terminals: ["1", "2", "3", "4", "5", "6", "7", "8", "B", "TBIT"] },
  { iata: "SFO", icao: "KSFO", name: "San Francisco International", city: "San Francisco", country: "US", lat: 37.6213, lon: -122.379, timezone: "America/Los_Angeles", terminals: ["1", "2", "3", "I"] },
  { iata: "SEA", icao: "KSEA", name: "Seattle-Tacoma International", city: "Seattle", country: "US", lat: 47.4502, lon: -122.3088, timezone: "America/Los_Angeles", terminals: ["Main"] },
  { iata: "ORD", icao: "KORD", name: "O'Hare International", city: "Chicago", country: "US", lat: 41.9742, lon: -87.9073, timezone: "America/Chicago", terminals: ["1", "2", "3", "5"] },
  { iata: "MDW", icao: "KMDW", name: "Chicago Midway", city: "Chicago", country: "US", lat: 41.7868, lon: -87.7522, timezone: "America/Chicago", terminals: ["A", "B", "C"] },
  { iata: "DFW", icao: "KDFW", name: "Dallas/Fort Worth International", city: "Dallas", country: "US", lat: 32.8998, lon: -97.0403, timezone: "America/Chicago", terminals: ["A", "B", "C", "D", "E"] },
  { iata: "DAL", icao: "KDAL", name: "Dallas Love Field", city: "Dallas", country: "US", lat: 32.8471, lon: -96.8518, timezone: "America/Chicago", terminals: ["1"] },
  { iata: "ATL", icao: "KATL", name: "Hartsfield-Jackson Atlanta", city: "Atlanta", country: "US", lat: 33.6407, lon: -84.4277, timezone: "America/New_York", terminals: ["N", "S", "T", "A", "B", "C", "D", "E", "F"] },
  { iata: "MIA", icao: "KMIA", name: "Miami International", city: "Miami", country: "US", lat: 25.7959, lon: -80.287, timezone: "America/New_York", terminals: ["C", "D", "E", "F", "G", "H", "J"] },
  { iata: "MCO", icao: "KMCO", name: "Orlando International", city: "Orlando", country: "US", lat: 28.4312, lon: -81.3081, timezone: "America/New_York", terminals: ["A", "B", "C"] },
  { iata: "BOS", icao: "KBOS", name: "Logan International", city: "Boston", country: "US", lat: 42.3656, lon: -71.0096, timezone: "America/New_York", terminals: ["A", "B", "C", "E"] },
  { iata: "IAD", icao: "KIAD", name: "Washington Dulles", city: "Washington", country: "US", lat: 38.9531, lon: -77.4565, timezone: "America/New_York", terminals: ["Main", "A", "B", "C", "D"] },
  { iata: "DCA", icao: "KDCA", name: "Ronald Reagan Washington National", city: "Washington", country: "US", lat: 38.8512, lon: -77.0402, timezone: "America/New_York", terminals: ["A", "B", "C"] },
  { iata: "DEN", icao: "KDEN", name: "Denver International", city: "Denver", country: "US", lat: 39.8561, lon: -104.6737, timezone: "America/Denver", terminals: ["A", "B", "C"] },
  { iata: "LAS", icao: "KLAS", name: "Harry Reid International", city: "Las Vegas", country: "US", lat: 36.084, lon: -115.1537, timezone: "America/Los_Angeles", terminals: ["1", "3"] },
  { iata: "PHX", icao: "KPHX", name: "Phoenix Sky Harbor", city: "Phoenix", country: "US", lat: 33.4373, lon: -112.0078, timezone: "America/Phoenix", terminals: ["2", "3", "4"] },
  { iata: "MSP", icao: "KMSP", name: "Minneapolis–Saint Paul", city: "Minneapolis", country: "US", lat: 44.8848, lon: -93.2223, timezone: "America/Chicago", terminals: ["1", "2"] },
  { iata: "DTW", icao: "KDTW", name: "Detroit Metropolitan", city: "Detroit", country: "US", lat: 42.2162, lon: -83.3554, timezone: "America/New_York", terminals: ["McNamara", "North"] },
  { iata: "CLT", icao: "KCLT", name: "Charlotte Douglas", city: "Charlotte", country: "US", lat: 35.214, lon: -80.9431, timezone: "America/New_York", terminals: ["Main"] },
  { iata: "PHL", icao: "KPHL", name: "Philadelphia International", city: "Philadelphia", country: "US", lat: 39.8744, lon: -75.2424, timezone: "America/New_York", terminals: ["A", "B", "C", "D", "E", "F"] },
  { iata: "IAH", icao: "KIAH", name: "George Bush Intercontinental", city: "Houston", country: "US", lat: 29.9902, lon: -95.3368, timezone: "America/Chicago", terminals: ["A", "B", "C", "D", "E"] },
  { iata: "HOU", icao: "KHOU", name: "William P. Hobby", city: "Houston", country: "US", lat: 29.6454, lon: -95.2789, timezone: "America/Chicago", terminals: ["1"] },
  { iata: "AUS", icao: "KAUS", name: "Austin-Bergstrom", city: "Austin", country: "US", lat: 30.1945, lon: -97.6699, timezone: "America/Chicago", terminals: ["1"] },
  { iata: "SAN", icao: "KSAN", name: "San Diego International", city: "San Diego", country: "US", lat: 32.7338, lon: -117.1933, timezone: "America/Los_Angeles", terminals: ["1", "2"] },
  { iata: "PDX", icao: "KPDX", name: "Portland International", city: "Portland", country: "US", lat: 45.5898, lon: -122.5951, timezone: "America/Los_Angeles", terminals: ["Main"] },
  { iata: "SLC", icao: "KSLC", name: "Salt Lake City International", city: "Salt Lake City", country: "US", lat: 40.7899, lon: -111.9791, timezone: "America/Denver", terminals: ["1", "2"] },
  { iata: "BNA", icao: "KBNA", name: "Nashville International", city: "Nashville", country: "US", lat: 36.1263, lon: -86.6774, timezone: "America/Chicago", terminals: ["A", "B", "C"] },
  { iata: "HNL", icao: "PHNL", name: "Daniel K. Inouye International", city: "Honolulu", country: "US", lat: 21.3187, lon: -157.9225, timezone: "Pacific/Honolulu", terminals: ["1", "2"] },
  { iata: "ANC", icao: "PANC", name: "Ted Stevens Anchorage", city: "Anchorage", country: "US", lat: 61.1743, lon: -149.9962, timezone: "America/Anchorage", terminals: ["S", "N"] },
  { iata: "LHR", icao: "EGLL", name: "London Heathrow", city: "London", country: "GB", lat: 51.47, lon: -0.4543, timezone: "Europe/London", terminals: ["2", "3", "4", "5"] },
  { iata: "LGW", icao: "EGKK", name: "London Gatwick", city: "London", country: "GB", lat: 51.1537, lon: -0.1821, timezone: "Europe/London", terminals: ["N", "S"] },
  { iata: "CDG", icao: "LFPG", name: "Paris Charles de Gaulle", city: "Paris", country: "FR", lat: 49.0097, lon: 2.5479, timezone: "Europe/Paris", terminals: ["1", "2A", "2B", "2C", "2D", "2E", "2F", "2G", "3"] },
  { iata: "ORY", icao: "LFPO", name: "Paris Orly", city: "Paris", country: "FR", lat: 48.7233, lon: 2.3794, timezone: "Europe/Paris", terminals: ["1", "2", "3", "4"] },
  { iata: "AMS", icao: "EHAM", name: "Amsterdam Schiphol", city: "Amsterdam", country: "NL", lat: 52.3105, lon: 4.7683, timezone: "Europe/Amsterdam", terminals: ["1", "2", "3"] },
  { iata: "FRA", icao: "EDDF", name: "Frankfurt Airport", city: "Frankfurt", country: "DE", lat: 50.0379, lon: 8.5622, timezone: "Europe/Berlin", terminals: ["1", "2"] },
  { iata: "MUC", icao: "EDDM", name: "Munich Airport", city: "Munich", country: "DE", lat: 48.3538, lon: 11.7861, timezone: "Europe/Berlin", terminals: ["1", "2"] },
  { iata: "MAD", icao: "LEMD", name: "Madrid-Barajas", city: "Madrid", country: "ES", lat: 40.4983, lon: -3.5676, timezone: "Europe/Madrid", terminals: ["1", "2", "3", "4", "4S"] },
  { iata: "BCN", icao: "LEBL", name: "Barcelona-El Prat", city: "Barcelona", country: "ES", lat: 41.2974, lon: 2.0833, timezone: "Europe/Madrid", terminals: ["1", "2"] },
  { iata: "FCO", icao: "LIRF", name: "Rome Fiumicino", city: "Rome", country: "IT", lat: 41.8003, lon: 12.2389, timezone: "Europe/Rome", terminals: ["1", "3"] },
  { iata: "MXP", icao: "LIMC", name: "Milan Malpensa", city: "Milan", country: "IT", lat: 45.6306, lon: 8.7281, timezone: "Europe/Rome", terminals: ["1", "2"] },
  { iata: "ZRH", icao: "LSZH", name: "Zurich Airport", city: "Zurich", country: "CH", lat: 47.4647, lon: 8.5492, timezone: "Europe/Zurich", terminals: ["1", "2"] },
  { iata: "VIE", icao: "LOWW", name: "Vienna International", city: "Vienna", country: "AT", lat: 48.1103, lon: 16.5697, timezone: "Europe/Vienna", terminals: ["1", "3"] },
  { iata: "CPH", icao: "EKCH", name: "Copenhagen", city: "Copenhagen", country: "DK", lat: 55.618, lon: 12.656, timezone: "Europe/Copenhagen", terminals: ["2", "3"] },
  { iata: "OSL", icao: "ENGM", name: "Oslo Gardermoen", city: "Oslo", country: "NO", lat: 60.1939, lon: 11.1004, timezone: "Europe/Oslo", terminals: ["Main"] },
  { iata: "ARN", icao: "ESSA", name: "Stockholm Arlanda", city: "Stockholm", country: "SE", lat: 59.6519, lon: 17.9186, timezone: "Europe/Stockholm", terminals: ["2", "4", "5"] },
  { iata: "DUB", icao: "EIDW", name: "Dublin Airport", city: "Dublin", country: "IE", lat: 53.4213, lon: -6.2701, timezone: "Europe/Dublin", terminals: ["1", "2"] },
  { iata: "LIS", icao: "LPPT", name: "Lisbon Humberto Delgado", city: "Lisbon", country: "PT", lat: 38.7742, lon: -9.1342, timezone: "Europe/Lisbon", terminals: ["1", "2"] },
  { iata: "IST", icao: "LTFM", name: "Istanbul Airport", city: "Istanbul", country: "TR", lat: 41.2753, lon: 28.7519, timezone: "Europe/Istanbul", terminals: ["Main"] },
  { iata: "DXB", icao: "OMDB", name: "Dubai International", city: "Dubai", country: "AE", lat: 25.2532, lon: 55.3657, timezone: "Asia/Dubai", terminals: ["1", "2", "3"] },
  { iata: "AUH", icao: "OMAA", name: "Abu Dhabi International", city: "Abu Dhabi", country: "AE", lat: 24.433, lon: 54.6511, timezone: "Asia/Dubai", terminals: ["A"] },
  { iata: "DOH", icao: "OTHH", name: "Hamad International", city: "Doha", country: "QA", lat: 25.2731, lon: 51.6081, timezone: "Asia/Qatar", terminals: ["Main"] },
  { iata: "SIN", icao: "WSSS", name: "Singapore Changi", city: "Singapore", country: "SG", lat: 1.3644, lon: 103.9915, timezone: "Asia/Singapore", terminals: ["1", "2", "3", "4"] },
  { iata: "HKG", icao: "VHHH", name: "Hong Kong International", city: "Hong Kong", country: "HK", lat: 22.308, lon: 113.9185, timezone: "Asia/Hong_Kong", terminals: ["1", "2"] },
  { iata: "NRT", icao: "RJAA", name: "Tokyo Narita", city: "Tokyo", country: "JP", lat: 35.772, lon: 140.3929, timezone: "Asia/Tokyo", terminals: ["1", "2", "3"] },
  { iata: "HND", icao: "RJTT", name: "Tokyo Haneda", city: "Tokyo", country: "JP", lat: 35.5494, lon: 139.7798, timezone: "Asia/Tokyo", terminals: ["1", "2", "3"] },
  { iata: "ICN", icao: "RKSI", name: "Incheon International", city: "Seoul", country: "KR", lat: 37.4602, lon: 126.4407, timezone: "Asia/Seoul", terminals: ["1", "2"] },
  { iata: "PEK", icao: "ZBAA", name: "Beijing Capital", city: "Beijing", country: "CN", lat: 40.0799, lon: 116.6031, timezone: "Asia/Shanghai", terminals: ["1", "2", "3"] },
  { iata: "PVG", icao: "ZSPD", name: "Shanghai Pudong", city: "Shanghai", country: "CN", lat: 31.1443, lon: 121.8083, timezone: "Asia/Shanghai", terminals: ["1", "2"] },
  { iata: "BKK", icao: "VTBS", name: "Suvarnabhumi", city: "Bangkok", country: "TH", lat: 13.69, lon: 100.7501, timezone: "Asia/Bangkok", terminals: ["Main"] },
  { iata: "KUL", icao: "WMKK", name: "Kuala Lumpur International", city: "Kuala Lumpur", country: "MY", lat: 2.7456, lon: 101.7099, timezone: "Asia/Kuala_Lumpur", terminals: ["1", "2"] },
  { iata: "SYD", icao: "YSSY", name: "Sydney Kingsford Smith", city: "Sydney", country: "AU", lat: -33.9399, lon: 151.1753, timezone: "Australia/Sydney", terminals: ["1", "2", "3"] },
  { iata: "MEL", icao: "YMML", name: "Melbourne Airport", city: "Melbourne", country: "AU", lat: -37.6733, lon: 144.8433, timezone: "Australia/Melbourne", terminals: ["1", "2", "3", "4"] },
  { iata: "AKL", icao: "NZAA", name: "Auckland Airport", city: "Auckland", country: "NZ", lat: -37.0082, lon: 174.785, timezone: "Pacific/Auckland", terminals: ["I", "D"] },
  { iata: "YYZ", icao: "CYYZ", name: "Toronto Pearson", city: "Toronto", country: "CA", lat: 43.6777, lon: -79.6248, timezone: "America/Toronto", terminals: ["1", "3"] },
  { iata: "YVR", icao: "CYVR", name: "Vancouver International", city: "Vancouver", country: "CA", lat: 49.1967, lon: -123.1815, timezone: "America/Vancouver", terminals: ["M", "I"] },
  { iata: "YUL", icao: "CYUL", name: "Montréal-Trudeau", city: "Montreal", country: "CA", lat: 45.4706, lon: -73.7408, timezone: "America/Toronto", terminals: ["Main"] },
  { iata: "MEX", icao: "MMMX", name: "Mexico City International", city: "Mexico City", country: "MX", lat: 19.4363, lon: -99.0721, timezone: "America/Mexico_City", terminals: ["1", "2"] },
  { iata: "CUN", icao: "MMUN", name: "Cancún International", city: "Cancún", country: "MX", lat: 21.0365, lon: -86.8771, timezone: "America/Cancun", terminals: ["2", "3", "4"] },
  { iata: "GRU", icao: "SBGR", name: "São Paulo Guarulhos", city: "São Paulo", country: "BR", lat: -23.4356, lon: -46.4731, timezone: "America/Sao_Paulo", terminals: ["1", "2", "3"] },
  { iata: "GIG", icao: "SBGL", name: "Rio de Janeiro Galeão", city: "Rio de Janeiro", country: "BR", lat: -22.809, lon: -43.2506, timezone: "America/Sao_Paulo", terminals: ["1", "2"] },
  { iata: "EZE", icao: "SAEZ", name: "Buenos Aires Ezeiza", city: "Buenos Aires", country: "AR", lat: -34.8222, lon: -58.5358, timezone: "America/Argentina/Buenos_Aires", terminals: ["A", "C"] },
  { iata: "BOG", icao: "SKBO", name: "El Dorado International", city: "Bogotá", country: "CO", lat: 4.7016, lon: -74.1469, timezone: "America/Bogota", terminals: ["1", "2"] },
  { iata: "LIM", icao: "SPJC", name: "Jorge Chávez International", city: "Lima", country: "PE", lat: -12.0219, lon: -77.1143, timezone: "America/Lima", terminals: ["Main"] },
  { iata: "SCL", icao: "SCEL", name: "Santiago Arturo Merino Benítez", city: "Santiago", country: "CL", lat: -33.393, lon: -70.7858, timezone: "America/Santiago", terminals: ["I", "D"] },
  { iata: "JNB", icao: "FAOR", name: "O.R. Tambo International", city: "Johannesburg", country: "ZA", lat: -26.1392, lon: 28.246, timezone: "Africa/Johannesburg", terminals: ["A", "B"] },
  { iata: "CPT", icao: "FACT", name: "Cape Town International", city: "Cape Town", country: "ZA", lat: -33.9648, lon: 18.6017, timezone: "Africa/Johannesburg", terminals: ["Main"] },
  { iata: "CAI", icao: "HECA", name: "Cairo International", city: "Cairo", country: "EG", lat: 30.1219, lon: 31.4056, timezone: "Africa/Cairo", terminals: ["1", "2", "3"] },
  { iata: "ADD", icao: "HAAB", name: "Addis Ababa Bole", city: "Addis Ababa", country: "ET", lat: 8.9779, lon: 38.7993, timezone: "Africa/Addis_Ababa", terminals: ["1", "2"] },
  { iata: "NBO", icao: "HKJK", name: "Jomo Kenyatta International", city: "Nairobi", country: "KE", lat: -1.3192, lon: 36.9278, timezone: "Africa/Nairobi", terminals: ["1A", "1B", "1C", "1D", "1E"] },
  { iata: "DEL", icao: "VIDP", name: "Indira Gandhi International", city: "Delhi", country: "IN", lat: 28.5562, lon: 77.1, timezone: "Asia/Kolkata", terminals: ["1", "2", "3"] },
  { iata: "BOM", icao: "VABB", name: "Chhatrapati Shivaji Maharaj", city: "Mumbai", country: "IN", lat: 19.0896, lon: 72.8656, timezone: "Asia/Kolkata", terminals: ["1", "2"] },
  { iata: "BLR", icao: "VOBL", name: "Kempegowda International", city: "Bengaluru", country: "IN", lat: 13.1989, lon: 77.7069, timezone: "Asia/Kolkata", terminals: ["1", "2"] },
];

const byIata = new Map(AIRPORTS.map((a) => [a.iata, a]));
const byIcao = new Map(AIRPORTS.map((a) => [a.icao, a]));

export function getAirport(code: string): Airport | undefined {
  const c = code.trim().toUpperCase();
  return byIata.get(c) ?? byIcao.get(c);
}

export function searchAirports(query: string, limit = 12): Airport[] {
  const q = query.trim().toLowerCase();
  if (!q) return AIRPORTS.slice(0, limit);
  return AIRPORTS.filter(
    (a) =>
      a.iata.toLowerCase().includes(q) ||
      a.icao.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q),
  ).slice(0, limit);
}
