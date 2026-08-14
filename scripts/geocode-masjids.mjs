#!/usr/bin/env node
// One-off/rerunnable geocoding pass for data/masjids.json.
//
// Primary source: OpenStreetMap Nominatim (free, no key). Results are cached in
// data/geocode-cache.json (keyed by masjid id) so re-runs don't re-hit the API —
// this cache is also the seam for slotting in a paid Google Places lookup later
// without re-paying for masjids OSM already resolved.
//
// Nominatim usage policy requires: max 1 req/sec, a descriptive User-Agent, and
// no bulk scraping — this script respects all three (see SLEEP_MS below).
//
// Usage: node scripts/geocode-masjids.mjs

import { readFileSync, writeFileSync } from "fs";
import path from "path";

const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, "data", "masjids.json");
const CACHE_PATH = path.join(ROOT, "data", "geocode-cache.json");
const CANDIDATES_PATH = path.join(ROOT, "data", "osm-mosque-candidates.json");

const USER_AGENT = "Qareeb-MasjidFinder/0.1 (+mailto:dixitharshit00z@gmail.com)";
const SLEEP_MS = 1100; // Nominatim: max 1 request/second

const WORSHIP_TYPES = new Set(["place_of_worship", "mosque"]);

function loadJson(filePath, fallback) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function nominatimSearch(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
    query
  )}&countrycodes=in&limit=5&addressdetails=1`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Nominatim ${res.status} for "${query}"`);
  return res.json();
}

function pickConfidentWorshipMatch(results) {
  return (
    results.find(
      (r) => r.category === "amenity" && WORSHIP_TYPES.has(r.type)
    ) ?? null
  );
}

async function geocodeMasjid(masjid) {
  const attempts = [`${masjid.name}, ${masjid.address}`, masjid.address];

  for (const query of attempts) {
    const results = await nominatimSearch(query);
    await sleep(SLEEP_MS);
    const hit = pickConfidentWorshipMatch(results);
    if (hit) {
      return {
        query,
        source: "nominatim",
        found: true,
        confident: true,
        lat: parseFloat(hit.lat),
        lng: parseFloat(hit.lon),
        displayName: hit.display_name,
        osmId: `${hit.osm_type}/${hit.osm_id}`,
        fetchedAt: new Date().toISOString(),
      };
    }
  }

  return {
    query: attempts[0],
    source: "nominatim",
    found: false,
    confident: false,
    lat: null,
    lng: null,
    displayName: null,
    osmId: null,
    fetchedAt: new Date().toISOString(),
    note: "No place_of_worship match in OSM for this name/address — needs a manual pin or a Google Places lookup.",
  };
}

async function overpassMosqueCandidates(masjids) {
  const lats = masjids.map((m) => m.lat).filter((v) => v != null);
  const lngs = masjids.map((m) => m.lng).filter((v) => v != null);
  if (!lats.length) return [];

  const pad = 0.01; // ~1.1km buffer
  const south = Math.min(...lats) - pad;
  const north = Math.max(...lats) + pad;
  const west = Math.min(...lngs) - pad;
  const east = Math.max(...lngs) + pad;

  const query = `[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="muslim"](${south},${west},${north},${east}););out body;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "User-Agent": USER_AGENT, "Content-Type": "text/plain" },
    body: query,
  });
  if (!res.ok) {
    console.warn(`Overpass request failed: ${res.status}`);
    return [];
  }
  const data = await res.json();
  return (data.elements ?? []).map((el) => ({
    osmId: `node/${el.id}`,
    lat: el.lat,
    lng: el.lon,
    name: el.tags?.name ?? null,
  }));
}

async function main() {
  const masjids = loadJson(DATA_PATH, []);
  const cache = loadJson(CACHE_PATH, {});

  for (const masjid of masjids) {
    if (cache[masjid.id]) {
      console.log(`cached   ${masjid.id}`);
      continue;
    }
    console.log(`querying ${masjid.id} — "${masjid.name}"`);
    try {
      cache[masjid.id] = await geocodeMasjid(masjid);
    } catch (err) {
      console.warn(`  error: ${err.message}`);
      cache[masjid.id] = {
        query: `${masjid.name}, ${masjid.address}`,
        source: "nominatim",
        found: false,
        confident: false,
        lat: null,
        lng: null,
        error: err.message,
        fetchedAt: new Date().toISOString(),
      };
    }
    writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n");
  }

  const updated = masjids.map((masjid) => {
    const hit = cache[masjid.id];
    if (hit?.found && hit.confident && hit.lat != null && hit.lng != null) {
      return {
        ...masjid,
        lat: hit.lat,
        lng: hit.lng,
        geoPrecision: "building",
        geoSource: "osm",
      };
    }
    return masjid;
  });
  writeFileSync(DATA_PATH, JSON.stringify(updated, null, 2) + "\n");

  console.log("\nLooking for unmatched mosque nodes nearby (Overpass)...");
  const candidates = await overpassMosqueCandidates(masjids);
  writeFileSync(CANDIDATES_PATH, JSON.stringify(candidates, null, 2) + "\n");

  const resolved = updated.filter((m) => m.geoSource === "osm").length;
  console.log(
    `\nDone. ${resolved}/${masjids.length} masjids matched a confident OSM place_of_worship record.`
  );
  console.log(
    `${candidates.length} unnamed/unmatched mosque node(s) found nearby in OSM — see data/osm-mosque-candidates.json for manual review.`
  );
}

main();
