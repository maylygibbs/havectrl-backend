import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { normalizeAircraft } from './aircraft.util';

describe('normalizeAircraft', () => {
  it('requires identity on create and leaves counters unknown', () => {
    const row = normalizeAircraft(
      { registration: ' yv1 ', model: 'King Air 350', serialNumber: 'FL-1', base: 'svmi' },
      true,
    );
    expect(row.registration).toBe('YV1');
    expect(row.base).toBe('SVMI');
    expect(row.technicalStatus).toBe('unknown');
    expect(row.airframeHours).toBeNull();
    expect(row.airframeCycles).toBeNull();
  });

  it('rejects a missing registration', () => {
    expect(() => normalizeAircraft({ model: 'King Air' }, true)).toThrow(BadRequestException);
  });

  it('keeps a declared zero and rejects a negative counter', () => {
    expect(normalizeAircraft({ airframeHours: 0, airframeCycles: 0 }, false).airframeHours).toBe(0);
    expect(() => normalizeAircraft({ airframeHours: -1 }, false)).toThrow(BadRequestException);
  });
});
