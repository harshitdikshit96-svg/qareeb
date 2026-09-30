// One-time reset for the analytics counters, run after tightening what
// counts as a real visit (24h visitor cookie, localhost/dev requests no
// longer recorded). There's no stored host column on past rows, so we
// can't selectively remove just the old dev-testing traffic — this
// clears everything so future numbers start from a clean, all-real-visitor
// baseline.
//
// Run from your own Terminal (not the Cowork sandbox, which can't reach
// Neon):
//   npm run analytics:reset
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

await sql`truncate table daily_stats`;
await sql`truncate table referrer_stats`;
await sql`truncate table device_stats`;
await sql`truncate table visitor_days`;
await sql`update masjids set view_count = 0`;

console.log("Analytics counters reset: daily_stats, referrer_stats, device_stats, visitor_days cleared; masjids.view_count zeroed.");
