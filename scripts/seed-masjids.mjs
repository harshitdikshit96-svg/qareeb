import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(url);
const dataPath = path.join(__dirname, "..", "data", "masjids.json");
const masjids = JSON.parse(readFileSync(dataPath, "utf8"));

for (const m of masjids) {
  await sql`
    insert into masjids
      (id, name, area, address, city, lat, lng, geo_precision, verified, image_url,
       fajr, zohar, asr, maghrib, isha, jummah, last_updated)
    values
      (${m.id}, ${m.name}, ${m.area}, ${m.address}, ${m.city},
       ${m.lat}, ${m.lng}, ${m.geoPrecision}, ${m.verified}, ${null},
       ${m.timings.fajr}, ${m.timings.zohar}, ${m.timings.asr},
       ${m.timings.maghrib}, ${m.timings.isha}, ${m.timings.jummah},
       ${m.lastUpdated})
    on conflict (id) do update set
      name = excluded.name,
      area = excluded.area,
      address = excluded.address,
      city = excluded.city,
      lat = excluded.lat,
      lng = excluded.lng,
      geo_precision = excluded.geo_precision,
      verified = excluded.verified,
      fajr = excluded.fajr,
      zohar = excluded.zohar,
      asr = excluded.asr,
      maghrib = excluded.maghrib,
      isha = excluded.isha,
      jummah = excluded.jummah,
      last_updated = excluded.last_updated,
      updated_at = now()
  `;
  console.log("Seeded:", m.id);
}

console.log(`Done. Seeded ${masjids.length} masjids.`);
