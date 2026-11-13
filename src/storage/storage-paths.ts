import { mkdirSync } from 'node:fs';
import { dirname, join, normalize, posix, sep } from 'node:path';

/** Keys in Postgres always use `/` (portable), regardless of OS. */
export function normalizeStorageKey(key: string): string {
  return key.replace(/\\/g, '/');
}

export function storageRoot(): string {
  return process.env.STORAGE_ROOT ?? join(process.cwd(), 'storage');
}

export function tenantObjectPath(tenantSlug: string, fileId: string, originalName: string): string {
  const safeName = originalName.replace(/[^\w.\-()+ ]/g, '_').slice(0, 180) || 'file';
  return posix.join(tenantSlug, fileId, safeName);
}

export function storageKeyBelongsToTenant(tenantSlug: string, storageKey: string): boolean {
  const key = normalizeStorageKey(storageKey);
  return key === tenantSlug || key.startsWith(`${tenantSlug}/`);
}

export function absoluteStoragePath(relativeKey: string): string {
  const root = storageRoot();
  const parts = normalizeStorageKey(relativeKey).split('/').filter(Boolean);
  const joined = normalize(join(root, ...parts));
  if (!joined.startsWith(normalize(root + sep)) && joined !== normalize(root)) {
    throw new Error('Invalid storage path');
  }
  return joined;
}

export function ensureDirForFile(absolutePath: string) {
  mkdirSync(dirname(absolutePath), { recursive: true });
}
