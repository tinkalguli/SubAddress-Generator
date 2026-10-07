import type { ParsedEmail } from '../types';

const EMAIL_REGEX = /^([^@+]+)(?:\+[^@]*)?@(.+)$/;

export function parsePrimaryEmail(email: string): ParsedEmail | null {
  const trimmed = email.trim();
  if (!trimmed || !trimmed.includes('@')) {
    return null;
  }
  const atIndex = trimmed.lastIndexOf('@');
  const localPart = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1).toLowerCase();
  if (!localPart || !domain || !domain.includes('.')) {
    return null;
  }
  const plusIndex = localPart.indexOf('+');
  const base = plusIndex >= 0 ? localPart.slice(0, plusIndex) : localPart;
  if (!base) {
    return null;
  }
  return { base, domain, localPart };
}

export function isValidPrimaryEmail(email: string): boolean {
  return parsePrimaryEmail(email) !== null;
}

/** Strip existing subaddress from local part for generation base */
export function getGenerationBase(email: string): ParsedEmail | null {
  const parsed = parsePrimaryEmail(email);
  if (!parsed) return null;
  return { ...parsed, localPart: parsed.base };
}
