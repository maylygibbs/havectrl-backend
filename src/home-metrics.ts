import { canReadSmsFile, modulesFor } from './access';

/** Reserved SMS count for Home (null = hidden). */
export function homeOpenSmsCount(profile: string, openCount: number): number | null {
  if (!modulesFor(profile).includes('sms')) return null;
  if (!canReadSmsFile(profile)) return null;
  return openCount;
}

/** SMS inbox API returns rows only for profiles allowed to read the file. */
export function smsInboxRowsAllowed(profile: string): boolean {
  return canReadSmsFile(profile);
}
