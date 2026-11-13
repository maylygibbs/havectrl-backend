import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { normalizeFlightLeg } from './flight-leg.util';

describe('normalizeFlightLeg', () => {
  it('uppercases ICAO codes', () => {
    const leg = normalizeFlightLeg({ origin: 'svmi', destination: 'svmc' }, true);
    expect(leg.origin).toBe('SVMI');
    expect(leg.destination).toBe('SVMC');
  });

  it('requires origin and destination when requireAll', () => {
    expect(() => normalizeFlightLeg({}, true)).toThrow(BadRequestException);
  });
});
