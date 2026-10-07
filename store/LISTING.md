# Chrome Web Store — listing copy

Paste these into the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole) when you upload the extension.

## Extension name
SubAddress Generator

## Summary (max ~132 characters)
Generate unique plus-address emails for QA and testing. Local-only—no accounts, no tracking.

## Detailed description
SubAddress Generator helps developers and QA engineers create unique, configurable **email subaddresses** (plus addressing) for signing up and testing on websites.

**Example:** `example@gmail.com` → `example+signup-a7k2@gmail.com`

**Features**
- Popup: primary email, template, prefix/suffix, generate and copy
- Built-in templates (random code or date/time patterns)
- Optional recent history (stored only on your device)
- Floating helper near email fields on web pages
- Context menu and keyboard shortcut (Ctrl+Shift+E / Cmd+Shift+E)

**Privacy**
- No backend, no analytics, no cloud sync
- Data stays in your browser (`chrome.storage.local`)
- Frontend-only extension

Subaddressing must be supported by your email provider.

## Category
Productivity

## Language
English

## Single purpose
Generate configurable email subaddresses for the user’s own testing workflows.

## Permission justifications (paste in “Privacy practices” / review notes)

| Permission | Why |
|------------|-----|
| storage | Save primary email, templates, prefix/suffix, and optional recent list locally. |
| activeTab | Use the active tab URL when generating (URL-based template rules). |
| contextMenus | Right-click “Generate email” on editable fields. |
| Host / content script (all URLs) | Inject UI only to detect email inputs and insert/copy when the user triggers generate. No data is uploaded. |

## Privacy policy URL
You must host `privacy-policy.html` at a **public HTTPS URL** before submitting.

**Fast options:**
1. Push this repo to GitHub → enable **GitHub Pages** for `/public` → use that URL.
2. Or upload `public/privacy-policy.html` to any static host (Netlify Drop, Cloudflare Pages, etc.).

Example URL shape: `https://YOUR_USERNAME.github.io/subaddress-generator/privacy-policy.html`

## Screenshots (required)
Take at least **one** screenshot (1280×800 or 640×400):
1. Open the extension popup with primary email filled and a template selected.

Optional: second screenshot showing recent history in the popup.

## Icon
Included in the package (`icons/icon128.png`).
