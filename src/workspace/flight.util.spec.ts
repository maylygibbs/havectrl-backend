import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { normalizeFlight } from './flight.util';

describe('normalizeFlight', () => {
  it('requires core fields on create', () => {
    expect(() => normalizeFlight({ code: 'HC101' }, true)).toThrow(BadRequestException);
  });

  it('normalizes ICAO codes', () => {
    const row = normalizeFlight(
      {
        code: ' hc101 ',
        aircraftId: 'uuid',
        flightDate: '2026-10-22',
        origin: 'svmi',
        destination: 'svcs',
      },
      true,
    );
    expect(row.code).toBe('HC101');
    expect(row.origin).toBe('SVMI');
    expect(row.status).toBe('planned');
  });
});
