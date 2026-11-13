import { BadRequestException } from '@nestjs/common';

const CREW_TEAMS = new Set(['operations', 'maintenance', 'cabin']);

export type CrewInput = {
  employeeCode?: string;
  fullName?: string;
  position?: string;
  base?: string;
  status?: string;
  team?: string;
  email?: string | null;
  licenseNumber?: string | null;
  licenseExpires?: string | null;
  medicalExpires?: string | null;
};

export function normalizeCrew(body: CrewInput, requireAll: boolean) {
  const employeeCode = body.employeeCode?.trim();
  const fullName = body.fullName?.trim();
  const position = body.position?.trim();
  const base = body.base?.trim();
  const status = body.status?.trim() || (requireAll ? 'active' : undefined);
  const teamRaw = body.team?.trim().toLowerCase();
  if (teamRaw && !CREW_TEAMS.has(teamRaw)) throw new BadRequestException('Unknown team');
  const team = teamRaw || (requireAll ? 'operations' : undefined);
  if (requireAll) {
    if (!employeeCode || !fullName || !position || !base) {
      throw new BadRequestException('employeeCode, fullName, position and base are required');
    }
  }
  return {
    employeeCode: employeeCode || undefined,
    fullName: fullName || undefined,
    position: position || undefined,
    base: base || undefined,
    status: status || undefined,
    team,
    email: body.email === undefined ? undefined : body.email?.trim().toLowerCase() || null,
    licenseNumber: body.licenseNumber === undefined ? undefined : body.licenseNumber?.trim() || null,
    licenseExpires: body.licenseExpires === undefined ? undefined : body.licenseExpires || null,
    medicalExpires: body.medicalExpires === undefined ? undefined : body.medicalExpires || null,
  };
}

export function mapPgUnique(err: unknown, message: string): never {
  if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === '23505') {
    throw new BadRequestException(message);
  }
  throw err;
}
