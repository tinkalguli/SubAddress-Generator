import type { SessionState } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { createDefaultTemplates } from '../core/builtin-templates';

let session: SessionState = {
  settings: { ...DEFAULT_SETTINGS },
  templates: createDefaultTemplates(),
  selectedTemplateId: null,
};

export function getSession(): SessionState {
  return {
    settings: { ...session.settings },
    templates: session.templates.map((t) => ({
      ...t,
      urlRule: t.urlRule ? { ...t.urlRule } : null,
    })),
    selectedTemplateId: session.selectedTemplateId,
  };
}

export function setSession(partial: Partial<SessionState>): SessionState {
  if (partial.settings) {
    session.settings = { ...session.settings, ...partial.settings };
  }
  if (partial.templates) {
    session.templates = partial.templates.map((t) => ({
      ...t,
      urlRule: t.urlRule ? { ...t.urlRule } : null,
    }));
  }
  if (partial.selectedTemplateId !== undefined) {
    session.selectedTemplateId = partial.selectedTemplateId;
  }
  return getSession();
}

export function incrementCounter(): number {
  session.settings.counter += 1;
  return session.settings.counter;
}
