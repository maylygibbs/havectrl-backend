import { BadRequestException } from '@nestjs/common';

const TECHNICAL = new Set(['unknown', 'in_service', 'in_maintenance']);

export type AircraftInput = {
  registration?: string;
  model?: string;
  serialNumber?: string;
  base?: string;
  technicalStatus?: string;
  airframeHours?: number | null;
  airframeCycles?: number | null;
};

function counter(value: number | null | undefined, label: string) {
  if (value === undefined) return undefined;
  if (value === null || value === ('' as unknown)) return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) throw new BadRequestException(`${label} must be zero or greater`);
  return number;
}

export function normalizeAircraft(body: AircraftInput, requireAll: boolean) {
  const registration = body.registration?.trim().toUpperCase();
  const model = body.model?.trim();
  const serialNumber = body.serialNumber?.trim();
  const base = body.base?.trim().toUpperCase();
  const technicalStatus = body.technicalStatus?.trim() || (requireAll ? 'unknown' : undefined);
  if (technicalStatus && !TECHNICAL.has(technicalStatus)) {
    throw new BadRequestException('Unknown technical status');
  }
  if (requireAll && (!registration || !model || !serialNumber || !base)) {
    throw new BadRequestException('registration, model, serialNumber and base are required');
  }
  const airframeHours = counter(body.airframeHours, 'airframeHours');
  const airframeCycles = counter(body.airframeCycles, 'airframeCycles');
  return {
    registration: registration || undefined,
    model: model || undefined,
    serialNumber: serialNumber || undefined,
    base: base || undefined,
    technicalStatus,
    airframeHours: airframeHours === undefined && requireAll ? null : airframeHours,
    airframeCycles: airframeCycles === undefined && requireAll ? null : airframeCycles,
  };
}
