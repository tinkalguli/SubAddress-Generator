# SubAddress Generator

Chrome extension for developers and QA engineers to generate unique, configurable **email subaddresses** (plus addressing) for testing websites and applications.

Example: `example@gmail.com` → `example+signup-a7k2@gmail.com`

## Privacy

- **Frontend-only** — no backend, API, authentication, database, or cloud sync
- **No analytics, telemetry, or external requests**
- The only persisted data in `chrome.storage.local` is: recent email strings (when history is on), your **custom templates**, plus your last **primary email**, **prefix**, and **template** choice
- Built-in templates and other settings live in **session memory** and reset when the service worker reloads (custom templates are reloaded from storage)

## Development

```bash
npm install
npm run typecheck
npm run test
npm run build
```

Load the extension:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select the `dist/` folder

## Chrome Web Store

To publish publicly, follow **[CHROME_WEB_STORE.md](./CHROME_WEB_STORE.md)**. Quick build for upload:

```bash
npm run pack:store
```

This produces `subaddress-generator-1.0.0.zip` for the [Developer Dashboard](https://chrome.google.com/webstore/devconsole).

## Usage

- **Popup**: primary email, template, prefix/suffix, generate and copy, optional recent history
- **Floating ✨ button** next to detected email fields on web pages
- **Context menu** on editable fields: Generate / Generate and insert / Generate and copy
- **Shortcut**: `Ctrl+Shift+E` (Windows/Linux) or `Cmd+Shift+E` (Mac)

Subaddressing support depends on your email provider.

## Project structure

See `src/` — core generation logic is framework-agnostic; React is used for the popup UI only.

## License

MIT
