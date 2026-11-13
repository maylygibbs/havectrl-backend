import { BadRequestException } from '@nestjs/common';

const SERVICE_KINDS = new Set(['fee', 'fuel', 'handling', 'catering', 'transport', 'hotac', 'other']);
const SERVICE_STATUSES = new Set(['requested', 'quoted', 'confirmed', 'received', 'cancelled']);
const EXPENSE_STATUSES = new Set(['draft', 'submitted', 'approved', 'returned']);
const PAYMENT_STATUSES = new Set(['recorded', 'confirmed']);
const CURRENCIES = new Set(['USD', 'EUR', 'VES']);
const METHODS = new Set(['transfer', 'cash', 'card', 'other']);

export type ServiceInput = {
  flightId?: string | null;
  kind?: string;
  provider?: string;
  status?: string;
  amount?: number;
  currency?: string;
  airport?: string | null;
  officialUrl?: string | null;
};

export type ExpenseInput = {
  flightId?: string | null;
  category?: string;
  description?: string;
  amount?: number;
  currency?: string;
  status?: string;
};

export type PaymentInput = {
  serviceId?: string | null;
  expenseId?: string | null;
  amount?: number;
  currency?: string;
  method?: string;
  status?: string;
  officialUrl?: string | null;
  reference?: string;
};

export function normalizeService(body: ServiceInput, requireAll: boolean) {
  const kind = body.kind?.trim().toLowerCase();
  const provider = body.provider?.trim();
  const status = body.status?.trim().toLowerCase() || (requireAll ? 'requested' : undefined);
  const currency = body.currency?.trim().toUpperCase();
  const airport = blankToNull(body.airport)?.toUpperCase();
  const flightId = blankToNull(body.flightId);
  if (kind && !SERVICE_KINDS.has(kind)) throw new BadRequestException('Unknown service kind');
  if (status && !SERVICE_STATUSES.has(status)) throw new BadRequestException('Unknown service status');
  if (currency && !CURRENCIES.has(currency)) throw new BadRequestException('Unknown currency');
  if (requireAll && (!kind || !provider || !currency || body.amount == null)) {
    throw new BadRequestException('kind, provider, amount and currency are required');
  }
  return {
    flightId,
    kind,
    provider,
    status,
    amount: body.amount == null ? undefined : money(body.amount),
    currency,
    airport,
    officialUrl: body.officialUrl === undefined ? undefined : officialUrl(body.officialUrl),
  };
}

export function normalizeExpense(body: ExpenseInput, requireAll: boolean) {
  const category = body.category?.trim();
  const description = body.description?.trim();
  const status = body.status?.trim().toLowerCase() || (requireAll ? 'draft' : undefined);
  const currency = body.currency?.trim().toUpperCase();
  if (status && !EXPENSE_STATUSES.has(status)) throw new BadRequestException('Unknown expense status');
  if (currency && !CURRENCIES.has(currency)) throw new BadRequestException('Unknown currency');
  if (requireAll && (!category || !description || !currency || body.amount == null)) {
    throw new BadRequestException('category, description, amount and currency are required');
  }
  return {
    flightId: blankToNull(body.flightId),
    category,
    description,
    status,
    amount: body.amount == null ? undefined : money(body.amount),
    currency,
  };
}

export function normalizePayment(body: PaymentInput) {
  const serviceId = blankToNull(body.serviceId);
  const expenseId = blankToNull(body.expenseId);
  const currency = body.currency?.trim().toUpperCase();
  const method = body.method?.trim().toLowerCase();
  const status = body.status?.trim().toLowerCase() || 'recorded';
  if (!serviceId === !expenseId) throw new BadRequestException('A payment settles one service or one expense');
  if (!currency || !CURRENCIES.has(currency)) throw new BadRequestException('Unknown currency');
  if (!method || !METHODS.has(method)) throw new BadRequestException('Unknown payment method');
  if (!PAYMENT_STATUSES.has(status)) throw new BadRequestException('Unknown payment status');
  return {
    serviceId,
    expenseId,
    amount: money(body.amount),
    currency,
    method,
    status,
    officialUrl: officialUrl(body.officialUrl),
    reference: body.reference?.trim() ?? '',
  };
}

export function assertExpenseReview(author: string, actor: string, status: string) {
  if (status === 'approved' && author.trim().toLowerCase() === actor.trim().toLowerCase()) {
    throw new BadRequestException('You cannot approve your own expense');
  }
}

export function assertSameCurrency(source: string, payment: string) {
  if (source !== payment) throw new BadRequestException('Payment currency must match the obligation');
}

export function assertWithinBalance(obligation: number, alreadyConfirmed: number, next: number) {
  const cap = Math.round(obligation * 100);
  const used = Math.round(alreadyConfirmed * 100) + Math.round(next * 100);
  if (used > cap) throw new BadRequestException('Payment exceeds the remaining balance');
}

function money(value: unknown) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) throw new BadRequestException('amount must be greater than zero');
  return Math.round(number * 100) / 100;
}

function officialUrl(value: unknown) {
  if (value == null || String(value).trim() === '') return null;
  const url = String(value).trim();
  if (!/^https?:\/\//i.test(url)) throw new BadRequestException('officialUrl must start with http:// or https://');
  return url;
}

function blankToNull(value: string | null | undefined) {
  const text = value?.trim();
  return text ? text : null;
}
