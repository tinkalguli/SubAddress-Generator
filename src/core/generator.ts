import type { GenerateContext, GeneratorSettings, TemplateDefinition } from '../types';
import { EXAMPLE_PRIMARY_EMAIL } from '../constants/demo';
import { getGenerationBase } from './email-parser';
import {
  applyTemplate,
  buildTemplateVars,
  normalizeInternalSeparators,
} from './template-engine';
import { getEffectiveTemplate } from './template-selector';
import { normalizePlusLocalPart } from './fixed-email-template';

export interface GenerateOptions {
  settings: GeneratorSettings;
  templates: TemplateDefinition[];
  selectedTemplateId: string | null;
  context?: GenerateContext;
}

export interface GenerateResult {
  email: string;
  template: TemplateDefinition;
  nextCounter: number;
}

export function generateEmail(options: GenerateOptions): GenerateResult | null {
  const { settings, templates, selectedTemplateId, context = {} } = options;

  const parsed = getGenerationBase(settings.primaryEmail);
  if (!parsed) return null;

  const template = getEffectiveTemplate(templates, selectedTemplateId);
  if (!template) return null;

  const now = context.now ?? new Date();
  const counter = context.counter ?? settings.counter + 1;
  const prefix = context.prefix ?? settings.prefix;
  const suffix = context.suffix ?? settings.suffix;

  const timestampFormat = template.timestampFormat || settings.timestampFormat;

  const vars = buildTemplateVars({
    parsed,
    prefix,
    suffix,
    timestampFormat,
    internalSeparator: settings.internalSeparator,
    now,
    counter,
    project: context.project ?? settings.project,
    environment: context.environment ?? settings.environment,
    randomLength: settings.randomLength,
  });

  let body = applyTemplate(template.template, vars);
  body = normalizeInternalSeparators(body, settings.internalSeparator);
  const atForClean = body.indexOf('@');
  if (atForClean > 0) {
    body =
      normalizePlusLocalPart(body.slice(0, atForClean), settings.internalSeparator) +
      body.slice(atForClean);
  }

  const sep = settings.subaddressSeparator;
  if (sep !== '+' && body.includes('+')) {
    const atIdx = body.indexOf('@');
    if (atIdx > 0) {
      const local = body.slice(0, atIdx);
      const domain = body.slice(atIdx);
      const plusIdx = local.indexOf('+');
      if (plusIdx >= 0) {
        body = local.slice(0, plusIdx) + sep + local.slice(plusIdx + 1) + domain;
      }
    }
  }

  const email = body.trim().toLowerCase();
  if (!email.includes('@')) return null;
  return { email, template, nextCounter: counter };
}

/** Preview with fixed sample random for UI */
export function previewEmail(
  settings: GeneratorSettings,
  template: TemplateDefinition,
  sampleRandom = 'a7k2',
): string | null {
  const parsed = getGenerationBase(EXAMPLE_PRIMARY_EMAIL);
  if (!parsed) return null;

  const now = new Date(2026, 8, 23, 10, 30, 45);
  const vars = buildTemplateVars({
    parsed,
    prefix: settings.prefix,
    suffix: settings.suffix,
    timestampFormat: template.timestampFormat || settings.timestampFormat,
    internalSeparator: settings.internalSeparator,
    now,
    counter: 1,
    project: settings.project || 'proj',
    environment: settings.environment || 'staging',
    randomLength: settings.randomLength,
  });
  vars.random4 = sampleRandom;
  vars.random6 = sampleRandom + '9f';
  vars.random = sampleRandom;

  let body = applyTemplate(template.template, vars);
  body = normalizeInternalSeparators(body, settings.internalSeparator);
  const atForClean = body.indexOf('@');
  if (atForClean > 0) {
    body =
      normalizePlusLocalPart(body.slice(0, atForClean), settings.internalSeparator) +
      body.slice(atForClean);
  }
  return body;
}
