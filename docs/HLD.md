# Qareeb — High-Level Design (MVP)

## 1. Problem
People don't know which nearby masjid's prayer (jamaat) timing fits their schedule. Timings differ masjid to masjid, and there's no single place to look them up. Qareeb is a central directory of masjids in an area (starting with Lucknow) showing location + jamaat timings, so a user can quickly find a masjid whose timing works for them right now.

## 2. MVP Scope
**In scope**
- Static website (Next.js) listing masjids with address, jamaat timings (5 daily + Jumu'ah), and distance from user.
- Browser geolocation (GPS) to sort/filter masjids by distance.
- Filter/search: by locality, by "open now" / upcoming prayer, by name.
- "Next prayer" banner per city (generic, not masjid-specific) similar to reference screenshot.
- "Get Directions" button → deep-links to Google Maps (no in-house map rendering needed for MVP).
- Masjid detail view: full timing table, address, map link.
- Data is static (JSON/config in repo), no database, no auth, no backend writes.

**Out of scope (later phases)**
- Native/PWA app layer, push notifications for azaan.
- Admin panel for masjid committees to self-update timings.
- User accounts, bookmarks persistence, reviews/ratings.
- Live prayer-time computation (astronomical calculation) — MVP uses masjid-provided fixed timings.
- Multi-city scale beyond Lucknow (structure should allow it, not build it).

## 3. Users
- Musafir/commuter/professional trying to catch a jamaat near their current location before time runs out.
- Someone new to an area looking for the nearest masjid.

## 4. Tech Stack
- **Framework:** Next.js (App Router), React, TypeScript.
- **Styling:** Tailwind CSS (fast to match the reference visual style — soft cards, rounded corners, green/teal accent).
- **Data:** Static JSON file(s) checked into repo (`data/masjids.json`), no DB for MVP. Structured so it can move to a DB/CMS later without changing the frontend contract.
- **Location:** Browser Geolocation API (`navigator.geolocation`) for user's lat/lng. Haversine formula (plain JS, no paid API) to compute distance to each masjid — avoids needing a billed Google Maps JS API key for MVP.
- **Directions:** No embedded map. "Get Directions" button opens `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>` in a new tab — free, no API key required.
- **Hosting:** Vercel (natural fit for Next.js, free tier fine for MVP).
- **Future app layer:** Same data layer reused by a React Native / Capacitor wrapper, or a proper backend API once masjid self-service editing is needed.

> Note: Google Maps JS/Places API is **not required** for MVP — it's a paid/metered API. Geolocation (free, browser-native) + Haversine distance + a Maps deep link covers "find nearby, get directions" without any API key or billing setup. We only need Maps API later if we want live traffic-aware ETAs, autocomplete search, or an embedded interactive map.

## 5. Data Model

```ts
type PrayerTimes = {
  fajr: string;    // "04:30 AM" — stored as display string for MVP
  zohar: string;
  asr: string;
  maghrib: string;
  isha: string;
  jummah: string;
};

type Masjid = {
  id: string;              // slug, e.g. "collectorshah-masjid"
  name: string;
  area: string;             // e.g. "Maulviganj"
  address: string;          // free text, as given
  city: string;             // "Lucknow"
  lat: number | null;       // TODO: needs geocoding, see Open Questions
  lng: number | null;
  timings: PrayerTimes;
  lastUpdated: string;      // ISO date, manual for MVP
};
```

All 9 supplied masjids will seed `data/masjids.json` in this shape.

## 6. Core Screens / Routes
- `/` — Home: greeting header, city selector (static list for MVP, default Lucknow), "Next Prayer" banner, search bar, "Nearby Masjids" horizontal list (uses geolocation if permitted, else falls back to full list unsorted), quick-links row (Qibla Finder, Dua & Azkar, Islamic Calendar, Events — stubbed/disabled in MVP, visually present per reference but marked "coming soon").
- `/masjids` — Full list with filters (area, distance, search).
- `/masjids/[id]` — Masjid detail: full timing table, address, "Get Directions" button.
- No `/bookmarks`, `/profile` functionality in MVP (nav item shown, disabled or simple local-storage bookmark for a lightweight win).

## 7. Location & Filtering Flow
1. On load, request `navigator.geolocation.getCurrentPosition`. If denied/unavailable, show masjid list unsorted (by area) with a prompt to enable location.
2. If granted, compute Haversine distance from user to each masjid's `lat/lng`, sort ascending, show "X.X km" badges as in the reference design.
3. Filter bar: by area/locality (derived from data), by name search, and a simple "prayer" filter (e.g. show masjids whose next jamaat is within next N minutes) — computed client-side from `timings` + current time.

## 8. Open Questions / Blockers
1. **Coordinates:** None of the 9 masjids have lat/lng yet. Addresses are informal (e.g. "Maulviganj", "Bhedi mandi maulviganj"). We need to geocode each — options: (a) manually pin on Google Maps and copy lat/lng, (b) use a free geocoding pass (Nominatim/OSM) as a best-effort, to be corrected by hand. **Recommend: you drop a pin for each masjid and share lat/lng, or I do a best-effort geocode from the addresses and you correct any that land wrong** — Maulviganj/Aminabad addresses are too informal to trust an automated geocoder blindly.
2. Timings are static text now (e.g. "4.30 am"); do we ever expect them to change seasonally (Fajr/Maghrib shift with sunrise/sunset)? If yes, `lastUpdated` + a manual refresh process is enough for MVP; no need for astronomical calculation yet.
3. City selector — MVP only has Lucknow data; keep the selector UI but effectively single-city for now.

## 9. Proposed Folder Structure
```
Qareeb/
  docs/
    HLD.md
  data/
    masjids.json
  src/
    app/
      page.tsx                 # Home
      masjids/page.tsx         # Full list
      masjids/[id]/page.tsx    # Detail
      layout.tsx
    components/
      NextPrayerBanner.tsx
      MasjidCard.tsx
      SearchFilterBar.tsx
      QuickLinks.tsx
      BottomNav.tsx
    lib/
      distance.ts              # haversine
      prayer.ts                # next-prayer-now logic
      types.ts
  public/
  package.json
  tailwind.config.ts
```

## 10. Roadmap After MVP
- Phase 2: Admin/CMS (even a simple Google Sheet → JSON sync, or lightweight backend) so masjid committees or a volunteer can update timings without a code deploy.
- Phase 3: App layer (PWA first — cheapest path to "installable app" — then native if needed), push notification for azaan/jamaat reminders.
- Phase 4: User accounts, bookmarks sync, reviews, multi-city expansion.
