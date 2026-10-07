import type { ParsedEmail } from '../types';
import { formatTimestamp, formatTimestampWithSeparator } from './timestamp';
import { random4, random6, randomString } from './random';

export interface TemplateVars {
  base: string;
  domain: string;
  prefix: string;
  suffix: string;
  date: string;
  time: string;
  timestamp: string;
  random: string;
  random4: string;
  random6: string;
  counter: string;
  project: string;
  environment: string;
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  second: string;
}

export interface BuildVarsOptions {
  parsed: ParsedEmail;
  prefix: string;
  suffix: string;
  timestampFormat: string;
  internalSeparator: string;
  now: Date;
  counter: number;
  project: string;
  environment: string;
  randomLength: number;
}

export function buildTemplateVars(options: BuildVarsOptions): TemplateVars {
  const {
    parsed,
    prefix,
    suffix,
    timestampFormat,
    internalSeparator,
    now,
    counter,
    project,
    environment,
    randomLength,
  } = options;

  const ts = formatTimestampWithSeparator(timestampFormat, now, internalSeparator);
  const dateStr = formatTimestamp('DD-MMM-YYYY', now);
  const timeStr = formatTimestamp('HHmm', now);

  const r4 = random4();
  const r6 = random6();
  const rLen = randomLength > 0 ? randomLength : 4;
  const r = randomString(rLen);

  return {
    base: parsed.base,
    domain: parsed.domain,
    prefix,
    suffix,
    date: dateStr,
    time: timeStr,
    timestamp: ts,
    random: r,
    random4: r4,
    random6: r6,
    counter: String(counter),
    project,
    environment,
    year: formatTimestamp('YYYY', now),
    month: formatTimestamp('MM', now),
    day: formatTimestamp('DD', now),
    hour: formatTimestamp('HH', now),
    minute: formatTimestamp('mm', now),
    second: formatTimestamp('ss', now),
  };
}

const VAR_PATTERN = /\{(\w+)\}/g;

export function applyTemplate(template: string, vars: TemplateVars): string {
  return template.replace(VAR_PATTERN, (_, key: string) => {
    const k = key as keyof TemplateVars;
    return vars[k] ?? '';
  });
}

/** Apply internal separator to segments between template parts (after variable expansion) */
export function normalizeInternalSeparators(text: string, internalSeparator: string): string {
  if (internalSeparator === '-') return text;
  return text.replace(/-/g, internalSeparator);
}
