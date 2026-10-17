#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import pg from 'pg';
import { centralEnv, loadEnv, rootDir } from './env.mjs';

loadEnv();

const root = rootDir();
const centralDir = join(root, 'migrations/central');
const tenantDir = join(root, 'migrations/tenant');

function assertDbName(name) {
  if (!/^[a-z][a-z0-9_]*$/.test(name)) {
    throw new Error(`nombre de BD inválido: ${name}`);
  }
}

async function ensureDatabase(name) {
  assertDbName(name);
  const env = centralEnv();
  const admin = new pg.Client({ ...env, database: 'postgres' });
  await admin.connect();
  try {
    const { rows } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [name]);
    if (!rows.length) {
      await admin.query(`CREATE DATABASE ${name}`);
      console.log(`creada BD ${name}`);
    }
  } finally {
    await admin.end();
  }
}

async function applyMigrations(database, dir) {
  assertDbName(database);
  const client = new pg.Client({ ...centralEnv(), database });
  await client.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      version text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    const { rows } = await client.query('SELECT version FROM schema_migrations');
    const done = new Set(rows.map((row) => row.version));
    const files = readdirSync(dir)
      .filter((file) => file.endsWith('.sql'))
      .sort();
    for (const file of files) {
      if (done.has(file)) continue;
      const sql = readFileSync(join(dir, file), 'utf8');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.log(`${database}: ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }
  } finally {
    await client.end();
  }
}

async function tenantDatabases() {
  const client = new pg.Client(centralEnv());
  await client.connect();
  try {
    const exists = await client.query(`SELECT to_regclass('public.configs') AS rel`);
    if (!exists.rows[0]?.rel) return [];
    const { rows } = await client.query(
      `SELECT config_data FROM configs WHERE config_name = 'default' AND is_active = true LIMIT 1`,
    );
    const domains = rows[0]?.config_data?.contextModules?.domains ?? {};
    const names = new Set();
    for (const cfg of Object.values(domains)) {
      const database = cfg?.db?.connection?.database;
      if (typeof database === 'string' && database) names.add(database);
    }
    return [...names];
  } finally {
    await client.end();
  }
}

export async function migrateAll() {
  const central = centralEnv().database;
  await ensureDatabase(central);
  await applyMigrations(central, centralDir);
  for (const database of await tenantDatabases()) {
    await ensureDatabase(database);
    await applyMigrations(database, tenantDir);
  }
}

const isDirect = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop() ?? '');
if (isDirect || process.argv[1]?.endsWith('migrate.mjs')) {
  migrateAll().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
