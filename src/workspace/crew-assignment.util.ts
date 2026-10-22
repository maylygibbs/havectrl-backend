import { BadRequestException } from '@nestjs/common';

export type CrewAssignmentInput = {
  activity?: string;
  startsAt?: string;
  endsAt?: string;
  notes?: string;
  flightCode?: string;
  origin?: string;
  destination?: string;
  aircraftRegistration?: string;
};

export function normalizeCrewAssignment(body: CrewAssignmentInput) {
  const activity = body.activity?.trim() ?? '';
  const startsAt = body.startsAt?.trim() ?? '';
  const endsAt = body.endsAt?.trim() ?? '';
  const notes = body.notes?.trim() ?? '';
  const flightCode = body.flightCode?.trim().toUpperCase() || null;
  const origin = body.origin?.trim().toUpperCase() || null;
  const destination = body.destination?.trim().toUpperCase() || null;
  const aircraftRegistration = body.aircraftRegistration?.trim().toUpperCase() || null;

  if (!activity || !startsAt || !endsAt) {
    throw new BadRequestException('Activity, start and end are required');
  }

  const startMs = Date.parse(startsAt);
  const endMs = Date.parse(endsAt);
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
    throw new BadRequestException('Invalid start or end datetime');
  }
  if (endMs <= startMs) {
    throw new BadRequestException('End must be after start');
  }

  return { activity, startsAt, endsAt, notes, flightCode, origin, destination, aircraftRegistration };
}
