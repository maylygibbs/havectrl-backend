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

export type ExistingAssignment = {
  activity: string;
  startsAt: string;
  endsAt: string;
};

function overlaps(start: number, end: number, otherStart: number, otherEnd: number) {
  return start < otherEnd && end > otherStart;
}

function isRestOrDayOff(activity: string) {
  const value = activity.toLowerCase();
  return value.includes('rest') || value.includes('day off') || value.includes('descanso') || value.includes('libre');
}

export function assertAssignmentAllowed(input: {
  activity: string;
  startsAt: string;
  endsAt: string;
  licenseExpires: string | null;
  flightCode: string | null;
  knownFlightCodes: string[];
  existing: ExistingAssignment[];
}) {
  const start = Date.parse(input.startsAt);
  const end = Date.parse(input.endsAt);
  const isFlight = /flight|duty/i.test(input.activity);
  if (isFlight && (!input.flightCode || !input.knownFlightCodes.includes(input.flightCode))) {
    throw new BadRequestException('Choose a flight that is already loaded');
  }
  if (input.licenseExpires) {
    const expiry = Date.parse(`${input.licenseExpires.slice(0, 10)}T23:59:59.999Z`);
    if (!Number.isNaN(expiry) && start > expiry) {
      throw new BadRequestException('The license is not valid for this assignment');
    }
  }
  for (const row of input.existing) {
    const otherStart = Date.parse(row.startsAt);
    const otherEnd = Date.parse(row.endsAt);
    if (Number.isNaN(otherStart) || Number.isNaN(otherEnd) || !overlaps(start, end, otherStart, otherEnd)) continue;
    if (isRestOrDayOff(row.activity)) {
      throw new BadRequestException('This interval falls on rest or a day off');
    }
    throw new BadRequestException('This person is already assigned in that interval');
  }
}
