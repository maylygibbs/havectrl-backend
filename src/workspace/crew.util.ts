import { BadRequestException } from '@nestjs/common';

export type CrewInput = {
  employeeCode?: string;
  fullName?: string;
  position?: string;
  base?: string;
  status?: string;
  licenseNumber?: string | null;
  licenseExpires?: string | null;
  medicalExpires?: string | null;
};

export function normalizeCrew(body: CrewInput, requireAll: boolean) {
  const employeeCode = body.employeeCode?.trim();
  const fullName = body.fullName?.trim();
  const position = body.position?.trim();
  const base = body.base?.trim();
  const status = body.status?.trim() || 'active';
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
