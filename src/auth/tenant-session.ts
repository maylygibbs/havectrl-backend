export class TenantSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantSessionError';
  }
}

/** ACC-01: JWT tenant must match the hostname tenant. */
export function assertTenantSession(payload: { tenantId?: string }, tenantSlug: string | null | undefined) {
  if (!tenantSlug) throw new TenantSessionError('Dominio no registrado');
  if (payload.tenantId !== tenantSlug) throw new TenantSessionError('Sesión de otro dominio');
}
