# Design

## Context

See `proposal.md`. `check:docs` is deterministic and offline. Lighthouse needs a browser, a local HTTP origin, and several seconds per page, so folding it into `check:docs` would make the default gate slower and dependent on Chrome. The two gates therefore stay separate, and `check:quality` builds by default so it is useful on its own.

The first probe ran against a stale Astro preview server. Astro 7's preview command manages a singleton background process, which makes it unsuitable for a script that needs a dedicated, disposable origin. A small static server over `dist/` avoids port conflicts and server-manager state.

## Goals / Non-Goals

**Goals:**

- Catch accessibility, best-practice, SEO, and performance regressions on representative pages.
- Keep the check local and credential-free.
- Make failures actionable: page, category, score, minimum, and the audits that lost points.
- Reuse an existing build for release runs where `check:docs` already built `dist/`.

**Non-Goals:**

- Auditing every route on every run.
- Replacing manual screen-reader and keyboard testing.
- Testing real network conditions, remote hosts, or deployed previews.
- Making Chrome a dependency of the offline gate.

## Decisions

### 1. Lighthouse categories, not ad-hoc assertions

Use Lighthouse's `performance`, `accessibility`, `best-practices`, and `seo` categories. Accessibility, best practices, and SEO must be 100; performance has a floor of 90. The observed local range is 98-100, so 90 catches a real regression without failing on timing noise.

### 2. Five representative pages

Audit `/`, `/start/why-linux/`, `/engineering/gtk/`, `/design/accessibility/`, and `/platform/packaging/`. They cover the landing page, tutorial, a framework page, the accessibility statement, and the packaging guidance. This is a smoke sample, not full-site coverage.

### 3. Dedicated loopback static server

Serve `dist/` from `127.0.0.1` on an ephemeral port. The server resolves directory indexes, blocks path traversal, serves correct MIME types, and gzips text responses so transfer-size metrics resemble a real static host. It is closed in `finally` together with Chrome.

### 4. Chrome via `chrome-launcher`

Launch Chrome headless with `chrome-launcher` and pass its debugging port to Lighthouse. Both `lighthouse` and `chrome-launcher` are explicit dev dependencies so the script does not rely on a transitive package.

### 5. Build by default, `--no-build` for composition

`npm run check:quality` builds first, then audits. `--no-build` audits the current `dist/` so a release sequence can run `check:docs` once and then `check:quality -- --no-build`.

### 6. Failures list the audits that cost points

Category scores alone are not actionable. On failure, iterate the category's weighted audit refs, keep audits below 1, and print the audit ID, title, and display value when present.

## Risks / Trade-offs

- **Chrome availability differs by machine** → the gate is opt-in and documented as requiring a local Chrome; it is not part of `check:docs`.
- **Performance scores move with load** → use a 90 floor and run audits sequentially.
- **A five-page sample can miss a page-specific defect** → broad checks stay manual; the sample is a regression net, not proof of full coverage.
- **A custom static server could mis-serve an asset** → cover the common MIME types, test the audited pages, and check the build output in `dist/`.
- **Lighthouse major upgrades can change audit weights** → pin the dependency range and re-tune thresholds when upgrading.
