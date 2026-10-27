import { describe, expect, it } from 'vitest';
import { documentValidity, experienceReport, logMovementMinutes, windowStart } from './crew-scope.util';

describe('documentValidity', () => {
  it('keeps an accepted document expired without treating a future one as current', () => {
    expect(
      documentValidity({
        reviewStatus: 'accepted',
        expiresOn: '2026-01-01',
        effectiveOn: null,
        today: '2026-10-26',
      }),
    ).toBe('expired');
    expect(
      documentValidity({
        reviewStatus: 'accepted',
        expiresOn: '2027-01-01',
        effectiveOn: '2026-12-01',
        today: '2026-10-26',
      }),
    ).toBe('not_yet_effective');
  });
});

describe('experience windows', () => {
  it('uses the manual cutoff and does not spread an undated balance', () => {
    expect(windowStart('2026-10-09', 3)).toBe('2026-07-10');
    const report = experienceReport({
      today: '2026-10-09',
      movements: [
        {
          flightMinutes: 50,
          blockMinutes: 60,
          creditedMinutes: 50,
          nightMinutes: 0,
          instrumentMinutes: 0,
          simulatorMinutes: 0,
          occurredOn: '2026-06-01',
          countsAsFlight: true,
          registration: 'YV3301',
          functionCode: 'PIC',
        },
        {
          flightMinutes: 45,
          blockMinutes: 0,
          creditedMinutes: 0,
          nightMinutes: 0,
          instrumentMinutes: 0,
          simulatorMinutes: 45,
          occurredOn: '2026-08-02',
          countsAsFlight: false,
          registration: null,
          functionCode: 'SIM',
        },
      ],
      previous: [{ flightMinutes: 999, asOf: null, reviewStatus: 'accepted' }],
    });
    expect(report.flightMinutes).toBe(50);
    expect(report.simulatorMinutes).toBe(45);
    expect(report.windows.find((row) => row.months === 3)?.flightMinutes).toBe(0);
    expect(report.windows.find((row) => row.months === 6)?.flightMinutes).toBe(50);
    expect(report.partialHistory).toBe(true);
  });

  it('does not credit a passenger or a simulator as flight time', () => {
    expect(logMovementMinutes({ flightMinutes: 40, blockMinutes: 50, functionCode: 'PAX', countsAsFlight: false }).flightMinutes).toBe(0);
    expect(logMovementMinutes({ flightMinutes: 40, blockMinutes: 50, functionCode: 'SIM', countsAsFlight: true }).simulatorMinutes).toBe(40);
    expect(logMovementMinutes({ flightMinutes: 40, blockMinutes: 50, functionCode: 'PIC', countsAsFlight: true }).creditedMinutes).toBe(40);
  });
});
