import { describe, it, expect } from 'vitest';
import { parsePrimaryEmail } from './email-parser';
import { EXAMPLE_PRIMARY_EMAIL } from '../constants/demo';
import { applyTemplate, buildTemplateVars } from './template-engine';

describe('template-engine', () => {
  it('replaces template variables', () => {
    const parsed = parsePrimaryEmail(EXAMPLE_PRIMARY_EMAIL)!;
    const vars = buildTemplateVars({
      parsed,
      prefix: 'signup',
      suffix: '',
      timestampFormat: 'DD-MMM-HHmm',
      internalSeparator: '-',
      now: new Date(2026, 8, 23, 10, 30, 0),
      counter: 1,
      project: 'p',
      environment: 'staging',
      randomLength: 4,
    });
    vars.random4 = 'a7k2';
    const out = applyTemplate('{base}+{prefix}-{timestamp}-{random4}@{domain}', vars);
    expect(out).toBe('example+signup-23-Sep-1030-a7k2@gmail.com');
  });
});
