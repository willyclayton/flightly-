import { format, formatDistanceStrict, differenceInMinutes, parseISO } from "date-fns";

export function fmtTime(iso: string, tzHint?: string): string {
  try {
    const d = parseISO(iso);
    if (tzHint) {
      return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: tzHint,
      }).format(d);
    }
    return format(d, "h:mm a");
  } catch {
    return "—";
  }
}

export function fmtDate(iso: string, tzHint?: string): string {
  try {
    const d = parseISO(iso);
    if (tzHint) {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: tzHint,
      }).format(d);
    }
    return format(d, "EEE, MMM d");
  } catch {
    return "—";
  }
}

export function fmtDateTime(iso: string): string {
  try {
    return format(parseISO(iso), "EEE MMM d · h:mm a");
  } catch {
    return "—";
  }
}

export function delayLabel(scheduledIso: string, comparedIso?: string): string | null {
  if (!comparedIso) return null;
  const mins = differenceInMinutes(parseISO(comparedIso), parseISO(scheduledIso));
  if (mins === 0) return "on time";
  if (mins > 0) return `${mins}m late`;
  return `${Math.abs(mins)}m early`;
}

export function durationLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function relativeLabel(iso: string): string {
  try {
    return formatDistanceStrict(parseISO(iso), new Date(), { addSuffix: true });
  } catch {
    return "";
  }
}

export function weatherFromCode(code: number): { summary: string; icon: string } {
  if (code === 0) return { summary: "Clear", icon: "sun" };
  if (code <= 3) return { summary: "Partly cloudy", icon: "cloud-sun" };
  if (code <= 48) return { summary: "Foggy", icon: "fog" };
  if (code <= 67) return { summary: "Rain", icon: "rain" };
  if (code <= 77) return { summary: "Snow", icon: "snow" };
  if (code <= 82) return { summary: "Showers", icon: "rain" };
  if (code <= 86) return { summary: "Snow showers", icon: "snow" };
  if (code <= 99) return { summary: "Thunderstorms", icon: "storm" };
  return { summary: "Unknown", icon: "cloud" };
}

export function uid(prefix = "flt"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function shareToken(): string {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6);
}
