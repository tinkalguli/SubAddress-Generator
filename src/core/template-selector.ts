import type { TemplateDefinition } from '../types';
import { matchUrlRule, ruleSpecificityScore } from './url-matcher';

/** Pick a template when URL rules match (used in options / tests; not for popup Auto). */
export function selectTemplateForUrl(
  url: string,
  templates: TemplateDefinition[],
): TemplateDefinition | null {
  const enabled = templates.filter((t) => t.enabled && t.urlRule);
  const matches: TemplateDefinition[] = [];
  for (const t of enabled) {
    if (t.urlRule && matchUrlRule(url, t.urlRule)) {
      matches.push(t);
    }
  }
  if (matches.length === 0) return null;
  matches.sort((a, b) => {
    const specA = a.urlRule ? ruleSpecificityScore(a.urlRule, url) : 0;
    const specB = b.urlRule ? ruleSpecificityScore(b.urlRule, url) : 0;
    if (specB !== specA) return specB - specA;
    return b.priority - a.priority;
  });
  return matches[0] ?? null;
}

export function getEffectiveTemplate(
  templates: TemplateDefinition[],
  selectedTemplateId: string | null,
): TemplateDefinition | null {
  if (!selectedTemplateId) return null;
  const selected = templates.find((t) => t.id === selectedTemplateId);
  if (!selected || !selected.enabled) return null;
  return selected;
}
