import type { SessionState } from '../types';

export function sendMessage<T = unknown>(message: object): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response as T);
    });
  });
}

export async function getSessionFromBackground(): Promise<SessionState> {
  return sendMessage<SessionState>({ type: 'GET_SESSION' });
}

export async function setSessionOnBackground(partial: Partial<SessionState>): Promise<SessionState> {
  return sendMessage<SessionState>({ type: 'SET_SESSION', payload: partial });
}

export async function generateViaBackground(url?: string): Promise<{ email: string | null; error?: string }> {
  return sendMessage({ type: 'GENERATE', url });
}

export async function getLastGeneratedFromBackground(): Promise<string> {
  const resp = await sendMessage<{ email: string }>({ type: 'GET_LAST_GENERATED' });
  return resp.email ?? '';
}

export async function getRecentFromBackground(): Promise<string[]> {
  const resp = await sendMessage<{ emails: string[] }>({ type: 'GET_RECENT' });
  return resp.emails ?? [];
}

export async function getActiveTabUrl(): Promise<string | undefined> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab?.url;
}
