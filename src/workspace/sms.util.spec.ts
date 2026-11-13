import { describe, expect, it } from 'vitest';
import { normalizeSmsReport, normalizeSmsStatus, reporterEmail } from './sms.util';

describe('sms report', () => {
  it('drops the author when the report is anonymous', () => {
    const row = normalizeSmsReport({ title: ' Bird ', narrative: 'Seen on the ramp', anonymous: true, severity: 'HIGH' });
    expect(row).toMatchObject({ title: 'Bird', anonymous: true, severity: 'high' });
    expect(reporterEmail(true, 'pilot@demoa.local')).toBeNull();
    expect(reporterEmail(false, 'pilot@demoa.local')).toBe('pilot@demoa.local');
  });

  it('rejects an unknown status', () => {
    expect(() => normalizeSmsStatus('published')).toThrow(/status/);
    expect(normalizeSmsStatus('in_review')).toBe('in_review');
  });
});
