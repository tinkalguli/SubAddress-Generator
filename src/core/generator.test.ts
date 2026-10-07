import { describe, it, expect, vi } from 'vitest';
import { DEFAULT_SETTINGS } from '../types';
import { EXAMPLE_PRIMARY_EMAIL } from '../constants/demo';
import { createDefaultTemplates } from './builtin-templates';
import { generateEmail } from './generator';

describe('generator', () => {
  it('generates email with template variables', () => {
    vi.spyOn(Math, 'random').mockRestore();
    const settings = {
      ...DEFAULT_SETTINGS,
      primaryEmail: EXAMPLE_PRIMARY_EMAIL,
      prefix: 'signup',
    };
    const templates = createDefaultTemplates();
    const result = generateEmail({
      settings,
      templates,
      selectedTemplateId: 'builtin-random',
      context: {
        now: new Date(2026, 8, 23, 10, 30, 0),
        counter: 1,
        url: 'https://example.com',
      },
    });
    expect(result?.email).toMatch(/^example\+signup-/);
    expect(result?.email).toContain('@gmail.com');
  });
});
