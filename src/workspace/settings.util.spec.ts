import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { normalizeCompany, normalizeProfileCode } from './settings.util';

describe('normalizeCompany', () => {
  it('requires at least one field', () => {
    expect(() => normalizeCompany({})).toThrow(BadRequestException);
  });

  it('validates hex colors', () => {
    expect(() => normalizeCompany({ primaryColor: 'red' })).toThrow(BadRequestException);
    const row = normalizeCompany({ primaryColor: '#112233', accentColor: '#AABBCC' });
    expect(row.primaryColor).toBe('#112233');
  });

  it('allows empty tagline when explicitly sent', () => {
    const row = normalizeCompany({ tagline: '' });
    expect(row.tagline).toBe('');
  });
});

describe('normalizeProfileCode', () => {
  it('trims profile code', () => {
    expect(normalizeProfileCode(' piloto ')).toBe('piloto');
  });
});
