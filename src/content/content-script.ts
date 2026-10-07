import { attachFloatingButtons, refreshFloatingButtons } from './floating-button';
import { copyText, insertIntoField, showToast } from './field-inserter';
import { getFocusedEmailInput } from './email-detector';

function onGenerateMessage(email: string, action: 'insert' | 'copy'): void {
  const field = getFocusedEmailInput();
  if (action === 'insert' && field) {
    insertIntoField(field, email);
  }
  copyText(email).then(() => {
    showToast(field && action === 'insert' ? 'Email inserted & copied' : 'Email copied');
  });
}

chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case 'CONTEXT_GENERATE':
      onGenerateMessage(message.email, message.action === 'insert' ? 'insert' : 'copy');
      break;
    case 'COPY_EMAIL':
      copyText(message.email).then(() => showToast('Email copied'));
      break;
    case 'COMMAND_GENERATE': {
      const field = getFocusedEmailInput();
      if (field) {
        insertIntoField(field, message.email);
        copyText(message.email).then(() => showToast('Email inserted & copied'));
      } else {
        copyText(message.email).then(() => showToast('Email copied'));
      }
      break;
    }
    case 'SESSION_UPDATED':
      break;
    default:
      break;
  }
});

function hookHistory(): void {
  const push = history.pushState.bind(history);
  const replace = history.replaceState.bind(history);
  history.pushState = (...args) => {
    push(...args);
    window.dispatchEvent(new Event('subaddress-url-change'));
  };
  history.replaceState = (...args) => {
    replace(...args);
    window.dispatchEvent(new Event('subaddress-url-change'));
  };
  window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('subaddress-url-change'));
  });
}

hookHistory();

attachFloatingButtons(document);

const observer = new MutationObserver(() => {
  refreshFloatingButtons();
});
observer.observe(document.documentElement, { childList: true, subtree: true });

window.addEventListener('subaddress-url-change', () => {
  chrome.runtime.sendMessage({ type: 'URL_CHANGED', url: location.href }, () => {
    void chrome.runtime.lastError;
  });
});
