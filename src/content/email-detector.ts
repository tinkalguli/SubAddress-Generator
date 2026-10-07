export function isEmailInput(element: Element): element is HTMLInputElement | HTMLTextAreaElement {
  if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
    return false;
  }
  if (element instanceof HTMLInputElement) {
    const type = (element.type || '').toLowerCase();
    if (type === 'password' || type === 'hidden' || type === 'checkbox' || type === 'radio') {
      return false;
    }
    if (type === 'email') return true;
  }
  const name = (element.getAttribute('name') || '').toLowerCase();
  const id = (element.id || '').toLowerCase();
  const autocomplete = (element.getAttribute('autocomplete') || '').toLowerCase();
  const placeholder = (element.getAttribute('placeholder') || '').toLowerCase();

  const hints = ['email', 'user_email', 'useremail', 'e-mail'];
  if (hints.some((h) => name === h || id === h)) return true;
  if (name.includes('email') && !name.includes('password')) return true;
  if (id.includes('email') && !id.includes('password')) return true;
  if (autocomplete === 'email') return true;
  if (placeholder.includes('email') || placeholder.includes('@')) return true;

  if (name === 'username' || id === 'username') {
    if (element instanceof HTMLInputElement) {
      const inputType = (element.type || '').toLowerCase();
      if (inputType === 'email' || autocomplete === 'email') return true;
    }
    if (placeholder.includes('@')) return true;
  }
  return false;
}

export function findEmailInputs(root: ParentNode = document): (HTMLInputElement | HTMLTextAreaElement)[] {
  const inputs = root.querySelectorAll('input, textarea');
  const result: (HTMLInputElement | HTMLTextAreaElement)[] = [];
  inputs.forEach((el) => {
    if (isEmailInput(el)) result.push(el);
  });
  return result;
}

export function getFocusedEmailInput(): HTMLInputElement | HTMLTextAreaElement | null {
  const active = document.activeElement;
  if (active && isEmailInput(active)) return active;
  return null;
}
