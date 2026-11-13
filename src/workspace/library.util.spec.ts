import { describe, expect, it } from 'vitest';
import { assertLibraryPublish, normalizeBookmark, normalizeLibraryDocument } from './library.util';

describe('library', () => {
  it('groups a new edition under the same reference and starts as a draft', () => {
    const row = normalizeLibraryDocument({
      code: ' om-a ',
      title: 'Operations manual',
      category: 'Manual',
      edition: 'Rev 2',
      language: 'ES',
      reference: 'om',
    });
    expect(row).toMatchObject({ code: 'OM-A', language: 'es', reference: 'OM', status: 'draft' });
  });

  it('lets only an administrator publish, and keeps a bookmark on a page', () => {
    expect(() => assertLibraryPublish('piloto', 'current')).toThrow(/administrator/);
    expect(() => assertLibraryPublish('admin', 'current')).not.toThrow();
    expect(normalizeBookmark({ documentId: 'doc', page: 12, note: ' Check ' }).note).toBe('Check');
    expect(() => normalizeBookmark({ documentId: 'doc', page: 0 })).toThrow(/page/);
  });
});
