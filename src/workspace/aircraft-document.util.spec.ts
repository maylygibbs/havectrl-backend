import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { normalizeAircraftDocument } from './aircraft-document.util';

describe('normalizeAircraftDocument', () => {
  it('requires title on create', () => {
    expect(() => normalizeAircraftDocument({}, true)).toThrow(BadRequestException);
  });

  it('defaults status to current', () => {
    const row = normalizeAircraftDocument({ title: 'Insurance' }, true);
    expect(row.status).toBe('current');
    expect(row.title).toBe('Insurance');
  });
});
