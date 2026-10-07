# Publish to Chrome Web Store (quick checklist)

Total time: ~30–60 minutes after your [developer account](https://chrome.google.com/webstore/devconsole) is approved (one-time **$5** registration).

## 1. Build the upload ZIP

```bash
npm install
npm run pack:store
```

This runs `npm run build` and creates **`subaddress-generator-1.0.0.zip`** in the project root (contents of `dist/` only).

## 2. Host the privacy policy (required)

Chrome needs an **https://** link. Fastest path:

1. Create a GitHub repo and push this project (or only `public/privacy-policy.html`).
2. **Settings → Pages →** deploy from `main` / `/public` (or copy the file to `docs/` and use `/docs`).
3. Copy the live URL into the store listing (see `store/LISTING.md`).

## 3. Developer Dashboard

1. Open [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. **New item** → upload `subaddress-generator-1.0.0.zip`.
3. Fill **Store listing** using text from `store/LISTING.md`.
4. Upload **≥1 screenshot** of the popup (see LISTING.md).
5. **Privacy** → paste privacy policy URL; declare **no data sold**, user data stored locally.
6. **Distribution** → Public (or Unlisted for a soft launch).
7. **Submit for review**.

Review often takes **1–3 business days** (sometimes faster). Broad `all_urls` content scripts can add review time; justifications are in `store/LISTING.md`.

## 4. After approval

- Bump `"version"` in `public/manifest.json` and `package.json` for each update.
- Run `npm run pack:store` again and upload a new package in the same dashboard item.

## What’s included in the repo

| Item | Location |
|------|----------|
| Store ZIP script | `npm run pack:store` |
| Listing text | `store/LISTING.md` |
| Privacy policy (host this) | `public/privacy-policy.html` |
| Icons 16 / 48 / 128 | `public/icons/` |

## Optional (not required for first publish)

- Promo tile 440×280
- Support email in dashboard
- `homepage_url` in manifest pointing to GitHub README
