import { describe, it, expect } from 'vitest';
import { matchUrlRule, ruleSpecificityScore, formatWebsiteDisplay } from './url-matcher';
import type { UrlRule } from '../types';
import { selectTemplateForUrl } from './template-selector';
import type { TemplateDefinition } from '../types';

describe('url-matcher', () => {
  const url = 'https://staging.policyadvisor.ca/signup?x=1';

  it('matches domain', () => {
    expect(matchUrlRule(url, { type: 'domain', pattern: 'policyadvisor.ca' })).toBe(true);
  });

  it('matches hostname', () => {
    expect(
      matchUrlRule(url, { type: 'hostname', pattern: 'staging.policyadvisor.ca' }),
    ).toBe(true);
  });

  it('matches url contains', () => {
    expect(matchUrlRule(url, { type: 'urlContains', pattern: 'policyadvisor.ca/signup' })).toBe(
      true,
    );
  });

  it('matches path contains', () => {
    expect(matchUrlRule(url, { type: 'pathContains', pattern: '/signup' })).toBe(true);
  });

  it('matches wildcard', () => {
    expect(matchUrlRule(url, { type: 'wildcard', pattern: '*.policyadvisor.ca' })).toBe(true);
  });

  it('matches regex', () => {
    const rule: UrlRule = {
      type: 'regex',
      pattern: '.*policyadvisor\\.ca\\/(signup|register).*',
    };
    expect(matchUrlRule(url, rule)).toBe(true);
  });

  it('prefers more specific rules', () => {
    const general: UrlRule = { type: 'domain', pattern: 'policyadvisor.ca' };
    const signup: UrlRule = { type: 'urlContains', pattern: 'policyadvisor.ca/signup' };
    expect(ruleSpecificityScore(signup, url)).toBeGreaterThan(ruleSpecificityScore(general, url));
  });

  it('formatWebsiteDisplay returns hostname only', () => {
    expect(formatWebsiteDisplay('https://qa.policyadvisor.ca/app/register/')).toBe(
      'qa.policyadvisor.ca',
    );
  });
});

describe('template priority', () => {
  const templates: TemplateDefinition[] = [
    {
      id: '1',
      name: 'General',
      template: '{base}+{prefix}@{domain}',
      prefix: 'a',
      timestampFormat: 'DD-MMM-HHmm',
      urlRule: { type: 'domain', pattern: 'example.com' },
      priority: 10,
      enabled: true,
    },
    {
      id: '2',
      name: 'Signup',
      template: '{base}+{prefix}@{domain}',
      prefix: 'b',
      timestampFormat: 'DD-MMM-HHmm',
      urlRule: { type: 'urlContains', pattern: 'example.com/signup' },
      priority: 20,
      enabled: true,
    },
  ];

  it('selects higher specificity / priority template', () => {
    const selected = selectTemplateForUrl('https://app.example.com/signup', templates);
    expect(selected?.name).toBe('Signup');
  });
});
