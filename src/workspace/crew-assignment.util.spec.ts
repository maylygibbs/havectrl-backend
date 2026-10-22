import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { normalizeCrewAssignment } from './crew-assignment.util';

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
});
