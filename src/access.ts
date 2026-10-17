import { ForbiddenException } from '@nestjs/common';
import { HaveRequest } from './tenancy/tenant.middleware';

const MODULES: Record<string, string[]> = {
  admin: ['home', 'crew', 'aircraft', 'flights', 'operations', 'maintenance', 'sms', 'communication', 'library', 'settings'],
  piloto: ['home', 'crew', 'aircraft', 'flights', 'operations', 'sms', 'communication', 'library'],
  jefe_sms: ['home', 'crew', 'aircraft', 'sms', 'communication', 'library'],
  tecnico: ['home', 'crew', 'aircraft', 'flights', 'maintenance', 'sms', 'communication', 'library'],
  despachador: ['home', 'crew', 'aircraft', 'flights', 'operations', 'sms', 'communication', 'library'],
};

export function profileOf(req: HaveRequest): string {
  return req.user?.profile ?? '';
}

export function assertModule(req: HaveRequest, module: string) {
  const allowed = MODULES[profileOf(req)] ?? [];
  if (!allowed.includes(module)) throw new ForbiddenException('Sin acceso a este módulo');
}

export function canReadSmsFile(profile: string) {
  return profile === 'admin' || profile === 'jefe_sms';
}

export function modulesFor(profile: string) {
  return MODULES[profile] ?? [];
}
