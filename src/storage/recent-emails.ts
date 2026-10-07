import { MAX_RECENT_EMAIL_LIMIT } from '../types';

const STORAGE_KEY = 'recentEmails';

async function getStored(): Promise<string[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const list = result[STORAGE_KEY];
  if (!Array.isArray(list)) return [];
  return list.filter((e): e is string => typeof e === 'string');
}

async function setStored(emails: string[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: emails });
}

export async function getRecentEmails(): Promise<string[]> {
  return getStored();
}

export async function clearRecentEmails(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEY);
}

export async function removeRecentEmail(email: string): Promise<void> {
  const list = await getStored();
  await setStored(list.filter((e) => e !== email));
}

export function clampRecentLimit(limit: number): number {
  if (!Number.isFinite(limit) || limit < 1) return 10;
  return Math.min(Math.floor(limit), MAX_RECENT_EMAIL_LIMIT);
}

export async function trimRecentEmailsToLimit(limit: number): Promise<string[]> {
  const max = clampRecentLimit(limit);
  let list = await getStored();
  if (list.length > max) {
    list = list.slice(0, max);
    await setStored(list);
  }
  return list;
}

/** limit comes from session settings, not persisted */
export async function addRecentEmail(email: string, limit: number): Promise<string[]> {
  const max = clampRecentLimit(limit);
  let list = await getStored();
  list = list.filter((e) => e !== email);
  list.unshift(email);
  if (list.length > max) {
    list = list.slice(0, max);
  }
  await setStored(list);
  return list;
}

/** Session-only helpers (not persisted) */
export function getRecentEmailLimit(sessionLimit: number): number {
  return clampRecentLimit(sessionLimit);
}

export function setRecentEmailLimit(_limit: number): number {
  return clampRecentLimit(_limit);
}
