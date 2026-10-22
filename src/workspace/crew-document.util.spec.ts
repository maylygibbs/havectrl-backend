import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { normalizeCrewDocument } from './crew-document.util';

describe('normalizeCrewDocument', () => {
  it('accepts valid category', () => {
    const doc = normalizeCrewDocument({ category: 'language', title: 'ICAO Level 4' }, true);
    expect(doc.category).toBe('language');
  });

  it('rejects unknown category', () => {
    expect(() => normalizeCrewDocument({ category: 'x', title: 'Y' }, true)).toThrow(BadRequestException);
  });
});
