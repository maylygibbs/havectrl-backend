import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export function loadEnv() {
  const file = join(root, '.env');
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  }
}

export function centralEnv() {
  return {
    host: process.env.CENTRAL_DB_HOST ?? 'localhost',
    port: Number(process.env.CENTRAL_DB_PORT ?? 5432),
    user: process.env.CENTRAL_DB_USER ?? 'postgres',
    password: process.env.CENTRAL_DB_PASSWORD ?? '123456',
    database: process.env.CENTRAL_DB_NAME ?? 'havectrl_central',
  };
}

export function rootDir() {
  return root;
}
