# Proposal

## Why

The guide is read on phones and tablets as well as desktops. A browser tab is the wrong shape for a field guide: it loses the reading context, cannot be opened from the Android app launcher, and does not work when the network drops.

An installable Progressive Web App fixes that without a separate mobile codebase. Android can install it as a WebAPK and show it in the app launcher. iOS can add it to the home screen. Both get the same content, the same URL, and an offline shell.

## What Changes

- Add `public/manifest.webmanifest`:
  - name, short name, description, language, start URL, scope;
  - standalone display, theme and background colors;
  - 192 px and 512 px icons, a maskable 512 px icon, and an Apple touch icon;
  - optional shortcuts to Platform Targets, the Native Standard, and the Quality Bar.
- Generate the PNG icons from the existing mark:
  - 192×192 and 512×512 for the manifest;
  - a full-bleed 512×512 maskable icon with a safe zone;
  - a 180×180 opaque Apple touch icon.
- Add `public/sw.js`:
  - precache the shell, manifest, icons, and offline page;
  - network-first navigation with a cached fallback;
  - cache-first static assets;
  - versioned cache cleanup.
- Add `public/offline.html` as a branded offline fallback.
- Register the service worker in `Head.astro` in production only.
- Add the PWA head tags: manifest, theme color, application name, iOS meta tags, Apple touch icon, and 192/512 favicons.
- Add `scripts/check-pwa.mjs`:
  - validates manifest fields and icon files;
  - checks the built HTML for the head tags and service-worker registration;
  - checks the service worker has install, activate, and fetch handlers;
  - checks the offline page exists.
- Add `check:pwa` to `check:docs`.

## Capabilities

### New Capabilities

- `docs-pwa`: installable web-app metadata, icons, offline shell, and platform-specific head tags.

### Modified Capabilities

- `docs-tooling`: the documentation gate validates the PWA output.

## Impact

- `public/manifest.webmanifest`, `public/sw.js`, `public/offline.html`, `public/icons/*`
- `src/components/Head.astro`
- `scripts/generate-pwa-icons.mjs`, `scripts/check-pwa.mjs`
- `package.json`, `scripts/check-docs.mjs`
- `README.md`, `AGENTS.md`
- No change to the documentation content or the target matrix.
