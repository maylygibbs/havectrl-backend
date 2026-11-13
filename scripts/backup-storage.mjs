#!/usr/bin/env node
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnv } from './env.mjs';

loadEnv();

const root = process.env.STORAGE_ROOT ?? join(process.cwd(), 'storage');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const dest = process.argv[2] ?? join(process.cwd(), 'backups', `storage-${stamp}`);

if (!existsSync(root)) {
  console.error(`No existe STORAGE_ROOT: ${root}`);
  process.exit(1);
}

mkdirSync(dest, { recursive: true });
cpSync(root, dest, { recursive: true });
console.log(`Copiado ${root} -> ${dest}`);
