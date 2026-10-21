import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { mapPgUnique, normalizeCrew } from './crew.util';

describe('normalizeCrew', () => {
  it('requires core fields on create', () => {
    expect(() => normalizeCrew({ fullName: 'Ana' }, true)).toThrow(BadRequestException);
  });

  it('accepts a full create payload', () => {
    const row = normalizeCrew(
      {
        employeeCode: ' DA-99 ',
        fullName: ' Ana Rivas ',
        position: 'Piloto',
        base: 'SVMI',
        licenseNumber: ' YV-1 ',
        licenseExpires: '2027-01-01',
      },
      true,
    );
    expect(row.employeeCode).toBe('DA-99');
    expect(row.fullName).toBe('Ana Rivas');
    expect(row.licenseNumber).toBe('YV-1');
    expect(row.status).toBe('active');
  });

  it('allows partial updates', () => {
    const row = normalizeCrew({ fullName: '  Nueva  ' }, false);
    expect(row.fullName).toBe('Nueva');
    expect(row.employeeCode).toBeUndefined();
  });

  it('clears optional license when empty string is sent', () => {
    const row = normalizeCrew({ licenseNumber: '  ' }, false);
    expect(row.licenseNumber).toBeNull();
  });
});

describe('mapPgUnique', () => {
  it('maps postgres unique violations to BadRequestException', () => {
    expect(() => mapPgUnique({ code: '23505' }, 'Employee code already exists')).toThrow(
      BadRequestException,
    );
  });

  it('rethrows unrelated errors', () => {
    expect(() => mapPgUnique(new Error('boom'), 'x')).toThrow('boom');
  });
});
