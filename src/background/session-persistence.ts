import type { SessionState, TemplateDefinition } from '../types';
import { createDefaultTemplates } from '../core/builtin-templates';
import { getLastUsed, saveLastUsed, type LastUsedSnapshot } from '../storage/last-used';
import {
  getCustomTemplates,
  mergeBuiltinAndCustomTemplates,
  saveCustomTemplates,
  extractCustomTemplates,
} from '../storage/custom-templates';
import { trimRecentEmailsToLimit } from '../storage/recent-emails';
import { getSession, setSession } from './session-state';

let hydrated = false;

export async function loadMergedTemplates(): Promise<TemplateDefinition[]> {
  const custom = await getCustomTemplates();
  return mergeBuiltinAndCustomTemplates(createDefaultTemplates(), custom);
}

export async function persistCustomTemplatesFromSession(session: SessionState): Promise<void> {
  await saveCustomTemplates(extractCustomTemplates(session.templates));
}

export async function hydrateSessionFromStorage(): Promise<void> {
  if (hydrated) return;
  const templates = await loadMergedTemplates();
  const last = await getLastUsed();
  const partial: Partial<SessionState> = { templates };
  if (last?.primaryEmail.trim()) {
    partial.settings = {
      ...getSession().settings,
      primaryEmail: last.primaryEmail,
      prefix: last.prefix,
      suffix: last.suffix,
    };
    partial.selectedTemplateId = last.selectedTemplateId;
  }
  setSession(partial);
  await trimRecentEmailsToLimit(getSession().settings.recentEmailLimit);
  hydrated = true;
}

export function snapshotFromSession(session: SessionState): LastUsedSnapshot {
  return {
    primaryEmail: session.settings.primaryEmail,
    prefix: session.settings.prefix,
    suffix: session.settings.suffix,
    lastTemplateId: session.selectedTemplateId,
    selectedTemplateId: session.selectedTemplateId,
  };
}

export async function persistLastUsedFromSession(session?: SessionState): Promise<void> {
  const s = session ?? getSession();
  if (!s.settings.primaryEmail.trim()) return;
  await saveLastUsed(snapshotFromSession(s));
}

export async function persistAfterGenerate(
  session: SessionState,
  templateIdUsed: string,
  generatedEmail: string,
): Promise<void> {
  const snapshot: LastUsedSnapshot = {
    primaryEmail: session.settings.primaryEmail,
    prefix: session.settings.prefix,
    suffix: session.settings.suffix,
    lastTemplateId: templateIdUsed,
    selectedTemplateId: templateIdUsed,
    lastGeneratedEmail: generatedEmail,
  };
  setSession({ selectedTemplateId: templateIdUsed });
  await saveLastUsed(snapshot);
}

export function resetHydrationForTests(): void {
  hydrated = false;
}
