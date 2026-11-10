# Design

## Context

See `proposal.md`. The site is Astro Starlight with 34 built pages and a Pagefind index. The content already lives in Markdown/MDX, but the rendered HTML is the most complete representation: it includes asides, tables, Expressive Code blocks, and the MDX baseline page. Hand-maintaining a second Markdown tree would drift immediately.

The relevant emerging formats are:

- `llms.txt`: a curated Markdown index with an H1, a blockquote summary, H2 sections, and links to Markdown pages.
- `llms-full.txt`: the full concatenated content for one-fetch indexing.
- Per-page Markdown siblings: `/<page>.md`, often advertised with `rel="alternate"`.
- `AGENTS.md`: instructions for agents working in the repository, not the public docs themselves.
- MCP: interactive retrieval tools, added in a later change.

## Goals / Non-Goals

**Goals:**

- Generate agent docs deterministically from the built site.
- Keep one source of truth; no hand-maintained duplicate Markdown.
- Make every page discoverable from `llms.txt` and from its HTML `<head>`.
- Preserve code fences, tables, links, headings, and asides in the Markdown output.
- Keep the build static and free; no runtime service.

**Non-Goals:**

- `Accept: text/markdown` content negotiation. That needs a host/CDN rule and is deferred.
- Auth, rate limits, or a remote MCP endpoint.
- Agent-specific rewriting of the content. The generated Markdown should read like the authored page.
- Committing generated `.md` files. They are build artifacts.

## Decisions

### 1. Convert the rendered content, not the raw source

The generator runs after `astro build` and converts the `.sl-markdown-content` element of each `dist/**/index.html` with Turndown + GFM.

Why: this handles MDX, asides, tables, and Expressive Code consistently. Raw `.md` source would miss the baseline page’s MDX table and Starlight directives.

### 2. Use a custom Expressive Code rule

Expressive Code’s `<pre>` contains line `<div>`s. Turndown’s default pre handling can lose newlines or the language. A custom rule reads `data-language` and joins `.ec-line` text with newlines, producing a normal fenced code block.

Tables use `turndown-plugin-gfm`; anchor links and copy buttons are removed.

### 3. Output paths are siblings of the HTML routes

| HTML route | Markdown file | URL |
| --- | --- | --- |
| `/start/why-linux/` | `dist/start/why-linux.md` | `/start/why-linux.md` |
| `/` | `dist/index.md` | `/index.md` |
| `/reference/baseline/` | `dist/reference/baseline.md` | `/reference/baseline.md` |

`llms.txt` uses absolute URLs based on the configured site URL. The `.md` files work on any static host.

### 4. Add discovery links in `<head>`

Override Starlight’s `Head` component to render the existing head entries plus:

```html
<link rel="alternate" type="text/markdown" href="/start/why-linux.md" title="Markdown version" />
<link rel="describedby" href="/llms.txt" />
```

The 404 page is skipped because it is not useful documentation.

### 5. Generate the index from page metadata

Each generated page has frontmatter-like metadata:

```yaml
title: Why Linux Is Different
description: A model for building software...
url: https://linux-desktop.guide/start/why-linux/
section: Start Here
```

`llms.txt` groups pages under their section labels, in the same order as the sidebar. The `## Optional` section links `llms-full.txt` and the baseline.

### 6. Validate after generation

`npm run check:agent-docs` checks:

- `dist/llms.txt` exists, starts with exactly one H1, and contains every content page.
- `dist/llms-full.txt` exists and includes each page title.
- Every `dist/<slug>.md` exists and starts with `# <title>`.
- No `dist/404.md` is generated.

### 7. Keep content negotiation out of scope

Static hosting serves `.md` siblings and the `rel="alternate"` hint. `Accept: text/markdown` can be added later with a Cloudflare Worker or a host rule, but it is not required for discovery and would add a runtime dependency.

## Risks / Trade-offs

- **HTML-to-Markdown fidelity** → Test the baseline page, a page with code blocks, a table page, and an aside page. Fix the Turndown rules rather than editing generated files.
- **Selectors change on a Starlight upgrade** → The generator falls back to the first `h1` and skips pages without `.sl-markdown-content`; the check script catches missing output.
- **Duplicate `llms.txt` conventions** → Follow the common H1/blockquote/H2/link shape; do not invent a schema.
- **Generated artifacts are not committed** → `dist/` is already ignored; the check runs after build.
- **Agent content can be stale** → The pages carry the same review date and baseline links as the HTML; the future freshness pipeline applies to both.

## Migration Plan

No migration. Additive build-time output; rollback is a revert of the generator and config.

## Open Questions

None. Content negotiation and MCP are explicitly later changes.
