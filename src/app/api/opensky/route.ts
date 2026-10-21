import { NextRequest, NextResponse } from "next/server";
import {
  fetchOpenSkyByCallsign,
  fetchOpenSkyByIcao24,
  fetchOpenSkyBbox,
} from "@/lib/opensky";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const callsign = sp.get("callsign");
  const icao24 = sp.get("icao24");
  const bbox = sp.get("bbox");

  if (icao24) {
    const pos = await fetchOpenSkyByIcao24(icao24);
    return NextResponse.json({ position: pos });
  }
  if (callsign) {
    const pos = await fetchOpenSkyByCallsign(callsign);
    return NextResponse.json({ position: pos });
  }
  if (bbox) {
    const [lamin, lomin, lamax, lomax] = bbox.split(",").map(Number);
    if ([lamin, lomin, lamax, lomax].some((n) => !Number.isFinite(n))) {
      return NextResponse.json({ error: "invalid bbox" }, { status: 400 });
    }
    const positions = await fetchOpenSkyBbox(lamin, lomin, lamax, lomax);
    return NextResponse.json({ positions });
  }

  return NextResponse.json(
    { error: "Provide callsign, icao24, or bbox" },
    { status: 400 },
  );
}
