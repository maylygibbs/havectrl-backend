import { BadRequestException } from '@nestjs/common';

const CATEGORIES = new Set(['language', 'travel', 'training', 'other']);

export type CrewDocumentInput = {
  category?: string;
  title?: string;
  documentNumber?: string;
  issuer?: string;
  expiresOn?: string;
  status?: string;
};

export function normalizeCrewDocument(body: CrewDocumentInput, requireAll: boolean) {
  const category = body.category?.trim().toLowerCase();
  const title = body.title?.trim();
  const documentNumber = body.documentNumber?.trim() || null;
  const issuer = body.issuer?.trim() || null;
  const expiresOn = body.expiresOn?.trim() || null;
  const status = body.status?.trim() || 'current';

  if (requireAll && (!category || !title)) {
    throw new BadRequestException('category and title are required');
  }
  if (category && !CATEGORIES.has(category)) {
    throw new BadRequestException('category must be language, travel, training, or other');
  }

  return { category: category ?? '', title: title ?? '', documentNumber, issuer, expiresOn, status };
}
