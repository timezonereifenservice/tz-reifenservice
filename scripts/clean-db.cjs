/**
 * Remove test/mock analytics events and leads from Supabase.
 * Keeps dashboard users (admin accounts).
 *
 * Usage: npm run db:clean
 */
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) throw new Error("Missing .env");
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

async function main() {
  loadEnv();
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) throw new Error("DATABASE_URL is required in .env");

  const pg = require("pg");
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const before = await client.query(`
    select
      (select count(*)::int from public.analytics_events) as analytics,
      (select count(*)::int from public.leads) as leads,
      (select count(*)::int from public.users) as users
  `);

  console.log("Before:", before.rows[0]);

  await client.query("delete from public.analytics_events");
  await client.query("delete from public.leads");

  const after = await client.query(`
    select
      (select count(*)::int from public.analytics_events) as analytics,
      (select count(*)::int from public.leads) as leads,
      (select count(*)::int from public.users) as users
  `);

  console.log("After:", after.rows[0]);
  console.log("Done — users table untouched (admin login preserved).");

  await client.end();
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
