import { isEmailInput } from './email-detector';
import { copyText, insertIntoField, showToast } from './field-inserter';

const BTN_CLASS = 'subaddress-gen-fab';
const WRAP_CLASS = 'subaddress-gen-wrap';

function createButton(): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = BTN_CLASS;
  btn.title = 'Generate subaddress email';
  btn.setAttribute('aria-label', 'Generate subaddress email');
  btn.textContent = '✨';
  Object.assign(btn.style, {
    position: 'absolute',
    right: '4px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '28px',
    height: '28px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    background: '#6366f1',
    color: '#fff',
    fontSize: '14px',
    lineHeight: '1',
    padding: '0',
    zIndex: '9999',
    boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
  });
  return btn;
}

function wrapField(field: HTMLInputElement | HTMLTextAreaElement): void {
  if (field.dataset.subaddressWrapped === '1') return;
  const parent = field.parentElement;
  if (!parent) return;
  field.dataset.subaddressWrapped = '1';

  const wrap = document.createElement('div');
  wrap.className = WRAP_CLASS;
  Object.assign(wrap.style, {
    position: 'relative',
    display: 'inline-block',
    width: field.offsetWidth ? `${field.offsetWidth}px` : '100%',
    maxWidth: '100%',
  });

  parent.insertBefore(wrap, field);
  wrap.appendChild(field);

  if (field.style.width) {
    wrap.style.width = field.style.width;
  } else {
    field.style.width = '100%';
    field.style.boxSizing = 'border-box';
    field.style.paddingRight = '36px';
  }

  const btn = createButton();
  wrap.appendChild(btn);

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    chrome.runtime.sendMessage({ type: 'GENERATE', url: location.href }, async (resp) => {
      if (chrome.runtime.lastError || !resp?.email) {
        showToast(resp?.error ?? 'Could not generate email');
        return;
      }
      insertIntoField(field, resp.email);
      await copyText(resp.email);
      showToast('Email generated & copied');
    });
  });
}

export function attachFloatingButtons(root: ParentNode = document): void {
  const inputs = root.querySelectorAll('input, textarea');
  inputs.forEach((el) => {
    if (isEmailInput(el)) wrapField(el);
  });
}

export function refreshFloatingButtons(): void {
  attachFloatingButtons(document);
}
