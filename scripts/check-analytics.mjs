// Read-only analytics snapshot — run this from your own Terminal (not
// through the Cowork sandbox, which can't reach Neon):
//   npm run analytics:check
//
// Prints the last 10 days of daily_stats, the most recent referrer and
// device rows, the top masjids by view_count, and the visitor_days dedup
// table size, so you can sanity-check the numbers or spot anything that
// still looks off (e.g. a day with a lot of "direct" traffic and no
// device split, which usually means bot traffic slipping past the UA
// filter rather than real visitors).
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const [daily, referrers, devices, topMasjids, visitorDays] = await Promise.all([
  sql`select day::text, pageviews, unique_visitors from daily_stats order by day desc limit 10`,
  sql`select day::text, referrer_host, visits from referrer_stats order by day desc, visits desc limit 20`,
  sql`select day::text, device_type, visits from device_stats order by day desc limit 10`,
  sql`select id, name, view_count from masjids order by view_count desc limit 10`,
  sql`select count(*)::int as c from visitor_days`,
]);

console.log("--- daily_stats (last 10 days) ---");
console.table(daily);
console.log("--- referrer_stats (last 20 rows) ---");
console.table(referrers);
console.log("--- device_stats (last 10 rows) ---");
console.table(devices);
console.log("--- top masjids by view_count ---");
console.table(topMasjids);
console.log(`--- visitor_days dedup table: ${visitorDays[0].c} rows ---`);
