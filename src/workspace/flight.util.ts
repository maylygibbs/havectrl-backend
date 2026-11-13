import { BadRequestException } from '@nestjs/common';

export type FlightInput = {
  code?: string;
  aircraftId?: string;
  flightDate?: string;
  origin?: string;
  destination?: string;
  status?: string;
  eobt?: string;
};

export function normalizeFlight(body: FlightInput, requireAll: boolean) {
  const code = body.code?.trim().toUpperCase();
  const aircraftId = body.aircraftId?.trim();
  const flightDate = body.flightDate?.trim();
  const origin = body.origin?.trim().toUpperCase();
  const destination = body.destination?.trim().toUpperCase();
  const status = body.status?.trim() || 'planned';
  const eobt = body.eobt?.trim() || '0800';
  if (requireAll) {
    if (!code || !aircraftId || !flightDate || !origin || !destination) {
      throw new BadRequestException('code, aircraftId, flightDate, origin and destination are required');
    }
  }
  return { code, aircraftId, flightDate, origin, destination, status, eobt };
}
