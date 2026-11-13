import { BadRequestException } from '@nestjs/common';

const INSPECTION_STATUSES = new Set(['scheduled', 'due', 'completed']);
const DISCREPANCY_STATUSES = new Set(['open', 'deferred', 'closed']);
const ORDER_STATUSES = new Set(['open', 'in_progress', 'done']);

export type InspectionInput = {
  aircraftId?: string;
  title?: string;
  dueDate?: string | null;
  dueHours?: number | null;
  status?: string;
};

export type DiscrepancyInput = {
  aircraftId?: string;
  flightId?: string | null;
  title?: string;
  description?: string;
  correctiveAction?: string;
  status?: string;
};

export type WorkOrderInput = {
  aircraftId?: string;
  discrepancyId?: string | null;
  title?: string;
  assignedTo?: string;
  status?: string;
  evidence?: string;
};

export function normalizeInspection(body: InspectionInput) {
  const aircraftId = requiredText(body.aircraftId, 'aircraftId');
  const title = requiredText(body.title, 'title');
  const status = body.status?.trim().toLowerCase() || 'scheduled';
  if (!INSPECTION_STATUSES.has(status)) throw new BadRequestException('Unknown inspection status');
  return { aircraftId, title, dueDate: optionalDate(body.dueDate), dueHours: optionalHours(body.dueHours), status };
}

export function normalizeDiscrepancy(body: DiscrepancyInput) {
  const status = body.status?.trim().toLowerCase() || 'open';
  if (!DISCREPANCY_STATUSES.has(status)) throw new BadRequestException('Unknown discrepancy status');
  return {
    aircraftId: requiredText(body.aircraftId, 'aircraftId'),
    flightId: blank(body.flightId),
    title: requiredText(body.title, 'title'),
    description: requiredText(body.description, 'description'),
    correctiveAction: body.correctiveAction?.trim() ?? '',
    status,
  };
}

export function normalizeWorkOrder(body: WorkOrderInput) {
  const status = body.status?.trim().toLowerCase() || 'open';
  const evidence = body.evidence?.trim() ?? '';
  if (!ORDER_STATUSES.has(status)) throw new BadRequestException('Unknown work order status');
  if (status === 'done' && !evidence) throw new BadRequestException('Evidence is required to close the work order');
  return {
    aircraftId: requiredText(body.aircraftId, 'aircraftId'),
    discrepancyId: blank(body.discrepancyId),
    title: requiredText(body.title, 'title'),
    assignedTo: requiredText(body.assignedTo, 'assignedTo'),
    status,
    evidence,
  };
}

function requiredText(value: string | null | undefined, label: string) {
  const text = value?.trim();
  if (!text) throw new BadRequestException(`${label} is required`);
  return text;
}

function blank(value: string | null | undefined) {
  const text = value?.trim();
  return text ? text : null;
}

function optionalDate(value: string | null | undefined) {
  if (value == null || value.trim() === '') return null;
  const date = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new BadRequestException('dueDate must be YYYY-MM-DD');
  return date;
}

function optionalHours(value: number | null | undefined) {
  if (value == null || (value as unknown) === '') return null;
  const hours = Number(value);
  if (!Number.isFinite(hours) || hours < 0) throw new BadRequestException('dueHours must be zero or greater');
  return hours;
}
