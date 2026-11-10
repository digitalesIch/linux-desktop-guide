# Tasks

## 1. Icons and manifest

- [x] 1.1 Add `scripts/generate-pwa-icons.mjs` and generate 192/512, maskable 512, and 180 px Apple icons.
- [x] 1.2 Add `public/manifest.webmanifest` with name, scope, display, colors, icons, and shortcuts.

## 2. Offline and installation

- [x] 2.1 Add `public/sw.js` with precache, navigation fallback, asset caching, and cache cleanup.
- [x] 2.2 Add `public/offline.html`.
- [x] 2.3 Add manifest, theme, iOS meta, Apple icon, and favicon links to `Head.astro`.
- [x] 2.4 Register the service worker in production only.

## 3. Validation

- [x] 3.1 Add `scripts/check-pwa.mjs` for the manifest, icons, head tags, service worker, and offline page.
- [x] 3.2 Add `check:pwa` and run it from `check:docs`.
- [x] 3.3 Document the HTTPS/localhost requirement and the install paths in `README.md` and `AGENTS.md`.

## 4. Verification

- [x] 4.1 Run `npm run check:docs`.
- [x] 4.2 Run `npm run check:quality`.
- [x] 4.3 Verify the manifest, icons, service worker, and offline page in `dist/`.
- [x] 4.4 Commit, merge to `main`, and archive the change.
