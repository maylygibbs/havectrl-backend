import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { assertAssignmentAllowed, normalizeCrewAssignment } from './crew-assignment.util';

describe('normalizeCrewAssignment', () => {
  it('accepts valid range', () => {
    const a = normalizeCrewAssignment({
      activity: 'Flight Duty',
      startsAt: '2026-10-18T10:00:00.000Z',
      endsAt: '2026-10-18T18:00:00.000Z',
    });
    expect(a.activity).toBe('Flight Duty');
  });

  it('rejects end before start', () => {
    expect(() =>
      normalizeCrewAssignment({
        activity: 'Work',
        startsAt: '2026-10-18T18:00:00.000Z',
        endsAt: '2026-10-18T10:00:00.000Z',
      }),
    ).toThrow(BadRequestException);
  });

  it('requires a loaded flight and rejects overlap, rest and an expired license', () => {
    const base = {
      activity: 'Flight Duty',
      startsAt: '2026-10-18T10:00:00.000Z',
      endsAt: '2026-10-18T12:00:00.000Z',
      licenseExpires: '2026-12-01',
      flightCode: 'HV101',
      knownFlightCodes: ['HV101'],
      existing: [],
    };
    expect(() => assertAssignmentAllowed({ ...base, flightCode: 'NOPE' })).toThrow(BadRequestException);
    expect(() =>
      assertAssignmentAllowed({
        ...base,
        existing: [{ activity: 'Work', startsAt: '2026-10-18T11:00:00.000Z', endsAt: '2026-10-18T13:00:00.000Z' }],
      }),
    ).toThrow(/already assigned/);
    expect(() =>
      assertAssignmentAllowed({
        ...base,
        existing: [{ activity: 'Rest', startsAt: '2026-10-18T08:00:00.000Z', endsAt: '2026-10-18T18:00:00.000Z' }],
      }),
    ).toThrow(/rest/);
    expect(() => assertAssignmentAllowed({ ...base, licenseExpires: '2026-10-01' })).toThrow(/license/);
    expect(() => assertAssignmentAllowed(base)).not.toThrow();
  });
});
