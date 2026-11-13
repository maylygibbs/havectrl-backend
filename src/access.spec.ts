import { describe, expect, it } from 'vitest';
import { canReadSmsFile, modulesFor } from './access';

describe('access matrix (iteración 1A / ACC-02 module scope)', () => {
  it('admin sees all modules including settings', () => {
    expect(modulesFor('admin')).toContain('settings');
    expect(modulesFor('admin')).toContain('crew');
  });

  it('piloto does not see settings or maintenance', () => {
    const mods = modulesFor('piloto');
    expect(mods).not.toContain('settings');
    expect(mods).not.toContain('maintenance');
    expect(mods).toContain('sms');
  });

  it('SMS file read is limited to admin and jefe_sms', () => {
    expect(canReadSmsFile('admin')).toBe(true);
    expect(canReadSmsFile('jefe_sms')).toBe(true);
    expect(canReadSmsFile('piloto')).toBe(false);
    expect(canReadSmsFile('tecnico')).toBe(false);
  });
});
