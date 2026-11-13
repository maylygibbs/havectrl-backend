import { describe, expect, it } from 'vitest';
import { assertTenantSession, TenantSessionError } from './tenant-session';

describe('ACC-01 tenant session binding', () => {
  it('accepts when JWT tenant matches hostname tenant', () => {
    expect(() => assertTenantSession({ tenantId: 'demoa' }, 'demoa')).not.toThrow();
  });

  it('rejects cross-tenant sessions', () => {
    expect(() => assertTenantSession({ tenantId: 'demoa' }, 'demob')).toThrow(TenantSessionError);
  });

  it('rejects when hostname tenant is unknown', () => {
    expect(() => assertTenantSession({ tenantId: 'demoa' }, null)).toThrow(TenantSessionError);
  });
});
