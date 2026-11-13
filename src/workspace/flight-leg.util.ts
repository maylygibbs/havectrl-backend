import { BadRequestException } from '@nestjs/common';

export type FlightLegInput = {
  origin?: string;
  destination?: string;
  sequence?: number;
  eet?: string;
};

export function normalizeFlightLeg(body: FlightLegInput, requireAll: boolean) {
  const origin = body.origin?.trim().toUpperCase();
  const destination = body.destination?.trim().toUpperCase();
  const eet = body.eet?.trim() || null;
  const sequence = body.sequence != null ? Number(body.sequence) : undefined;

  if (requireAll && (!origin || !destination)) {
    throw new BadRequestException('origin and destination are required');
  }
  if (origin && origin.length > 4) throw new BadRequestException('origin must be at most 4 characters');
  if (destination && destination.length > 4) {
    throw new BadRequestException('destination must be at most 4 characters');
  }
  if (sequence != null && (!Number.isInteger(sequence) || sequence < 1)) {
    throw new BadRequestException('sequence must be a positive integer');
  }

  return { origin: origin ?? '', destination: destination ?? '', eet, sequence };
}
