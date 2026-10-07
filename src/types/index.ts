export type UrlMatchType =
  | 'domain'
  | 'hostname'
  | 'urlContains'
  | 'pathContains'
  | 'wildcard'
  | 'regex';

export interface UrlRule {
  type: UrlMatchType;
  pattern: string;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  template: string;
  prefix: string;
  timestampFormat: string;
  urlRule: UrlRule | null;
  priority: number;
  enabled: boolean;
}

export interface GeneratorSettings {
  primaryEmail: string;
  subaddressSeparator: string;
  internalSeparator: string;
  randomLength: number;
  timestampFormat: string;
  prefix: string;
  suffix: string;
  recentEmailLimit: number;
  /** Session-only: when false, new emails are not added to history */
  recentEmailsEnabled: boolean;
  /** Session-only counter for {counter} */
  counter: number;
  project: string;
  environment: string;
}

export interface ParsedEmail {
  base: string;
  domain: string;
  localPart: string;
}

export interface GenerateContext {
  url?: string;
  now?: Date;
  counter?: number;
  project?: string;
  environment?: string;
  prefix?: string;
  suffix?: string;
}

export type MessageType =
  | 'GET_SESSION'
  | 'SET_SESSION'
  | 'GENERATE'
  | 'GENERATE_RESULT'
  | 'GET_TAB_URL'
  | 'TAB_URL'
  | 'ADD_RECENT'
  | 'GET_RECENT'
  | 'RECENT_LIST'
  | 'CONTEXT_GENERATE'
  | 'COMMAND_GENERATE';

export interface SessionState {
  settings: GeneratorSettings;
  templates: TemplateDefinition[];
  selectedTemplateId: string | null;
}

export const DEFAULT_SETTINGS: GeneratorSettings = {
  primaryEmail: '',
  subaddressSeparator: '+',
  internalSeparator: '-',
  randomLength: 4,
  timestampFormat: 'DD-MM-YYYY-HH-mm-ss',
  prefix: 'test',
  suffix: '',
  recentEmailLimit: 10,
  recentEmailsEnabled: true,
  counter: 0,
  project: '',
  environment: '',
};

export const RECENT_EMAIL_LIMIT_PRESETS = [5, 10, 20, 50, 100] as const;
export const MAX_RECENT_EMAIL_LIMIT = 100;
