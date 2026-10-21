import { describe, expect, it } from 'vitest';
import { homeOpenSmsCount, smsInboxRowsAllowed } from './home-metrics';

describe('ACC-02 SMS reserve and Home metrics', () => {
  it('hides open SMS count on Home for piloto', () => {
    expect(homeOpenSmsCount('piloto', 5)).toBeNull();
  });

  it('shows open SMS count for admin and jefe_sms', () => {
    expect(homeOpenSmsCount('admin', 3)).toBe(3);
    expect(homeOpenSmsCount('jefe_sms', 1)).toBe(1);
  });

  it('blocks SMS inbox rows for non-reserved profiles', () => {
    expect(smsInboxRowsAllowed('piloto')).toBe(false);
    expect(smsInboxRowsAllowed('tecnico')).toBe(false);
    expect(smsInboxRowsAllowed('admin')).toBe(true);
    expect(smsInboxRowsAllowed('jefe_sms')).toBe(true);
  });
});
