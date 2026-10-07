import { describe, it, expect } from 'vitest';
import { buildFixedEmailTemplate, normalizePlusLocalPart } from './fixed-email-template';

describe('fixed-email-template', () => {
  it('builds wrapped pattern with optional suffix', () => {
    expect(buildFixedEmailTemplate({ includeSuffix: false, random: 'random4' })).toBe(
      '{base}+{prefix}-{random4}@{domain}',
    );
    expect(buildFixedEmailTemplate({ includeSuffix: true, random: 'random4' })).toBe(
      '{base}+{prefix}-{suffix}-{random4}@{domain}',
    );
  });

  it('drops empty segments from plus local part', () => {
    expect(normalizePlusLocalPart('user+test--a7k2', '-')).toBe('user+test-a7k2');
    expect(normalizePlusLocalPart('user+test-signup-a7k2', '-')).toBe('user+test-signup-a7k2');
  });
});
