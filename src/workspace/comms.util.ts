import { BadRequestException } from '@nestjs/common';

const MEETING_STATUSES = new Set(['draft', 'scheduled', 'cancelled']);
const MINUTES_STATUSES = new Set(['draft', 'recorded']);

export type MeetingInput = {
  title?: string;
  startsAt?: string;
  agenda?: string;
  status?: string;
  locationUrl?: string | null;
};

export type MinutesInput = {
  minutes?: string;
  minutesStatus?: string;
};

export function normalizeMeeting(body: MeetingInput) {
  const title = body.title?.trim() ?? '';
  const agenda = body.agenda?.trim() ?? '';
  const startsAt = body.startsAt?.trim() ?? '';
  const status = body.status?.trim().toLowerCase() || 'scheduled';
  if (!title || !agenda || !startsAt) throw new BadRequestException('title, startsAt and agenda are required');
  if (Number.isNaN(Date.parse(startsAt))) throw new BadRequestException('startsAt must be a date and time');
  if (!MEETING_STATUSES.has(status)) throw new BadRequestException('Unknown meeting status');
  return { title, agenda, startsAt, status, locationUrl: optionalUrl(body.locationUrl) };
}

export function normalizeMinutes(body: MinutesInput) {
  const minutes = body.minutes?.trim() ?? '';
  const minutesStatus = body.minutesStatus?.trim().toLowerCase() || 'draft';
  if (!MINUTES_STATUSES.has(minutesStatus)) throw new BadRequestException('Unknown minutes status');
  if (minutesStatus === 'recorded' && !minutes) throw new BadRequestException('Recorded minutes need text');
  return { minutes, minutesStatus };
}

function optionalUrl(value: string | null | undefined) {
  if (value == null || value.trim() === '') return null;
  const url = value.trim();
  if (!/^https?:\/\//i.test(url)) throw new BadRequestException('locationUrl must start with http:// or https://');
  return url;
}
