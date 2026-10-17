#!/usr/bin/env node
import { randomBytes, scryptSync } from 'node:crypto';
import pg from 'pg';
import { seedDemo } from './demo-data.mjs';
import { centralEnv, loadEnv } from './env.mjs';
import { migrateAll } from './migrate.mjs';

loadEnv();

function hashPassword(plain) {
  const salt = randomBytes(16);
  const hash = scryptSync(plain, salt, 32);
  return `s2.${salt.toString('hex')}.${hash.toString('hex')}`;
}

const env = centralEnv();
const DEMO_PASSWORD = 'havectrl-demo';

const TENANTS = [
  {
    slug: 'demoa',
    name: 'Demo A',
    db: 'demoa',
    hostname: 'demoa.localhost',
    email: 'admin@demoa.local',
    userName: 'Admin Demo A',
    branding: {
      displayName: 'Demo A',
      tagline: 'Cliente de demostración A',
      logoMark: 'DA',
      primaryColor: '#0C4A3E',
      accentColor: '#B45309',
    },
  },
  {
    slug: 'demob',
    name: 'Demo B',
    db: 'demob',
    hostname: 'demob.localhost',
    email: 'admin@demob.local',
    userName: 'Admin Demo B',
    branding: {
      displayName: 'Demo B',
      tagline: 'Cliente de demostración B',
      logoMark: 'DB',
      primaryColor: '#1E3A5F',
      accentColor: '#9A3412',
    },
  },
];

const RETIRED_DATABASES = ['havectrl_norte', 'havectrl_sur'];

function domainEntry(tenant) {
  return {
    slug: tenant.slug,
    name: tenant.name,
    status: 'active',
    db: {
      connection: {
        host: env.host,
        port: env.port,
        user: env.user,
        password: env.password,
        database: tenant.db,
      },
    },
  };
}

async function upsertRegistry(client) {
  const current = await client.query(
    `SELECT config_data FROM configs WHERE config_name = 'default' LIMIT 1`,
  );
  const config = current.rows[0]?.config_data ?? { contextModules: { domains: {} } };
  config.contextModules ??= {};
  config.contextModules.domains = {};
  for (const tenant of TENANTS) {
    config.contextModules.domains[tenant.hostname] = domainEntry(tenant);
    await client.query(
      `INSERT INTO tenants (slug, name, status, hostname, db_name, db_host, db_port)
       VALUES ($1, $2, 'active', $3, $4, $5, $6)
       ON CONFLICT (slug) DO UPDATE
         SET name = EXCLUDED.name,
             hostname = EXCLUDED.hostname,
             db_name = EXCLUDED.db_name,
             db_host = EXCLUDED.db_host,
             db_port = EXCLUDED.db_port`,
      [tenant.slug, tenant.name, tenant.hostname, tenant.db, env.host, env.port],
    );
  }
  await client.query(`DELETE FROM tenants WHERE NOT (slug = ANY($1::text[]))`, [TENANTS.map((tenant) => tenant.slug)]);
  await client.query(
    `INSERT INTO configs (config_name, config_data, is_active)
     VALUES ('default', $1::jsonb, true)
     ON CONFLICT (config_name) DO UPDATE
       SET config_data = EXCLUDED.config_data,
           is_active = true,
           updated_at = now()`,
    [JSON.stringify(config)],
  );
}

async function seedTenant(tenant) {
  const client = new pg.Client({ ...env, database: tenant.db });
  await client.connect();
  try {
    const passwordHash = hashPassword(DEMO_PASSWORD);
    await client.query(
      `INSERT INTO identity.users (email, password_hash, name)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING`,
      [tenant.email, passwordHash, tenant.userName],
    );
    const brand = tenant.branding;
    await client.query(
      `INSERT INTO branding (id, display_name, tagline, logo_mark, primary_color, accent_color)
       VALUES (true, $1, $2, $3, $4, $5)
       ON CONFLICT (id) DO NOTHING`,
      [brand.displayName, brand.tagline, brand.logoMark, brand.primaryColor, brand.accentColor],
    );
    console.log(`${tenant.slug}: ${tenant.email} / ${DEMO_PASSWORD}`);
    await seedDemo(client, tenant.slug, passwordHash);
  } finally {
    await client.end();
  }
}

async function dropRetiredDatabases() {
  const admin = new pg.Client({ ...env, database: 'postgres' });
  await admin.connect();
  try {
    for (const name of RETIRED_DATABASES) {
      if (!/^[a-z][a-z0-9_]*$/.test(name)) continue;
      await admin.query(
        `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
        [name],
      );
      await admin.query(`DROP DATABASE IF EXISTS ${name}`);
      console.log(`retirada BD ${name}`);
    }
  } finally {
    await admin.end();
  }
}

async function main() {
  await migrateAll();
  const central = new pg.Client(env);
  await central.connect();
  try {
    await upsertRegistry(central);
  } finally {
    await central.end();
  }
  await migrateAll();
  for (const tenant of TENANTS) {
    await seedTenant(tenant);
  }
  await dropRetiredDatabases();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
