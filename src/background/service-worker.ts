import { generateEmail } from '../core/generator';
import { resolveLastGeneratedEmail } from '../storage/last-used';
import { addRecentEmail, trimRecentEmailsToLimit } from '../storage/recent-emails';
import { getSession, setSession, incrementCounter } from './session-state';
import {
  hydrateSessionFromStorage,
  persistLastUsedFromSession,
  persistAfterGenerate,
  persistCustomTemplatesFromSession,
} from './session-persistence';

const MENU_ID = 'subaddress-generator';

let contextMenusReady: Promise<void> | null = null;

function createContextMenu(
  props: chrome.contextMenus.CreateProperties,
): Promise<void> {
  return new Promise((resolve) => {
    chrome.contextMenus.create(props, () => {
      if (chrome.runtime.lastError) {
        console.warn('contextMenus.create:', chrome.runtime.lastError.message);
      }
      resolve();
    });
  });
}

function setupContextMenus(): Promise<void> {
  if (contextMenusReady) return contextMenusReady;

  contextMenusReady = new Promise((resolve) => {
    chrome.contextMenus.removeAll(() => {
      if (chrome.runtime.lastError) {
        console.warn('contextMenus.removeAll:', chrome.runtime.lastError.message);
      }
      void (async () => {
        await createContextMenu({
          id: MENU_ID,
          title: 'SubAddress Generator',
          contexts: ['editable'],
        });
        await createContextMenu({
          id: `${MENU_ID}-generate`,
          parentId: MENU_ID,
          title: 'Generate email',
          contexts: ['editable'],
        });
        await createContextMenu({
          id: `${MENU_ID}-insert`,
          parentId: MENU_ID,
          title: 'Generate and insert',
          contexts: ['editable'],
        });
        await createContextMenu({
          id: `${MENU_ID}-copy`,
          parentId: MENU_ID,
          title: 'Generate and copy',
          contexts: ['editable'],
        });
        resolve();
      })();
    });
  });

  return contextMenusReady;
}

function safeHydrate(): Promise<void> {
  return hydrateSessionFromStorage().catch((err) => {
    console.error('hydrateSessionFromStorage failed', err);
    contextMenusReady = null;
  });
}

chrome.runtime.onInstalled.addListener(() => {
  contextMenusReady = null;
  void setupContextMenus();
  void safeHydrate();
});

void setupContextMenus();
void safeHydrate();

async function runGenerate(tabUrl: string | undefined): Promise<{
  email: string | null;
  error?: string;
}> {
  await safeHydrate();
  const session = getSession();
  if (!session.settings.primaryEmail.trim()) {
    return { email: null, error: 'Set primary email in the extension popup' };
  }
  if (!session.selectedTemplateId) {
    return { email: null, error: 'Select a template' };
  }
  const counter = incrementCounter();
  const result = generateEmail({
    settings: session.settings,
    templates: session.templates,
    selectedTemplateId: session.selectedTemplateId,
    context: { url: tabUrl, counter },
  });
  if (!result) {
    return { email: null, error: 'Could not generate email' };
  }
  setSession({ settings: { ...session.settings, counter: result.nextCounter } });
  if (session.settings.recentEmailsEnabled) {
    await addRecentEmail(result.email, session.settings.recentEmailLimit);
  }
  await persistAfterGenerate(getSession(), result.template.id, result.email);
  return { email: result.email };
}

function sendTabMessage(tabId: number, message: object): void {
  chrome.tabs.sendMessage(tabId, message, () => {
    if (chrome.runtime.lastError) {
      console.warn('tabs.sendMessage:', chrome.runtime.lastError.message);
    }
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const handle = async () => {
    await safeHydrate();
    switch (message.type) {
      case 'GET_SESSION':
        return getSession();
      case 'SET_SESSION': {
        const payload = message.payload ?? {};
        let next = setSession(payload);
        if (payload.settings?.recentEmailLimit != null) {
          await trimRecentEmailsToLimit(next.settings.recentEmailLimit);
        }
        if (payload.templates) {
          await persistCustomTemplatesFromSession(next);
          if (
            next.selectedTemplateId &&
            !next.templates.some((t) => t.id === next.selectedTemplateId && t.enabled)
          ) {
            next = setSession({ selectedTemplateId: null });
          }
        }
        if (
          payload.settings?.primaryEmail != null ||
          payload.settings?.prefix != null ||
          payload.settings?.suffix != null ||
          payload.selectedTemplateId !== undefined
        ) {
          await persistLastUsedFromSession(next);
        }
        return next;
      }
      case 'GET_LAST_GENERATED':
        return { email: await resolveLastGeneratedEmail() };
      case 'GET_RECENT': {
        const session = getSession();
        const emails = await trimRecentEmailsToLimit(session.settings.recentEmailLimit);
        return { emails };
      }
      case 'GENERATE': {
        const tabUrl = message.url as string | undefined;
        return runGenerate(tabUrl);
      }
      case 'ADD_RECENT': {
        const email = message.email as string;
        const limit = message.limit as number;
        const emails = await addRecentEmail(email, limit);
        return { emails };
      }
      case 'CLIPBOARD_WRITE': {
        try {
          await navigator.clipboard.writeText(message.text);
          return { ok: true };
        } catch {
          return { ok: false };
        }
      }
      case 'URL_CHANGED':
        return { ok: true };
      default:
        return { error: 'unknown message' };
    }
  };

  handle()
    .then(sendResponse)
    .catch((err) => {
      console.error('onMessage handler failed', err);
      sendResponse({ error: err instanceof Error ? err.message : 'Internal error' });
    });
  return true;
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const id = info.menuItemId.toString();
  if (!id.startsWith(MENU_ID)) return;
  const tabUrl = tab?.url;
  const gen = await runGenerate(tabUrl);
  if (!gen.email || !tab?.id) return;

  if (id.endsWith('-insert')) {
    sendTabMessage(tab.id, {
      type: 'CONTEXT_GENERATE',
      email: gen.email,
      action: 'insert',
    });
  } else if (id.endsWith('-copy')) {
    sendTabMessage(tab.id, {
      type: 'COPY_EMAIL',
      email: gen.email,
    });
  } else if (id.endsWith('-generate')) {
    sendTabMessage(tab.id, {
      type: 'CONTEXT_GENERATE',
      email: gen.email,
      action: 'copy',
    });
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'generate-email') return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const gen = await runGenerate(tab?.url);
  if (!gen.email || !tab?.id) return;
  sendTabMessage(tab.id, {
    type: 'COMMAND_GENERATE',
    email: gen.email,
  });
});
