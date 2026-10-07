import { getRecentEmails } from './recent-emails';

const STORAGE_KEY = 'lastUsed';

export interface LastUsedSnapshot {
  primaryEmail: string;
  prefix: string;
  suffix: string;
  /** Last template id used for generation */
  lastTemplateId: string | null;
  selectedTemplateId: string | null;
  lastGeneratedEmail?: string;
}

function normalizeSelectedTemplateId(o: Record<string, unknown>): string | null {
  const manual = o.manualOverrideTemplateId;
  if (typeof manual === 'string' && manual) return manual;
  const selected = o.selectedTemplateId;
  if (typeof selected === 'string' && selected !== 'auto') return selected;
  return null;
}

async function read(): Promise<LastUsedSnapshot | null> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const raw = result[STORAGE_KEY];
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.primaryEmail !== 'string') return null;
  return {
    primaryEmail: o.primaryEmail,
    prefix: typeof o.prefix === 'string' ? o.prefix : 'test',
    suffix: typeof o.suffix === 'string' ? o.suffix : '',
    lastTemplateId: typeof o.lastTemplateId === 'string' ? o.lastTemplateId : null,
    selectedTemplateId: normalizeSelectedTemplateId(o),
    lastGeneratedEmail:
      typeof o.lastGeneratedEmail === 'string' ? o.lastGeneratedEmail : undefined,
  };
}

export async function getLastUsed(): Promise<LastUsedSnapshot | null> {
  return read();
}

export async function saveLastUsed(snapshot: LastUsedSnapshot): Promise<void> {
  if (!snapshot.primaryEmail.trim()) return;
  const existing = await read();
  const merged = { ...(existing ?? {}), ...snapshot, primaryEmail: snapshot.primaryEmail };
  await chrome.storage.local.set({ [STORAGE_KEY]: merged });
}

export async function saveLastGeneratedEmail(email: string): Promise<void> {
  const existing = await read();
  if (!existing?.primaryEmail.trim()) {
    await chrome.storage.local.set({
      [STORAGE_KEY]: { lastGeneratedEmail: email },
    });
    return;
  }
  await chrome.storage.local.set({
    [STORAGE_KEY]: { ...existing, lastGeneratedEmail: email },
  });
}

export async function getLastGeneratedEmail(): Promise<string> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const raw = result[STORAGE_KEY];
  if (!raw || typeof raw !== 'object') return '';
  const email = (raw as Record<string, unknown>).lastGeneratedEmail;
  return typeof email === 'string' ? email : '';
}

/** Last generated address, or newest recent history entry. */
export async function resolveLastGeneratedEmail(): Promise<string> {
  const stored = await getLastGeneratedEmail();
  if (stored) return stored;
  const recent = await getRecentEmails();
  const newest = recent[0] ?? '';
  if (newest) {
    await saveLastGeneratedEmail(newest);
  }
  return newest;
}

export async function clearLastUsed(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEY);
}
