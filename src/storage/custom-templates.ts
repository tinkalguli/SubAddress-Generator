import type { TemplateDefinition, UrlMatchType, UrlRule } from '../types';

const STORAGE_KEY = 'customTemplates';
const MAX_CUSTOM_TEMPLATES = 50;

const URL_MATCH_TYPES: UrlMatchType[] = [
  'domain',
  'hostname',
  'urlContains',
  'pathContains',
  'wildcard',
  'regex',
];

export function isBuiltinTemplateId(id: string): boolean {
  return id.startsWith('builtin-');
}

function parseUrlRule(raw: unknown): UrlRule | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.type !== 'string' || !URL_MATCH_TYPES.includes(o.type as UrlMatchType)) {
    return null;
  }
  if (typeof o.pattern !== 'string') return null;
  return { type: o.type as UrlMatchType, pattern: o.pattern };
}

export function parseCustomTemplate(raw: unknown): TemplateDefinition | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== 'string' || !o.id || isBuiltinTemplateId(o.id)) return null;
  if (typeof o.name !== 'string' || typeof o.template !== 'string') return null;
  const urlRule = o.urlRule === null ? null : parseUrlRule(o.urlRule);
  if (o.urlRule != null && urlRule === null) return null;
  return {
    id: o.id,
    name: o.name,
    template: o.template,
    prefix: typeof o.prefix === 'string' ? o.prefix : 'test',
    timestampFormat:
      typeof o.timestampFormat === 'string' ? o.timestampFormat : 'DD-MM-YYYY-HH-mm-ss',
    urlRule,
    priority: typeof o.priority === 'number' && Number.isFinite(o.priority) ? o.priority : 10,
    enabled: o.enabled !== false,
  };
}

export async function getCustomTemplates(): Promise<TemplateDefinition[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const list = result[STORAGE_KEY];
  if (!Array.isArray(list)) return [];
  const parsed: TemplateDefinition[] = [];
  for (const item of list) {
    const t = parseCustomTemplate(item);
    if (t) parsed.push(t);
  }
  return parsed;
}

export async function saveCustomTemplates(templates: TemplateDefinition[]): Promise<void> {
  const custom = extractCustomTemplates(templates).slice(0, MAX_CUSTOM_TEMPLATES);
  await chrome.storage.local.set({ [STORAGE_KEY]: custom });
}

export function extractCustomTemplates(templates: TemplateDefinition[]): TemplateDefinition[] {
  return templates.filter((t) => !isBuiltinTemplateId(t.id));
}

export function mergeBuiltinAndCustomTemplates(
  builtins: TemplateDefinition[],
  custom: TemplateDefinition[],
): TemplateDefinition[] {
  const customIds = new Set(custom.map((t) => t.id));
  return [...builtins.filter((t) => !customIds.has(t.id)), ...custom];
}
