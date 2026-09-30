# Qareeb — Android TWA (Play Store)

Domain: **qareebsalah.in**
Package: **in.qareeb.twa**

## What's already done

- **Signing keystore**: `twa/android-release.keystore` (PKCS12, alias `qareeb`).
  Password is in `twa/KEYSTORE_CREDENTIALS.txt` — **back both up outside git
  immediately**. Losing this means you can never publish an update to this
  app listing again.
- **SHA-256 cert fingerprint**: `71:1E:16:A3:D5:F8:A1:35:5F:A8:E8:5A:1C:16:84:09:C4:A2:E1:22:A2:EA:F7:17:42:72:53:A1:34:EA:A9:A4`
- **Digital Asset Links** file is live at `public/.well-known/assetlinks.json`,
  pointing at package `in.qareeb.twa` with the fingerprint above. Once
  deployed, this needs to be reachable at
  `https://qareebsalah.in/.well-known/assetlinks.json` — that's what lets
  the Android app hide Chrome's URL bar. Check it loads in a browser before
  building the app.
- **Privacy policy page**: `/privacy` on the site (linked in the footer) —
  required by Play Console. Swap the contact email in
  `src/app/privacy/page.tsx` if you'd rather use a project address than your
  personal one.
- **Play Store listing assets**: `twa/play-store-assets/icon-512.png` and
  `feature-graphic-1024x500.png`.

## Why this is ready but not run yet

`qareebsalah.in` isn't reachable yet (not deployed/live), so Bubblewrap has
nothing to fetch a manifest from — that part just waits until you deploy.
Separately, even once it's live, the actual build step needs to happen from
your own Terminal rather than through me: every network path available to
me in this session (the cloud sandbox and the Cowork device shell) is on a
restricted egress allowlist that blocks arbitrary domains, including this
one and even `google.com`/`dl.google.com` (which Bubblewrap needs to
download the Android SDK/build tools). So everything below is queued up and
ready — run it once the site is live.

## What you run, from your own Terminal

1. First, confirm the site is actually live:
   ```bash
   curl -I https://qareebsalah.in/manifest.webmanifest
   curl -I https://qareebsalah.in/.well-known/assetlinks.json
   ```
   Both should return `200 OK`. If either 404s, the deploy isn't finished
   propagating yet — wait and retry before continuing.

2. From the project root:
   ```bash
   npx @bubblewrap/cli init --manifest=https://qareebsalah.in/manifest.webmanifest
   ```
   It'll ask a series of questions — answer:
   - **Package name**: `in.qareeb.twa`
   - **App name / Launcher name**: `Qareeb`
   - **Signing key**: point it at `twa/android-release.keystore`, alias
     `qareeb`, using the password from `twa/KEYSTORE_CREDENTIALS.txt`
   - Everything else (theme color, icons, start URL) it should read
     correctly from your live manifest — just confirm the defaults.

   This downloads its own JDK/Android SDK on first run (a few hundred MB),
   then writes `twa-manifest.json` into whatever directory you ran it from.

3. Build the signed app bundle:
   ```bash
   npx @bubblewrap/cli build
   ```
   Produces `app-release-signed.aab` — the exact file you upload to Play
   Console.

4. Verify Digital Asset Links resolved correctly before submitting: install
   the `.aab` (or a locally built `.apk`) on a real device or emulator and
   confirm it opens full-screen with **no browser URL bar**. If the URL bar
   shows, the asset links file isn't being read correctly yet — double check
   step 1.

## Still needed from you

1. **Deploy the site to qareebsalah.in**, then run step 1 above to confirm
   `/manifest.webmanifest` and `/.well-known/assetlinks.json` both return
   `200 OK` before running Bubblewrap.
2. **A Google Play Console account** ($25 one-time fee, your own identity
   verification): https://play.google.com/console/signup
3. **2–4 phone screenshots** of the live app for the store listing.

## Reminder: minimum functionality

Play Store occasionally flags TWAs that feel like "just a wrapped website."
Qareeb should clear this fine — it's a real installable PWA with offline
handling, geolocation-based sorting, bookmarks, and an install prompt — but
if the first submission gets flagged, it's usually resolved by resubmitting
with a note pointing at those features.
