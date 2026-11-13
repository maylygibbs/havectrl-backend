import { BadRequestException } from '@nestjs/common';

const SEVERITIES = new Set(['low', 'medium', 'high']);
const STATUSES = new Set(['open', 'in_review', 'closed']);

export type SmsReportInput = {
  title?: string;
  narrative?: string;
  anonymous?: boolean;
  severity?: string;
};

export function normalizeSmsReport(body: SmsReportInput) {
  const title = body.title?.trim() ?? '';
  const narrative = body.narrative?.trim() ?? '';
  const severity = body.severity?.trim().toLowerCase() || 'medium';
  if (!title || !narrative) throw new BadRequestException('Title and narrative are required');
  if (!SEVERITIES.has(severity)) throw new BadRequestException('Unknown severity');
  return { title, narrative, anonymous: Boolean(body.anonymous), severity };
}

export function normalizeSmsStatus(status: string | undefined) {
  const value = status?.trim().toLowerCase() ?? '';
  if (!STATUSES.has(value)) throw new BadRequestException('Unknown SMS status');
  return value;
}

export function reporterEmail(anonymous: boolean, email: string | undefined) {
  if (anonymous) return null;
  const value = email?.trim();
  return value ? value : null;
}
