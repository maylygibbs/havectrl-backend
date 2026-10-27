export type DocumentValidity =
  | 'missing'
  | 'not_yet_effective'
  | 'valid'
  | 'expiring_soon'
  | 'expired'
  | 'no_expiry'
  | 'not_applicable';

export function documentValidity(input: {
  reviewStatus: string;
  expiresOn: string | null;
  effectiveOn: string | null;
  today: string;
}): DocumentValidity {
  if (input.reviewStatus === 'rejected') return 'not_applicable';
  if (input.effectiveOn && input.effectiveOn.slice(0, 10) > input.today) return 'not_yet_effective';
  if (!input.expiresOn) return 'no_expiry';
  const expires = input.expiresOn.slice(0, 10);
  if (expires < input.today) return 'expired';
  const exp = Date.parse(`${expires}T00:00:00Z`);
  const today = Date.parse(`${input.today}T00:00:00Z`);
  if (exp - today <= 30 * 24 * 60 * 60 * 1000) return 'expiring_soon';
  return 'valid';
}

export function crewVisibility(profile?: string, email?: string): { clause: string; params: string[] } {
  if (profile === 'admin') return { clause: 'TRUE', params: [] };
  if (profile === 'tecnico') return { clause: `(w.team = 'maintenance' OR w.email = $EMAIL)`, params: [email ?? ''] };
  if (profile === 'despachador') return { clause: `(w.team = 'operations' OR w.email = $EMAIL)`, params: [email ?? ''] };
  return { clause: 'w.email = $EMAIL', params: [email ?? ''] };
}

export function bindVisibility(clause: string, params: string[], startAt: number): { sql: string; params: string[] } {
  if (!params.length) return { sql: clause, params };
  return { sql: clause.replace('$EMAIL', `$${startAt}`), params };
}

export type MovementRow = {
  flightMinutes: number;
  blockMinutes: number;
  creditedMinutes: number;
  nightMinutes: number;
  instrumentMinutes: number;
  simulatorMinutes: number;
  occurredOn: string | null;
  countsAsFlight: boolean;
  registration: string | null;
  functionCode: string | null;
};

export type PreviousRow = {
  flightMinutes: number;
  asOf: string | null;
  reviewStatus: string;
};

export function windowStart(cutoff: string, months: number): string {
  const [year, month, day] = cutoff.split('-').map(Number);
  const endExclusive = new Date(Date.UTC(year, month - 1, day + 1));
  const start = new Date(endExclusive);
  start.setUTCMonth(start.getUTCMonth() - months);
  return start.toISOString().slice(0, 10);
}

function inWindow(occurredOn: string | null, cutoff: string, months: number) {
  if (!occurredOn) return false;
  const day = occurredOn.slice(0, 10);
  const start = windowStart(cutoff, months);
  const endExclusive = new Date(Date.parse(`${cutoff}T00:00:00Z`) + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return day >= start && day < endExclusive;
}

export function experienceReport(input: {
  today: string;
  movements: MovementRow[];
  previous: PreviousRow[];
}) {
  const acceptedDated = input.previous.filter((row) => row.reviewStatus === 'accepted' && row.asOf);
  const partialHistory = input.previous.some((row) => row.reviewStatus === 'accepted' && !row.asOf);
  const previousMinutes = acceptedDated.reduce((sum, row) => sum + row.flightMinutes, 0);
  const flightMinutes =
    input.movements.reduce((sum, row) => sum + (row.countsAsFlight ? row.flightMinutes : 0), 0) + previousMinutes;
  const blockMinutes = input.movements.reduce((sum, row) => sum + (row.countsAsFlight ? row.blockMinutes : 0), 0);
  const creditedMinutes = input.movements.reduce((sum, row) => sum + (row.countsAsFlight ? row.creditedMinutes : 0), 0);
  const nightMinutes = input.movements.reduce((sum, row) => sum + (row.countsAsFlight ? row.nightMinutes : 0), 0);
  const instrumentMinutes = input.movements.reduce((sum, row) => sum + (row.countsAsFlight ? row.instrumentMinutes : 0), 0);
  const simulatorMinutes = input.movements.reduce((sum, row) => sum + row.simulatorMinutes, 0);

  const windows = [12, 6, 3].map((months) => {
    const fromMovements = input.movements.reduce((sum, row) => {
      if (!row.countsAsFlight || !inWindow(row.occurredOn, input.today, months)) return sum;
      return sum + row.flightMinutes;
    }, 0);
    const fromPrevious = acceptedDated.reduce((sum, row) => {
      if (!inWindow(row.asOf, input.today, months)) return sum;
      return sum + row.flightMinutes;
    }, 0);
    const simulatorMinutes = input.movements.reduce((sum, row) => {
      if (!inWindow(row.occurredOn, input.today, months)) return sum;
      return sum + row.simulatorMinutes;
    }, 0);
    return { months, flightMinutes: fromMovements + fromPrevious, simulatorMinutes };
  });

  const byRegistration = new Map<string, number>();
  const byFunction = new Map<string, number>();
  for (const row of input.movements) {
    if (!row.countsAsFlight) continue;
    const registration = row.registration || '—';
    const functionCode = row.functionCode || '—';
    byRegistration.set(registration, (byRegistration.get(registration) ?? 0) + row.flightMinutes);
    byFunction.set(functionCode, (byFunction.get(functionCode) ?? 0) + row.flightMinutes);
  }

  return {
    flightMinutes,
    blockMinutes,
    creditedMinutes,
    nightMinutes,
    instrumentMinutes,
    simulatorMinutes,
    windows,
    byRegistration: [...byRegistration.entries()].map(([registration, minutes]) => ({ registration, minutes })),
    byFunction: [...byFunction.entries()].map(([functionCode, minutes]) => ({ functionCode, minutes })),
    partialHistory,
  };
}

export function logMovementMinutes(input: {
  flightMinutes: number;
  blockMinutes: number;
  functionCode: string;
  countsAsFlight: boolean;
}) {
  const code = input.functionCode.toUpperCase();
  if (code === 'SIM') {
    return {
      flightMinutes: 0,
      blockMinutes: 0,
      creditedMinutes: 0,
      simulatorMinutes: input.flightMinutes,
      countsAsFlight: false,
    };
  }
  if (!input.countsAsFlight || code === 'PAX') {
    return {
      flightMinutes: 0,
      blockMinutes: 0,
      creditedMinutes: 0,
      simulatorMinutes: 0,
      countsAsFlight: false,
    };
  }
  return {
    flightMinutes: input.flightMinutes,
    blockMinutes: input.blockMinutes,
    creditedMinutes: input.flightMinutes,
    simulatorMinutes: 0,
    countsAsFlight: true,
  };
}

export function simplePdf(title: string, lines: string[]): Buffer {
  const safe = (value: string) =>
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[()\\]/g, ' ')
      .slice(0, 110);
  const commands = [title, ...lines].map((line, index) => {
    const y = 800 - index * 14;
    return `BT /F1 11 Tf 48 ${y} Td (${safe(line)}) Tj ET`;
  });
  const stream = commands.join('\n');
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
    `4 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}\nendstream endobj`,
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
  ];
  let body = '%PDF-1.4\n';
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(body));
    body += `${object}\n`;
  }
  const xref = Buffer.byteLength(body);
  body += `xref\n0 ${objects.length + 1}\n`;
  body += '0000000000 65535 f \n';
  for (let i = 1; i < offsets.length; i += 1) {
    body += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(body);
}
