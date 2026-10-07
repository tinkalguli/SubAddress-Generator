import { describe, it, expect } from 'vitest';
import { parsePrimaryEmail } from './email-parser';
import { applyTemplate, buildTemplateVars } from './template-engine';

describe('template variables', () => {
  it('supports all documented placeholders', () => {
    const parsed = parsePrimaryEmail('dev@company.com')!;
    const now = new Date(2026, 8, 23, 10, 30, 45);
    const vars = buildTemplateVars({
      parsed,
      prefix: 'qa',
      suffix: 'v1',
      timestampFormat: 'DD-MMM-YYYY-HHmm',
      internalSeparator: '-',
      now,
      counter: 7,
      project: 'billing',
      environment: 'prod',
      randomLength: 4,
    });
    vars.random = 'r';
    vars.random4 = 'r4';
    vars.random6 = 'r6';

    const template =
      '{base}|{domain}|{prefix}|{date}|{time}|{timestamp}|{random}|{random4}|{random6}|{counter}|{project}|{environment}|{year}|{month}|{day}|{hour}|{minute}|{second}';
    const out = applyTemplate(template, vars);

    expect(out).toContain('dev|company.com|qa|');
    expect(out).toContain('|7|billing|prod|2026|09|23|10|30|45');
    expect(out).toContain('|r|r4|r6|');
  });
});
