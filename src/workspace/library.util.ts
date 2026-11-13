import { BadRequestException, ForbiddenException } from '@nestjs/common';

const STATUSES = new Set(['draft', 'current', 'superseded', 'withdrawn']);
const PUBLISHED = new Set(['current', 'superseded', 'withdrawn']);

export type LibraryDocumentInput = {
  code?: string;
  title?: string;
  category?: string;
  edition?: string;
  amendment?: string;
  language?: string;
  reference?: string;
  status?: string;
};

export type BookmarkInput = {
  documentId?: string;
  page?: number;
  note?: string;
};

export function normalizeLibraryDocument(body: LibraryDocumentInput) {
  const code = body.code?.trim().toUpperCase() ?? '';
  const title = body.title?.trim() ?? '';
  const category = body.category?.trim() ?? '';
  const edition = body.edition?.trim() ?? '';
  const language = body.language?.trim().toLowerCase() ?? '';
  const status = body.status?.trim().toLowerCase() || 'draft';
  const reference = body.reference?.trim().toUpperCase() || code;
  if (!code || !title || !category || !edition || !language) {
    throw new BadRequestException('code, title, category, edition and language are required');
  }
  if (!STATUSES.has(status)) throw new BadRequestException('Unknown library status');
  return {
    code,
    title,
    category,
    edition,
    amendment: body.amendment?.trim() ?? '',
    language,
    reference,
    status,
  };
}

export function assertLibraryPublish(profile: string, status: string) {
  if (PUBLISHED.has(status) && profile !== 'admin') {
    throw new ForbiddenException('Only an administrator publishes a library edition');
  }
}

export function normalizeBookmark(body: BookmarkInput) {
  const documentId = body.documentId?.trim() ?? '';
  const page = Number(body.page);
  if (!documentId) throw new BadRequestException('documentId is required');
  if (!Number.isInteger(page) || page < 1) throw new BadRequestException('page must be 1 or greater');
  return { documentId, page, note: body.note?.trim() ?? '' };
}
