import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { normalizeFlightLog } from './flight-log.util';

describe('normalizeFlightLog', () => {
  it('normalizes a complete log', () => {
    const log = normalizeFlightLog(
      {
        blockMinutes: 120,
        flightMinutes: 95,
        cycles: 1,
        pilotName: ' Capt ',
        reviewStatus: 'pending',
      },
      true,
    );
    expect(log.pilotName).toBe('Capt');
    expect(log.flightMinutes).toBe(95);
  });

  it('rejects negative minutes', () => {
    expect(() => normalizeFlightLog({ blockMinutes: -1, flightMinutes: 0, cycles: 0, pilotName: 'X' }, true)).toThrow(
      BadRequestException,
    );
  });
});
