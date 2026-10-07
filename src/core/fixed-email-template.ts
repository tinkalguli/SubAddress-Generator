/** Middle segment only — always wrapped as {base}+…@{domain} at generation time. */

export type CustomRandomKind = 'random4' | 'timestamp';

export function buildFixedEmailTemplate(options: {
  includeSuffix: boolean;
  random: CustomRandomKind;
}): string {
  const parts: string[] = ['{prefix}'];
  if (options.includeSuffix) parts.push('{suffix}');
  parts.push(options.random === 'random4' ? '{random4}' : '{timestamp}');
  return `{base}+${parts.join('-')}@{domain}`;
}

export function describeFixedTemplate(template: string): string {
  const plus = template.indexOf('+');
  const at = template.indexOf('@');
  if (plus < 0 || at < plus) return template;
  return template.slice(plus + 1, at);
}

export function templateUsesPrefix(template: string): boolean {
  return template.includes('{prefix}');
}

export function templateUsesSuffix(template: string): boolean {
  return template.includes('{suffix}');
}

export function parseCustomTemplateParts(template: string): {
  includeSuffix: boolean;
  random: CustomRandomKind;
} | null {
  if (!template.startsWith('{base}+') || !template.includes('@{domain}')) return null;
  const middle = describeFixedTemplate(template);
  return {
    includeSuffix: middle.includes('{suffix}'),
    random: middle.includes('{timestamp}') ? 'timestamp' : 'random4',
  };
}

/** Remove empty segments and duplicate separators in the subaddress local part. */
export function normalizePlusLocalPart(localWithPlus: string, internalSeparator: string): string {
  const plusIdx = localWithPlus.indexOf('+');
  if (plusIdx < 0) return localWithPlus;
  const head = localWithPlus.slice(0, plusIdx + 1);
  let tail = localWithPlus.slice(plusIdx + 1);
  if (internalSeparator !== '-') {
    tail = tail.replace(/-/g, internalSeparator);
  }
  const sep = internalSeparator;
  const pieces = tail.split(sep).filter((p) => p.length > 0);
  return head + pieces.join(sep);
}
