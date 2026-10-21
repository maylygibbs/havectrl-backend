import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigRegistry } from '../tenancy/config-registry';
import { assertTenantSession, TenantSessionError } from './tenant-session';
import { bindTenant, HaveRequest } from '../tenancy/tenant.middleware';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly registry: ConfigRegistry,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<HaveRequest>();
    const header = req.headers.authorization;
    if (typeof header !== 'string' || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Falta la sesión');
    }
    try {
      const payload = this.jwt.verify<{ sub?: string; tenantId?: string; name?: string; profile?: string }>(header.slice(7));
      bindTenant(req, this.registry);
      assertTenantSession(payload, req.tenantSlug);
      req.user = payload;
      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      if (err instanceof TenantSessionError) throw new UnauthorizedException(err.message);
      throw new UnauthorizedException('Sesión inválida');
    }
  }
}
