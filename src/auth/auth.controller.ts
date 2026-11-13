import { BadRequestException, Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ConfigRegistry } from '../tenancy/config-registry';
import { hostnameFromHeaders } from '../tenancy/resolve-hostname';
import { bindTenant, HaveRequest } from '../tenancy/tenant.middleware';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly registry: ConfigRegistry,
  ) {}

  @Get(['common/domain/config', 'tenancy/context'])
  async context(@Req() req: HaveRequest) {
    const hostname = hostnameFromHeaders((req.headers ?? {}) as Record<string, unknown>);
    const tenant = this.registry.resolveRequest((req.headers ?? {}) as Record<string, unknown>);
    if (!tenant) return { ok: false, hostname };
    const branding = await this.registry.branding(tenant.slug);
    return {
      ok: true,
      hostname,
      slug: tenant.slug,
      name: tenant.name,
      branding,
    };
  }

  @Post('auth/login')
  login(@Req() req: HaveRequest, @Body() body: { email?: string; password?: string }) {
    const tenant = bindTenant(req, this.registry);
    if (!tenant) throw new BadRequestException('Domain not registered');
    return this.auth.login(body.email ?? '', body.password ?? '', tenant.slug);
  }

  @Get('auth/me')
  @UseGuards(AuthGuard)
  async me(@Req() req: HaveRequest) {
    const slug = req.tenantSlug;
    const email = req.user?.sub;
    if (!slug || !email) throw new BadRequestException('Domain not registered');
    const session = await this.auth.me(slug, email);
    if (!session) throw new UnauthorizedException('Session expired');
    return session;
  }
}
