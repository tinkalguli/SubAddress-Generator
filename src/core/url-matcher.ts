import type { UrlRule, UrlMatchType } from '../types';

function tryParseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function wildcardToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`, 'i');
}

export function matchUrlRule(url: string, rule: UrlRule): boolean {
  const parsed = tryParseUrl(url);
  const href = url.toLowerCase();
  const pattern = rule.pattern.trim();
  if (!pattern) return false;

  switch (rule.type) {
    case 'domain': {
      if (!parsed) return href.includes(pattern.toLowerCase());
      const host = parsed.hostname.toLowerCase();
      const dom = pattern.toLowerCase();
      return host === dom || host.endsWith('.' + dom);
    }
    case 'hostname': {
      if (!parsed) return false;
      return parsed.hostname.toLowerCase() === pattern.toLowerCase();
    }
    case 'urlContains':
      return href.includes(pattern.toLowerCase());
    case 'pathContains': {
      if (!parsed) return href.includes(pattern.toLowerCase());
      return parsed.pathname.toLowerCase().includes(pattern.toLowerCase());
    }
    case 'wildcard':
      return wildcardToRegExp(pattern).test(parsed?.hostname ?? url);
    case 'regex': {
      try {
        return new RegExp(pattern).test(url);
      } catch {
        return false;
      }
    }
    default:
      return false;
  }
}

/** Higher score = more specific match */
export function ruleSpecificityScore(rule: UrlRule, url: string): number {
  if (!matchUrlRule(url, rule)) return 0;
  const typeScores: Record<UrlMatchType, number> = {
    regex: 50,
    urlContains: 40,
    pathContains: 35,
    hostname: 30,
    wildcard: 25,
    domain: 20,
  };
  let score = typeScores[rule.type] ?? 10;
  score += Math.min(rule.pattern.length, 100);
  if (rule.type === 'urlContains' || rule.type === 'pathContains') {
    if (rule.pattern.includes('/')) score += 15;
  }
  return score;
}

export function describeUrlRule(rule: UrlRule): string {
  return `${rule.type}: ${rule.pattern}`;
}

/** Hostname only — stable across in-app route changes (SPA paths). */
export function formatWebsiteDisplay(url: string): string {
  const parsed = tryParseUrl(url);
  if (!parsed) return url;
  return parsed.hostname;
}
