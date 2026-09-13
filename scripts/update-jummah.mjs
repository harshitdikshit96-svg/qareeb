import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}
const sql = neon(url);

const ids = [
  "masjid-jamiyatul-qureysh",
  "mecca-masjid-barood-khana",
  "masjid-ali-bin-abi-talib",
];

for (const id of ids) {
  const rows = await sql`
    update masjids set jummah = '1:08 PM', updated_at = now()
    where id = ${id}
    returning id
  `;
  console.log(rows.length ? `Updated ${id}` : `NOT FOUND: ${id}`);
}
