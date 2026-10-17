export type TenantSlug = string;

export interface TenantBranding {
  displayName: string;
  tagline: string;
  logoMark: string;
  logoUrl: string | null;
  primaryColor: string;
  accentColor: string;
}

export interface TenantInfo {
  slug: TenantSlug;
  name: string;
  status: string;
  hostnames: string[];
  database: string;
  dbHost: string;
  dbPort: number;
  dbUser: string;
  dbPassword: string;
}
