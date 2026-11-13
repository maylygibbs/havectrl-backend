import { BadRequestException } from '@nestjs/common';

export type FlightLogCrewInput = {
  workerId?: string;
  functionCode?: string;
  countsAsFlight?: boolean;
};

export type FlightLogInput = {
  blockMinutes?: number;
  flightMinutes?: number;
  cycles?: number;
  pilotName?: string;
  reviewStatus?: string;
  notes?: string;
  crew?: FlightLogCrewInput[];
};

export function normalizeFlightLog(body: FlightLogInput, requireAll: boolean) {
  const blockMinutes = body.blockMinutes != null ? Number(body.blockMinutes) : undefined;
  const flightMinutes = body.flightMinutes != null ? Number(body.flightMinutes) : undefined;
  const cycles = body.cycles != null ? Number(body.cycles) : undefined;
  const pilotName = body.pilotName?.trim();
  const reviewStatus = body.reviewStatus?.trim() || 'pending';
  const notes = body.notes?.trim() ?? '';

  if (requireAll) {
    if (
      blockMinutes == null ||
      flightMinutes == null ||
      cycles == null ||
      !pilotName
    ) {
      throw new BadRequestException('blockMinutes, flightMinutes, cycles and pilotName are required');
    }
  }

  for (const [label, value] of [
    ['blockMinutes', blockMinutes],
    ['flightMinutes', flightMinutes],
    ['cycles', cycles],
  ] as const) {
    if (value != null && (!Number.isFinite(value) || value < 0)) {
      throw new BadRequestException(`${label} must be a non-negative number`);
    }
  }

  return {
    blockMinutes: blockMinutes ?? 0,
    flightMinutes: flightMinutes ?? 0,
    cycles: cycles ?? 0,
    pilotName: pilotName ?? '',
    reviewStatus,
    notes,
    crew: Array.isArray(body.crew) ? body.crew : [],
  };
}
