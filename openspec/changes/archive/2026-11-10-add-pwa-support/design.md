# Design

## Context

See `proposal.md`. The site is a static Astro/Starlight build. It has a custom `Head.astro` override, a `public/` directory, and no client framework. The PWA layer can therefore stay small: a manifest, icons, a service worker, an offline page, and head tags.

## Goals / Non-Goals

**Goals:**

- Chrome/Android offers installation and uses a WebAPK when the criteria are met.
- iOS Safari can Add to Home Screen with the correct icon and standalone display.
- Previously visited pages and the shell work offline.
- The PWA output is validated by the local documentation gate.

**Non-Goals:**

- A native Android or iOS app.
- Push notifications, background sync, or a custom install-prompt UI.
- Offline search over the full Pagefind index. The shell and visited pages are cached; full search remains an online feature.
- Changing the site's visual design or content.

## Decisions

### 1. Manifest first, service worker second

The manifest defines what the installed app is; the service worker makes it reliable. Both are required for Android installability. The manifest is a public static file so it is served at `/manifest.webmanifest` with no build-time coupling.

### 2. Icons are generated from the existing mark

Use `sharp` (already a dependency) to render `src/assets/mark.svg` into:

- `icon-192.png` and `icon-512.png` for `purpose: any`;
- `icon-maskable-512.png` on a full-bleed dark background, with the mark inside the 80% safe zone;
- `apple-touch-icon.png` at 180×180 with an opaque background.

The generator lives in `scripts/generate-pwa-icons.mjs`; the PNGs are committed so the build does not depend on a generation step.

### 3. Service worker: network-first navigation, cache-first assets

Navigation requests try the network, cache the response, and fall back to the cached page or `/offline.html`. Hashed `_astro` assets and images are cache-first. The cache name is versioned; activation removes old caches. The worker registers only in production to avoid stale content during local development.

### 4. Offline page is a static public file

`public/offline.html` is copied into `dist/` and precached. It uses system fonts and a small inline stylesheet so it works without the site's asset graph.

### 5. Secure context is a documentation requirement

Service workers and installation require HTTPS or `localhost`. The production site is HTTPS. The LAN preview over `http://192.168.x.x` is not a secure context on a phone, so the docs must say to use `localhost`, a tunnel, or the deployed site for installation testing.

### 6. The check is deterministic and local

`check:pwa` reads the manifest, the built HTML, the service worker, and the icon files. It uses `sharp` to verify icon dimensions. It runs in `check:docs` after the build. It does not contact the network or a browser.

## Risks / Trade-offs

- **Stale cache after deployment** → version the cache and keep navigation network-first.
- **Large icons** → only three sizes plus the Apple icon; keep them optimized.
- **Offline search is incomplete** → state the limitation; visited pages and the shell remain available.
- **iOS install UI is manual** → document Share → Add to Home Screen; the manifest and icon are still required.
- **Service worker in dev** → skip registration when not in production.
