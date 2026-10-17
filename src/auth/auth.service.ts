import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verifyPassword } from '../db/password';
import { ConfigRegistry } from '../tenancy/config-registry';
import { TenantSlug } from '../tenancy/tenants';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly registry: ConfigRegistry,
  ) {}

  async login(email: string, password: string, tenantSlug: TenantSlug) {
    const tenant = this.registry.getTenant(tenantSlug);
    const row = await this.registry.withTenant(tenantSlug, async (db) => {
      const userRes = await db.query<{
        email: string;
        password_hash: string;
        name: string;
        active: boolean;
        profile: string | null;
      }>(
        `SELECT u.email, u.password_hash, u.name, u.active, p.code AS profile
         FROM identity.users u
         LEFT JOIN identity.profiles p ON p.id = u.profile_id
         WHERE lower(u.email) = lower($1)
         LIMIT 1`,
        [email.trim()],
      );
      const user = userRes.rows[0];
      if (!user || !user.active || !verifyPassword(password, user.password_hash)) return null;
      return user;
    });

    if (!row) throw new UnauthorizedException('Credenciales inválidas');

    const accessToken = this.jwt.sign({
      sub: row.email,
      tenantId: tenant.slug,
      name: row.name,
      profile: row.profile ?? '',
    });
    const branding = await this.registry.branding(tenant.slug);
    return {
      accessToken,
      user: { email: row.email, name: row.name, profile: row.profile ?? '' },
      tenant: { slug: tenant.slug, name: tenant.name },
      branding,
    };
  }
}
