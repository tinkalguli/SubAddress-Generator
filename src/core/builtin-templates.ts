import type { TemplateDefinition } from '../types';
import {
  TIMESTAMP_NUMBER_PRESETS,
  TIMESTAMP_WORD_PRESETS,
  datetimeDisplayName,
  type TimestampFormatPreset,
} from './timestamp';
import { buildFixedEmailTemplate } from './fixed-email-template';

/** Default when nothing else matches (random-only). */
export const DEFAULT_TEMPLATE_ID = 'builtin-random';

export function presetTemplateName(p: Pick<TimestampFormatPreset, 'format'>): string {
  return datetimeDisplayName(p.format);
}

function formatToTemplateId(format: string): string {
  const slug = format.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  return `builtin-ts-${slug.slice(0, 48)}`;
}

function timestampTemplate(p: TimestampFormatPreset, priority: number): TemplateDefinition {
  return {
    id: formatToTemplateId(p.format),
    name: presetTemplateName(p),
    template: '{base}+{prefix}-{timestamp}@{domain}',
    prefix: 'test',
    timestampFormat: p.format,
    urlRule: null,
    priority,
    enabled: true,
  };
}

const ALL_DATE_TIME_PRESETS: TimestampFormatPreset[] = [
  ...TIMESTAMP_WORD_PRESETS,
  ...TIMESTAMP_NUMBER_PRESETS,
];

export const BUILTIN_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'builtin-random',
    name: 'Random code [random4]',
    template: '{base}+{prefix}-{random4}@{domain}',
    prefix: 'test',
    timestampFormat: 'DD-MM-YYYY-HH-mm-ss',
    urlRule: null,
    priority: 200,
    enabled: true,
  },
  ...ALL_DATE_TIME_PRESETS.map((p, i) => timestampTemplate(p, 100 - i)),
];

export function createDefaultTemplates(): TemplateDefinition[] {
  return BUILTIN_TEMPLATES.map((t) => ({ ...t }));
}

export function createEmptyTemplate(): TemplateDefinition {
  const first = ALL_DATE_TIME_PRESETS[0]!;
  return {
    id: `custom-${crypto.randomUUID().slice(0, 8)}`,
    name: 'Custom template',
    template: buildFixedEmailTemplate({ includeSuffix: false, random: 'random4' }),
    prefix: '',
    timestampFormat: first.format,
    urlRule: null,
    priority: 10,
    enabled: true,
  };
}
