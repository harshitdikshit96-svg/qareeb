import { neon } from "@neondatabase/serverless";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(url);

await sql.query(`
  create table if not exists schema_migrations (
    filename text primary key,
    applied_at timestamptz not null default now()
  )
`);

const migrationsDir = path.join(__dirname, "..", "db", "migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const appliedRows = await sql`select filename from schema_migrations`;
const applied = new Set(appliedRows.map((r) => r.filename));

let ranCount = 0;
for (const file of files) {
  if (applied.has(file)) {
    console.log(`Skipping (already applied): ${file}`);
    continue;
  }

  const migrationPath = path.join(migrationsDir, file);
  const migrationSql = readFileSync(migrationPath, "utf8");
  const statements = migrationSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Running migration: ${file} (${statements.length} statement(s))`);
  for (const statement of statements) {
    await sql.query(statement);
  }

  await sql`insert into schema_migrations (filename) values (${file})`;
  ranCount++;
}

console.log(
  ranCount > 0
    ? `Migration complete (${ranCount} new migration(s) applied).`
    : "Nothing to migrate — already up to date."
);
