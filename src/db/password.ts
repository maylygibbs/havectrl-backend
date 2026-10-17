import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(plain, salt, 32);
  return `s2.${salt.toString('hex')}.${hash.toString('hex')}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [tag, saltHex, hashHex] = stored.split('.');
  if (tag !== 's2' || !saltHex || !hashHex) return false;
  const hash = scryptSync(plain, Buffer.from(saltHex, 'hex'), 32);
  const expected = Buffer.from(hashHex, 'hex');
  if (hash.length !== expected.length) return false;
  return timingSafeEqual(hash, expected);
}
