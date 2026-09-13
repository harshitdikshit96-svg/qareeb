import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("FAIL: DATABASE_URL is not set.");
  process.exit(1);
}
const sql = neon(url);

let failures = 0;
function check(label, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"} - ${label}${detail ? ` (${detail})` : ""}`);
  if (!ok) failures++;
}

const rows = await sql`select * from masjids order by id`;
check("row count is 12", rows.length === 12, `got ${rows.length}`);

for (const r of rows) {
  const prefix = r.id;
  check(`${prefix}: has name`, !!r.name && r.name.trim().length > 0);
  check(`${prefix}: has lat/lng`, r.lat !== null && r.lng !== null);
  check(
    `${prefix}: lat/lng in Lucknow bounds`,
    r.lat > 26.7 && r.lat < 27.0 && r.lng > 80.7 && r.lng < 81.1,
    `${r.lat}, ${r.lng}`
  );
  check(`${prefix}: verified is true`, r.verified === true);
  const timingFields = ["fajr", "zohar", "asr", "maghrib", "isha", "jummah"];
  for (const f of timingFields) {
    const val = r[f];
    check(
      `${prefix}: ${f} is a real time (not TBD/empty)`,
      !!val && val.trim().length > 0 && val.trim().toUpperCase() !== "TBD",
      `value="${val}"`
    );
    if (val && val.trim().toUpperCase() !== "TBD") {
      const matches = /^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(val.trim());
      check(`${prefix}: ${f} matches "h:mm AM/PM" format`, matches, `value="${val}"`);
    }
  }
}

// Uniqueness of ids
const ids = rows.map((r) => r.id);
check("all ids unique", new Set(ids).size === ids.length);

console.log("\n" + (failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`));
process.exit(failures === 0 ? 0 : 1);
