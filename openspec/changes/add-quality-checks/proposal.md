# Proposal

## Why

The guide claims to be fast and accessible, but those claims are only checked by hand. The existing `check:docs` gate is deliberately offline and text-focused: it validates content, builds, links, and the MCP server, but it cannot catch a contrast regression, a broken landmark, a missing meta description, or a performance cliff.

The project needs a repeatable browser-based check that runs on the built site and fails when a quality budget is missed.

## What Changes

- Add `scripts/check-quality.mjs`:
  - builds the site unless `--no-build` is passed;
  - serves `dist/` from a loopback-only ephemeral HTTP port with gzip and correct MIME types;
  - launches a local Chrome through `chrome-launcher`;
  - runs Lighthouse against five representative pages: landing, start, engineering, design/accessibility, and packaging;
  - requires accessibility, best practices, and SEO at 100 and performance at 90 or higher;
  - reports per-page scores and the failing audits with their values.
- Add the `check:quality` npm script.
- Add `lighthouse` and `chrome-launcher` as dev dependencies.
- Add explicit `width`/`height` to the hero image so Lighthouse does not flag an unsized image.
- Document `check:quality` in `README.md` and `AGENTS.md`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `docs-tooling`: add a browser-based quality gate alongside the offline documentation gate.

## Impact

- `scripts/check-quality.mjs` (new)
- `package.json`, `package-lock.json`
- `src/content/docs/index.mdx` (hero image dimensions)
- `README.md`, `AGENTS.md`
- OpenSpec: `docs-tooling` requirement added.
- No site routes, content meaning, or publishing changes.
