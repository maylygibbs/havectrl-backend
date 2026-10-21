import { describe, expect, it } from 'vitest';
import {
  absoluteStoragePath,
  storageKeyBelongsToTenant,
  tenantObjectPath,
} from './storage-paths';

describe('storage paths', () => {
  it('builds tenant-relative keys with forward slashes', () => {
    expect(tenantObjectPath('demoa', 'id-1', 'doc.pdf')).toBe('demoa/id-1/doc.pdf');
  });

  it('accepts legacy Windows-style keys for tenant checks', () => {
    expect(storageKeyBelongsToTenant('demoa', 'demoa\\id-1\\doc.pdf')).toBe(true);
  });

  it('rejects path traversal', () => {
    expect(() => absoluteStoragePath('../../etc/passwd')).toThrow('Invalid storage path');
  });
});
