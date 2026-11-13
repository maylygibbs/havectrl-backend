import { BadRequestException } from '@nestjs/common';

export type AircraftDocumentInput = {
  title?: string;
  status?: string;
  expiresOn?: string | null;
};

export function normalizeAircraftDocument(body: AircraftDocumentInput, requireAll: boolean) {
  const title = body.title?.trim();
  const status = body.status?.trim() || 'current';
  const expiresOn = body.expiresOn === undefined ? undefined : body.expiresOn || null;
  if (requireAll && !title) {
    throw new BadRequestException('title is required');
  }
  return { title: title || undefined, status, expiresOn };
}
