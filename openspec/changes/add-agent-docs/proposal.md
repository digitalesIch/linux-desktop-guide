# Proposal

## Why

The guide is currently optimized for human readers: HTML, navigation, search, and visual components. Agents need a smaller, stable surface: a curated index, clean Markdown, canonical URLs, and page-level discovery. Today an agent has to parse the full Starlight HTML or crawl the site, which wastes context and makes it harder to cite the right page.

The common pattern in 2026 is not a separate hand-written manual. It is the same source published in several agent-friendly forms: `llms.txt`, `llms-full.txt`, per-page Markdown, and a `<link rel="alternate" type="text/markdown">` hint. MCP is the interactive layer on top, not a replacement for static docs.

## What Changes

- Add a build step that generates, from the built documentation:
  - `/llms.txt` — a curated Markdown index grouped by section, linking to every page’s Markdown version.
  - `/llms-full.txt` — the complete documentation in one Markdown file for bulk indexing and large-context use.
  - `/<page>.md` — a clean Markdown version of every content page, with title, description, canonical URL, section, and body.
- Add `<link rel="alternate" type="text/markdown">` and `<link rel="describedby" href="/llms.txt">` to every HTML page via a small Starlight `Head` override.
- Add `npm run check:agent-docs` to verify the generated index, full text, and per-page files.
- Add a short “Agent access” section to `reference/resources` and document the endpoints in `README.md`.
- Add a “Documentation for agents” section to `AGENTS.md` so repo agents use the Markdown surface.
- Do not add content negotiation (`Accept: text/markdown`) in this change: static hosting cannot do it without a worker or CDN rule. The `.md` siblings and `rel="alternate"` work on any static host.

## Capabilities

### New Capabilities

None. This is a documentation-publishing change with no application behavior or public API changes. The change opts out of spec deltas with `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- New dependencies: `turndown`, `turndown-plugin-gfm`, `linkedom` (build-time only).
- New `scripts/generate-agent-docs.mjs`, `scripts/check-agent-docs.mjs`.
- New `src/components/Head.astro` override.
- `astro.config.mjs`, `package.json`, `AGENTS.md`, `README.md`, `reference/resources.md`.
- Generated files under `dist/` only; no duplicated Markdown is committed.
