import type { WeatherSnapshot } from "@/lib/types";
import { weatherFromCode } from "@/lib/format";

export async function fetchWeather(lat: number, lon: number): Promise<WeatherSnapshot | null> {
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,weather_code,wind_speed_10m,visibility&temperature_unit=celsius&wind_speed_unit=kmh`;
    const res = await fetch(url, { next: { revalidate: 600 }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      current?: {
        temperature_2m: number;
        weather_code: number;
        wind_speed_10m?: number;
        visibility?: number;
      };
    };
    if (!data.current) return null;
    const meta = weatherFromCode(data.current.weather_code);
    return {
      tempC: data.current.temperature_2m,
      weatherCode: data.current.weather_code,
      windKph: data.current.wind_speed_10m,
      visibilityKm:
        data.current.visibility != null
          ? Math.round((data.current.visibility / 1000) * 10) / 10
          : undefined,
      summary: meta.summary,
      icon: meta.icon,
    };
  } catch {
    return null;
  }
}

export function tempF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}
