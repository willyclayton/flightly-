"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { searchAirports } from "@/data/airports";
import { parseFlightNumber, AIRLINES } from "@/data/airlines";
import { createManualFlight, useFlightly } from "@/lib/store";

export function AddFlightForm() {
  const router = useRouter();
  const addFlight = useFlightly((s) => s.addFlight);
  const [flightNumber, setFlightNumber] = useState("DL884");
  const [origin, setOrigin] = useState("AUS");
  const [dest, setDest] = useState("JFK");
  const [departure, setDeparture] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(8, 30, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [gate, setGate] = useState("");
  const [terminal, setTerminal] = useState("");
  const [bookingCode, setBookingCode] = useState("");
  const [seat, setSeat] = useState("");
  const [registration, setRegistration] = useState("");
  const [error, setError] = useState<string | null>(null);

  const originHits = useMemo(() => searchAirports(origin, 6), [origin]);
  const destHits = useMemo(() => searchAirports(dest, 6), [dest]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = parseFlightNumber(flightNumber);
    if (!parsed) {
      setError("Use a flight number like DL884 or BA286.");
      return;
    }
    if (origin.length !== 3 || dest.length !== 3) {
      setError("Origin and destination need IATA codes (3 letters).");
      return;
    }
    try {
      const payload = createManualFlight({
        flightNumber: parsed.airlineIata + parsed.number,
        airlineIata: parsed.airlineIata,
        originIata: origin,
        destIata: dest,
        departureLocal: departure,
        gate: gate || undefined,
        terminal: terminal || undefined,
        bookingCode: bookingCode || undefined,
        seat: seat || undefined,
        registration: registration || undefined,
      });
      const flight = addFlight(payload);
      router.push(`/flight/${flight.id}`);
    } catch {
      setError("Could not create that flight. Check the departure time.");
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-4 rounded-3xl p-6">
      <Field label="Flight number">
        <input
          value={flightNumber}
          onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
          placeholder="DL884"
          required
        />
        <p className="mt-1 text-[13px] text-[var(--text-3)]">
          Airline auto-detected
          {parseFlightNumber(flightNumber)
            ? ` · ${
                AIRLINES.find((a) => a.iata === parseFlightNumber(flightNumber)?.airlineIata)
                  ?.name ?? parseFlightNumber(flightNumber)?.airlineIata
              }`
            : ""}
        </p>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Origin (IATA)">
          <input
            value={origin}
            onChange={(e) => setOrigin(e.target.value.toUpperCase())}
            list="origin-list"
            maxLength={3}
            required
          />
          <datalist id="origin-list">
            {originHits.map((a) => (
              <option key={a.iata} value={a.iata}>
                {a.city} · {a.name}
              </option>
            ))}
          </datalist>
        </Field>
        <Field label="Destination (IATA)">
          <input
            value={dest}
            onChange={(e) => setDest(e.target.value.toUpperCase())}
            list="dest-list"
            maxLength={3}
            required
          />
          <datalist id="dest-list">
            {destHits.map((a) => (
              <option key={a.iata} value={a.iata}>
                {a.city} · {a.name}
              </option>
            ))}
          </datalist>
        </Field>
      </div>

      <Field label="Scheduled departure (local)">
        <input
          type="datetime-local"
          value={departure}
          onChange={(e) => setDeparture(e.target.value)}
          required
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Terminal">
          <input value={terminal} onChange={(e) => setTerminal(e.target.value)} />
        </Field>
        <Field label="Gate">
          <input value={gate} onChange={(e) => setGate(e.target.value)} />
        </Field>
        <Field label="Booking code">
          <input
            value={bookingCode}
            onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
          />
        </Field>
        <Field label="Seat">
          <input value={seat} onChange={(e) => setSeat(e.target.value.toUpperCase())} />
        </Field>
      </div>

      <Field label="Tail number (for Where’s My Plane)">
        <input
          value={registration}
          onChange={(e) => setRegistration(e.target.value.toUpperCase())}
          placeholder="N378DN"
        />
      </Field>

      {error && <p className="text-sm text-[var(--cancelled)]">{error}</p>}

      <button type="submit" className="btn btn-primary w-full sm:w-auto">
        Track flight · Pro unlocked
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-[var(--text-2)]">{label}</span>
      {children}
    </label>
  );
}
