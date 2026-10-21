import { NextRequest, NextResponse } from "next/server";
import { fetchWeather } from "@/lib/weather";

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lon = Number(req.nextUrl.searchParams.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "lat/lon required" }, { status: 400 });
  }
  const weather = await fetchWeather(lat, lon);
  if (!weather) {
    return NextResponse.json({ error: "weather unavailable" }, { status: 502 });
  }
  return NextResponse.json(weather);
}
