// scripts/seed.mjs
// Creates the fabrica schema + tables and seeds realistic data.
// Run: node scripts/seed.mjs  (requires DATABASE_URL in env or .env.local)

import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

function loadEnv() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.trim().match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {
    /* no .env.local */
  }
}

loadEnv();

const sql = neon(process.env.DATABASE_URL);

const EVAL_SETS = [
  [128, 41, 0.68, 0.62],
  [240, 66, 0.72, 0.71],
  [512, 120, 0.81, 0.74],
  [96, 30, 0.65, 0.58],
];

const LOG_ENTRIES = [
  ["cuál es mi saldo", "saldo"],
  ["cuál es mi saldo hoy", "saldo"],
  ["dame mi saldo", "saldo"],
  ["quiero pagar mi tarjeta", "pago"],
  ["realizar un pago", "pago"],
  ["reporto cargo no reconocido", "disputa"],
  ["reporto cargo no reconocido hoy", "disputa"],
  ["quiero bloquear mi tarjeta", "bloqueo"],
  ["bloquear tarjeta robada", "bloqueo"],
  ["activa mi tarjeta nueva", "activacion"],
];

async function main() {
  await sql`CREATE SCHEMA IF NOT EXISTS fabrica`;
  await sql`DROP TABLE IF EXISTS fabrica.log_entries`;
  await sql`DROP TABLE IF EXISTS fabrica.eval_sets`;

  await sql`
    CREATE TABLE fabrica.eval_sets (
      id serial PRIMARY KEY,
      logs_count integer NOT NULL,
      eval_size integer NOT NULL,
      coverage numeric NOT NULL,
      dedupe_rate numeric NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
  await sql`
    CREATE TABLE fabrica.log_entries (
      id serial PRIMARY KEY,
      query text NOT NULL,
      intent text NOT NULL
    )`;

  for (const [logsCount, evalSize, coverage, dedupeRate] of EVAL_SETS) {
    await sql`INSERT INTO fabrica.eval_sets (logs_count, eval_size, coverage, dedupe_rate) VALUES (${logsCount}, ${evalSize}, ${coverage}, ${dedupeRate})`;
  }
  for (const [query, intent] of LOG_ENTRIES) {
    await sql`INSERT INTO fabrica.log_entries (query, intent) VALUES (${query}, ${intent})`;
  }

  const [{ e }] = await sql`SELECT count(*)::int AS e FROM fabrica.eval_sets`;
  const [{ l }] = await sql`SELECT count(*)::int AS l FROM fabrica.log_entries`;
  console.log(`Seeded fabrica schema: ${e} eval sets, ${l} log entries`);
}

main().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
