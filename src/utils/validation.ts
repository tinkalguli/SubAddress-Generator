import { isValidPrimaryEmail } from '../core/email-parser';
import { clampRecentLimit } from '../storage/recent-emails';
import { MAX_RECENT_EMAIL_LIMIT } from '../types';

export function validatePrimaryEmail(email: string): string | null {
  if (!email.trim()) return 'Primary email is required';
  if (!isValidPrimaryEmail(email)) return 'Enter a valid email address';
  return null;
}

export function parseRecentLimitInput(value: string, custom: boolean): number {
  if (!custom) return clampRecentLimit(Number(value));
  const n = parseInt(value, 10);
  if (Number.isNaN(n)) return 10;
  return clampRecentLimit(n);
}

export function isRecentLimitPreset(n: number): boolean {
  return [5, 10, 20, 50, 100].includes(n);
}

export { MAX_RECENT_EMAIL_LIMIT };
