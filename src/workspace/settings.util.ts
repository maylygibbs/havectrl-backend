import { BadRequestException } from '@nestjs/common';

export type CompanyInput = {
  displayName?: string;
  tagline?: string;
  primaryColor?: string;
  accentColor?: string;
};

const HEX = /^#[0-9A-Fa-f]{6}$/;

export function normalizeCompany(body: CompanyInput) {
  const displayName = body.displayName !== undefined ? body.displayName.trim() : undefined;
  const tagline = body.tagline !== undefined ? body.tagline.trim() : undefined;
  const primaryColor = body.primaryColor !== undefined ? body.primaryColor.trim() : undefined;
  const accentColor = body.accentColor !== undefined ? body.accentColor.trim() : undefined;
  if (primaryColor && !HEX.test(primaryColor)) {
    throw new BadRequestException('primaryColor must be a hex color like #112233');
  }
  if (accentColor && !HEX.test(accentColor)) {
    throw new BadRequestException('accentColor must be a hex color like #112233');
  }
  if (
    displayName === undefined &&
    tagline === undefined &&
    primaryColor === undefined &&
    accentColor === undefined
  ) {
    throw new BadRequestException('At least one field is required');
  }
  return {
    displayName: displayName === undefined ? undefined : displayName || undefined,
    tagline,
    primaryColor: primaryColor || undefined,
    accentColor: accentColor || undefined,
  };
}

export function normalizeProfileCode(code: string | undefined) {
  const trimmed = code?.trim();
  if (!trimmed) throw new BadRequestException('profile code is required');
  return trimmed;
}
