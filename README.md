# Flightly

A personal, local-first **Flighty-style** flight tracker with **Pro features unlocked** — no subscriptions, no paid APIs, no ads.

UI follows Flighty’s decoded iOS design language (deep black canvas `#0B0B0F`, Flighty Blue `#0A84FF`, on-time green / delay amber status chips, map-first Flights tab, bottom tab bar, Live Activity–style banner).

Independent project — not affiliated with Flighty, Inc.

## Features (all Pro, forever)

- **Flights** — map on top, Upcoming / Past segments, dense flight cards
- **Live Activity banner** — in-app progress strip for the active flight (web stand-in for Lock Screen widgets)
- **Delay predictions** — late-aircraft / ATC / weather style forecasts vs airline times
- **Where’s My Plane** — inbound progress + tail metadata
- **Live map** — OpenSky ADS-B when available, simulated track otherwise
- **Airport intelligence** — delay trends + ATC-style advisories
- **Connection assistant** — walk / security / buffer risk
- **Passport (Profile)** — unlimited history, miles, route map
- **Search / Add** — manual entry + ICS / CSV import
- **Share links** — tokenized live share pages
- **PWA** — install to home screen

## Free data

| Need | Source |
|------|--------|
| Live positions | [OpenSky Network](https://opensky-network.org/) (personal / non-commercial) |
| Weather | [Open-Meteo](https://open-meteo.com/) |
| Airports / airlines | Curated local catalog |
| Maps | CARTO dark tiles + Leaflet |
| Predictions | On-device heuristics |

Schedules, gates, and bags are manual / imported / demo-enriched (commercial schedule APIs cost money).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo trips load on first visit.

```bash
npm run build && npm start
npm run typecheck
```

## Host it (free)

Easiest free host for this Next.js app is **Vercel**:

1. Push this repo to GitHub (already done if you’re on the PR branch).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the repo.
3. Framework preset: **Next.js**. No env vars required.
4. Deploy. You’ll get a `*.vercel.app` URL — open it on your phone and **Add to Home Screen**.

Alternatives: Netlify, Cloudflare Pages (with Next adapter), or any Node host running `npm run build && npm start`.

Phone usage tips:

- Safari / Chrome → Share → **Add to Home Screen** for the PWA.
- The in-app **Live Activity banner** mirrors Flighty’s flight progress strip while the app is open.
- True iOS Lock Screen / Dynamic Island widgets and Watch complications need a native shell (e.g. free Capacitor wrapper later) — the web platform cannot draw system widgets without a paid Apple Developer account + native binary.

## Import

Use **Search** tab → file picker, or `samples/flights.ics`.

CSV headers: `flightNumber,origin,destination,departure`.

## Privacy

Trips stay in browser `localStorage` (`flightly-v1`). No account, analytics, or payments.

## Stack

Next.js · React 19 · TypeScript · Tailwind 4 · Zustand · Framer Motion · Leaflet · date-fns
