import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { centralEnv } from '../db/env';
import { hostnameFromHeaders } from './resolve-hostname';
import { TenantBranding, TenantInfo, TenantSlug } from './tenants';

type DomainCfg = {
  slug?: string;
  name?: string;
  status?: string;
  db?: {
    connection?: {
      host?: string;
      port?: number;
      user?: string;
      password?: string;
      database?: string;
    };
  };
};

@Injectable()
export class ConfigRegistry implements OnModuleInit {
  private central: Pool | null = null;
  private byHost = new Map<string, TenantInfo>();
  private bySlug = new Map<string, TenantInfo>();
  private pools = new Map<string, Pool>();

  async onModuleInit() {
    await this.init();
  }

  async init() {
    const env = centralEnv();
    this.central = new Pool(env);
    const { rows } = await this.central.query<{
      config_data: {
        contextModules?: { domains?: Record<string, DomainCfg> };
        domains?: Record<string, DomainCfg>;
      };
    }>(`SELECT config_data FROM configs WHERE config_name = 'default' AND is_active = true LIMIT 1`);
    const row = rows[0];
    if (!row) {
      throw new Error('havectrl_central no tiene configs.default. Corre: npm run db:setup');
    }
    this.byHost.clear();
    this.bySlug.clear();
    const domains = row.config_data?.contextModules?.domains ?? row.config_data?.domains ?? {};
    for (const [hostname, cfg] of Object.entries(domains)) {
      const conn = cfg.db?.connection ?? {};
      const info: TenantInfo = {
        slug: cfg.slug ?? hostname.split('.')[0],
        name: cfg.name ?? cfg.slug ?? hostname,
        status: cfg.status ?? 'active',
        hostnames: [hostname.toLowerCase()],
        database: conn.database ?? '',
        dbHost: conn.host ?? env.host,
        dbPort: Number(conn.port ?? env.port),
        dbUser: conn.user ?? env.user,
        dbPassword: conn.password ?? env.password,
      };
      this.byHost.set(hostname.toLowerCase(), info);
      const prev = this.bySlug.get(info.slug);
      if (prev) prev.hostnames.push(hostname.toLowerCase());
      else this.bySlug.set(info.slug, info);
    }
  }

  resolveHostname(hostname?: string | null): TenantInfo | null {
    if (!hostname) return null;
    return this.byHost.get(hostname.split(':')[0].toLowerCase()) ?? null;
  }

  resolveRequest(headers: Record<string, unknown>): TenantInfo | null {
    return this.resolveHostname(hostnameFromHeaders(headers));
  }

  listTenants(): TenantInfo[] {
    return [...this.bySlug.values()];
  }

  getTenant(slug: TenantSlug): TenantInfo {
    const tenant = this.bySlug.get(slug);
    if (!tenant) throw new Error(`tenant desconocido: ${slug}`);
    return tenant;
  }

  getPool(slug: TenantSlug): Pool {
    const existing = this.pools.get(slug);
    if (existing) return existing;
    const tenant = this.getTenant(slug);
    const pool = new Pool({
      host: tenant.dbHost,
      port: tenant.dbPort,
      user: tenant.dbUser,
      password: tenant.dbPassword,
      database: tenant.database,
    });
    this.pools.set(slug, pool);
    return pool;
  }

  async withTenant<T>(slug: TenantSlug, fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getPool(slug).connect();
    try {
      return await fn(client);
    } finally {
      client.release();
    }
  }

  async branding(slug: TenantSlug): Promise<TenantBranding | null> {
    return this.withTenant(slug, async (db) => {
      const { rows } = await db.query<{
        display_name: string;
        tagline: string;
        logo_mark: string;
        logo_url: string | null;
        primary_color: string;
        accent_color: string;
      }>(
        `SELECT display_name, tagline, logo_mark, logo_url, primary_color, accent_color
         FROM branding WHERE id = true LIMIT 1`,
      );
      const row = rows[0];
      if (!row) return null;
      return {
        displayName: row.display_name,
        tagline: row.tagline,
        logoMark: row.logo_mark,
        logoUrl: row.logo_url,
        primaryColor: row.primary_color,
        accentColor: row.accent_color,
      };
    });
  }
}
