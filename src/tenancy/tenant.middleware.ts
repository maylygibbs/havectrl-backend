import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ConfigRegistry } from './config-registry';
import { TenantSlug } from './tenants';

export type HaveRequest = FastifyRequest & {
  tenantSlug?: TenantSlug | null;
  user?: { sub?: string; tenantId?: string; name?: string; profile?: string };
};

export function bindTenant(req: HaveRequest, registry: ConfigRegistry) {
  const tenant = registry.resolveRequest((req.headers ?? {}) as Record<string, unknown>);
  req.tenantSlug = tenant?.slug ?? null;
  return tenant;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly registry: ConfigRegistry) {}

  use(req: HaveRequest, _res: FastifyReply, next: () => void) {
    bindTenant(req, this.registry);
    next();
  }
}
