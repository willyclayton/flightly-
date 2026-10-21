# Flightly

Personal Flighty-style flight tracker — **Pro unlocked**, no paid APIs, no ads.

Not affiliated with Flighty, Inc.

## How to use it (Will)

### Option A — Host free on Vercel (best for your phone)

1. Merge or open [PR #1](https://github.com/willyclayton/flightly-/pull/1) so the code is on GitHub (`willyclayton/flightly-`).
2. Go to **[vercel.com/new](https://vercel.com/new)** → sign in with GitHub → import **`flightly-`**.
3. Leave defaults (Framework: Next.js). **No env vars.** Click **Deploy**.
4. Open the `*.vercel.app` URL on your iPhone.
5. Safari → **Share** → **Add to Home Screen**. You now have an app icon.
6. During a trip, open **Live** (home sheet button, or long-press the icon → Live shortcut) for a glanceable status screen.

Re-deploys happen automatically on every push to the connected branch.

### Option B — Run on your laptop

```bash
git clone https://github.com/willyclayton/flightly-.git
cd flightly-
git checkout cursor/flightly-personal-app-3bc9   # or main after merge
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Demo trips load on first visit.

### Option C — Other free hosts

- **Netlify** / **Cloudflare Pages** — works with a Next adapter; Vercel is simpler for App Router.
- Any VPS: `npm run build && npm start` on Node 20+.

## Phone widgets — what’s possible

| Want | This app |
|------|----------|
| Home Screen app icon | Yes — Add to Home Screen (PWA) |
| Glanceable “Live” screen during flight | Yes — `/live` |
| In-app Live Activity strip | Yes — My Flights sheet |
| iOS Lock Screen / Dynamic Island widgets | **No on web** — needs a native iOS app + paid Apple Developer account (~$99/yr) |
| Apple Watch complications | Same — native only |

Closest free setup today: **Vercel URL → Add to Home Screen → open Live before/during the flight.** Keep the phone unlocked on Live, or jump back from the home icon.

A later Capacitor/Swift wrapper could add real widgets; that’s a separate native project.

## Features

- My Flights map + bottom sheet (Flighty-like UI)
- Delay predictions, Where’s My Plane, airport ops, connection assistant
- Flight Log / Passport, ICS/CSV import, share links
- Free data: OpenSky, Open-Meteo, local airport catalog

## Privacy

Trips stay in your browser `localStorage` (`flightly-v1`). No account. No analytics.

**Note:** Clearing site data wipes trips. After you deploy, use the same browser/profile on your phone so data sticks.
