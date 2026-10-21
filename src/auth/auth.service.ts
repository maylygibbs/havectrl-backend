import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { modulesFor } from '../access';
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
        preferred_language: string;
      }>(
        `SELECT u.email, u.password_hash, u.name, u.active, p.code AS profile,
                u.preferred_language
         FROM identity.users u
         LEFT JOIN identity.profiles p ON p.id = u.profile_id AND p.deleted_at IS NULL
         WHERE lower(u.email) = lower($1) AND u.deleted_at IS NULL
         LIMIT 1`,
        [email.trim()],
      );
      const user = userRes.rows[0];
      if (!user || !user.active || !verifyPassword(password, user.password_hash)) return null;
      return user;
    });

    if (!row) throw new UnauthorizedException('Invalid credentials');

    const profile = row.profile ?? '';
    const accessToken = this.jwt.sign({
      sub: row.email,
      tenantId: tenant.slug,
      name: row.name,
      profile,
    });
    const branding = await this.registry.branding(tenant.slug);
    return {
      accessToken,
      user: {
        email: row.email,
        name: row.name,
        profile,
        preferredLanguage: row.preferred_language || 'en',
      },
      modules: modulesFor(profile),
      tenant: { slug: tenant.slug, name: tenant.name, database: tenant.database },
      branding,
    };
  }

  async me(tenantSlug: TenantSlug, email: string) {
    const tenant = this.registry.getTenant(tenantSlug);
    const row = await this.registry.withTenant(tenantSlug, async (db) => {
      const userRes = await db.query<{
        email: string;
        name: string;
        active: boolean;
        profile: string | null;
        preferred_language: string;
      }>(
        `SELECT u.email, u.name, u.active, p.code AS profile, u.preferred_language
         FROM identity.users u
         LEFT JOIN identity.profiles p ON p.id = u.profile_id AND p.deleted_at IS NULL
         WHERE lower(u.email) = lower($1) AND u.deleted_at IS NULL
         LIMIT 1`,
        [email],
      );
      return userRes.rows[0] ?? null;
    });
    if (!row || !row.active) return null;
    const profile = row.profile ?? '';
    const branding = await this.registry.branding(tenant.slug);
    return {
      user: {
        email: row.email,
        name: row.name,
        profile,
        preferredLanguage: row.preferred_language || 'en',
      },
      modules: modulesFor(profile),
      tenant: { slug: tenant.slug, name: tenant.name, database: tenant.database },
      branding,
    };
  }
}
