import { Controller, Get } from '@nestjs/common';
import { ConfigRegistry } from './tenancy/config-registry';

@Controller()
export class HealthController {
  constructor(private readonly registry: ConfigRegistry) {}

  @Get('health')
  health() {
    return { status: 'ok', service: 'havectrl-backend', tenancy: 'hostname' };
  }

  @Get('ready')
  ready() {
    const tenants = this.registry.listTenants();
    if (!tenants.length) return { ready: false };
    return { ready: true, tenants: tenants.map((tenant) => tenant.slug) };
  }
}
