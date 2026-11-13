import { describe, expect, it } from 'vitest';
import { normalizeMeeting, normalizeMinutes } from './comms.util';

describe('communication', () => {
  it('accepts a scheduled meeting and drops a blank link', () => {
    const row = normalizeMeeting({
      title: ' Brief ',
      startsAt: '2026-11-12T14:00:00.000Z',
      agenda: 'Weather and aircraft',
      locationUrl: '  ',
    });
    expect(row).toMatchObject({ title: 'Brief', status: 'scheduled', locationUrl: null });
  });

  it('requires text before the minutes are recorded', () => {
    expect(() => normalizeMinutes({ minutes: '  ', minutesStatus: 'recorded' })).toThrow(/text/);
    expect(normalizeMinutes({ minutes: 'Agreed to review the log.', minutesStatus: 'recorded' }).minutesStatus).toBe(
      'recorded',
    );
  });
});
