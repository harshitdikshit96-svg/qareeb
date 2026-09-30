# Qareeb — Android TWA (Play Store)

Canonical domain: **www.qareebsalah.com**
Package: **com.qareeb.twa**

## What's already done

- **Signing keystore**: `twa/android-release.keystore` (PKCS12, alias `qareeb`).
  Password is in `twa/KEYSTORE_CREDENTIALS.txt` — **back both up outside git
  immediately**. Losing this means you can never publish an update to this
  app listing again.
- **SHA-256 cert fingerprint**: `71:1E:16:A3:D5:F8:A1:35:5F:A8:E8:5A:1C:16:84:09:C4:A2:E1:22:A2:EA:F7:17:42:72:53:A1:34:EA:A9:A4`
- **Digital Asset Links**: served from `src/app/.well-known/assetlinks.json/route.ts`
  (a route handler, not a static file — the static version 404'd on your
  host/CDN, which is common: many hosts block any `/.`-prefixed path by
  default to keep `.git`/`.env` unreachable, and `.well-known` sometimes
  gets caught in that net). Points at package `com.qareeb.twa` with the
  fingerprint above. Once redeployed, confirm it loads at
  `https://www.qareebsalah.com/.well-known/assetlinks.json` before running
  Bubblewrap — that's what lets the Android app hide Chrome's URL bar.
- **Privacy policy page**: `/privacy` on the site (linked in the footer) —
  required by Play Console. Swap the contact email in
  `src/app/privacy/page.tsx` if you'd rather use a project address than your
  personal one.
- **Play Store listing assets**: `twa/play-store-assets/icon-512.png` and
  `feature-graphic-1024x500.png`.

## Why this is ready but not run yet

The Bubblewrap build step needs to run from your own Terminal, not through
me — every network path available to me in this session (the cloud sandbox
and the Cowork device shell) is on a restricted egress allowlist that blocks
arbitrary domains, including `google.com`/`dl.google.com` (which Bubblewrap
needs to download the Android SDK/build tools). Everything below is queued
up and ready — run it once you've confirmed assetlinks.json is reachable.

## What you run, from your own Terminal

1. After redeploying, confirm both of these return `200 OK`:
   ```bash
   curl -I https://www.qareebsalah.com/manifest.webmanifest
   curl -I https://www.qareebsalah.com/.well-known/assetlinks.json
   ```

2. From the project root:
   ```bash
   npx @bubblewrap/cli init --manifest=https://www.qareebsalah.com/manifest.webmanifest
   ```
   It'll ask a series of questions — answer:
   - **Package name**: `com.qareeb.twa`
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

## Bubblewrap `init` — every prompt, and what to answer

Run this from inside the `twa/` folder (so the keystore path below is just
`./android-release.keystore`, no need to type a full path):

```bash
cd twa
npx @bubblewrap/cli init --manifest=https://www.qareebsalah.com/manifest.webmanifest
```

It reads most of this straight from your live manifest, but confirm each
one matches:

- **Domain being opened**: `www.qareebsalah.com` — confirm, don't change.
- **Application name**: `Qareeb` (pulled from the manifest `name` field —
  it may show the longer "Qareeb — Find Nearby Masjids"; either is fine,
  shorter reads better on Play Store).
- **Short name / launcher name**: `Qareeb`.
- **Application ID (package name)**: it will auto-suggest something like
  `com.qareebsalah.twa` based on the domain — **overwrite this with
  `com.qareeb.twa`** exactly. This can never change after your first Play
  Store publish, so double check it here.
- **Display mode**: `standalone` (default — keep it).
- **Orientation**: `portrait` (default — keep it).
- **Theme color**: `#123832` (should auto-fill from the manifest).
- **Navigation bar color** / **navigation bar divider color**: accept the
  defaults it suggests (usually the theme color) — not worth customizing.
- **Splash screen background color**: `#f7f5f0` (should auto-fill).
- **Splash screen fade-out duration**: accept the default (300ms).
- **Icon URL**: should auto-pick `/icons/icon-512.png` — confirm.
- **Maskable icon URL**: should auto-pick `/icons/icon-maskable-512.png` —
  confirm.
- **Monochrome icon URL** (Android 13+ themed icon, optional): leave blank /
  press enter to skip — we don't have one, not required.
- **Shortcuts**: none defined in the manifest, so it should show nothing to
  configure here.
- **Enable notifications**: answer **No** — the site doesn't send web push
  yet.
- **Enable Play Billing**: answer **No** — not used.
- **Signing key**: it'll ask for a path — enter
  `./android-release.keystore` (already sitting right there in this
  folder) and alias `qareeb`.
  - "Use this existing key?" → **Yes**.
  - **Key password** / **Keystore password**: both are the same value,
    from `twa/KEYSTORE_CREDENTIALS.txt` on your machine — open that file
    and copy it in when prompted (not repeating it here since it's a
    credential).
- **App version code**: `1` (default — keep for the first release; bump by
  1 on every future rebuild).
- **App version name**: `1.0.0` (default is fine, or match whatever
  versioning you want to show users).
- **Minimum SDK version**: accept the default (`21`) unless you have a
  reason to raise it.
- **Enable the "Site Settings" shortcut** (lets users manage site
  permissions from the app's long-press menu): answer **Yes** (default) —
  harmless and occasionally useful.
- **Fallback behavior** (what happens if Chrome/Custom Tabs isn't
  available): accept the default, `customtabs`.

When it finishes, it writes `twa-manifest.json` into the `twa/` folder —
that's the file `bubblewrap build` reads next, so just run `npx
@bubblewrap/cli build` from the same directory afterward.

## Still needed from you

1. **Redeploy**, then confirm step 1 above returns `200 OK` for both URLs.
   If assetlinks.json still 404s after redeploying, the block is happening
   upstream of the app (a CDN/reverse proxy in front, e.g. Cloudflare) —
   check that dashboard for a firewall/WAF rule on `/.` paths and add an
   exception for `/.well-known/*`.
2. **A Google Play Console account** ($25 one-time fee, your own identity
   verification): https://play.google.com/console/signup
3. **2–4 phone screenshots** of the live app for the store listing.
4. Worth doing at some point (not a blocker): `qareebsalah.com` (no `www`)
   currently serves the same content with no redirect to the canonical
   `www.qareebsalah.com`. Fine for now, but a 301 redirect from apex → www
   is good practice for SEO.

## Reminder: minimum functionality

Play Store occasionally flags TWAs that feel like "just a wrapped website."
Qareeb should clear this fine — it's a real installable PWA with offline
handling, geolocation-based sorting, bookmarks, and an install prompt — but
if the first submission gets flagged, it's usually resolved by resubmitting
with a note pointing at those features.
