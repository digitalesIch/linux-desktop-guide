## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Scope and targets

This is a target-based field guide, not a distro-agnostic tutorial. The supported matrix is in `src/data/targets.json`; the selection method and evidence are in `src/content/docs/targets/selection.md`. Do not add a distribution/toolkit combination without evidence and without updating the matrix. Each reference target has one default stack and HIG; alternatives are secondary and must be documented as trade-offs. The full evidence report is maintained outside this repository; it is internal and not published.

## House style

Before editing or adding content, read `src/content/docs/reference/style-guide.md`. It is the canonical guide for voice, page shape, terminology, code, links, screenshots, accessibility, localization, and agent-facing Markdown. Platform terms stay in `src/content/docs/reference/glossary.md`; do not create a second glossary. Run `npm run check:docs` after content changes.

When you find a documentation defect, report it instead of silently rewriting the page: include the page slug, section, quote, expected and actual result, version, target, and the source that contradicts the page. Agents are readers and reviewers, not publishers. The docs MCP server is read-only and must stay that way.

Report through `/reference/feedback/` or from the command line:

```
gh issue create --repo digitalesIch/linux-desktop-guide \
  --title "[Docs] <short description>" \
  --body-file /tmp/docs-feedback.md
```

The issue form asks for page, section, quote, expected, actual, version, target, reporter type, and source. The repository is public; readers need a GitHub account to open an issue.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## PWA

The site is installable. The manifest, service worker, offline page, and icons live in `public/`; the head tags and production-only registration live in `src/components/Head.astro`. Run `npm run check:pwa` after changing any of them; regenerate the PNGs with `npm run generate:pwa-icons`. Installation and service workers require HTTPS or `localhost`; the LAN preview over plain HTTP is not a secure context on phones. Bump `CACHE_VERSION` in `public/sw.js` when the shell or cache strategy changes.

## Documentation for agents

The public guide is published for agents as well as humans. After `npm run build`:

- `/llms.txt` — curated index of every page in Markdown.
- `/llms-full.txt` — the complete guide in one file.
- Append `.md` to a page route for a clean Markdown version, for example `/start/why-linux.md`.

Run `npm run check:docs` before releasing. It performs baseline validation, tutorial/example consistency checking, target-matrix validation, a full build, PWA validation, agent-doc validation, MCP tests, and internal link/anchor checking. The default gate is offline. External link checks are opt-in with `npm run check:links:external`; unreachable hosts are warnings unless `check:links:external:strict` is used.

Run `npm run check:quality` for the browser-based gate. It serves `dist/`, runs Lighthouse on representative pages, requires accessibility, best practices, and SEO at 100, and keeps performance at or above 90. It needs a local Chrome and is intentionally separate from the offline `check:docs` gate. Add `-- --no-build` to reuse an existing build.

Do not edit `dist/`; it is generated.

## Documentation MCP server

The project registers a local, read-only MCP server named `docs` in `opencode.jsonc`. Use it to search and read this guide efficiently:

1. Call `search_docs` first.
2. Pass a returned slug to `get_page`.
3. Use `list_pages` to browse, `get_related` after a page, and `get_baseline` for the Ubuntu/GNOME reference baseline. The full target matrix is in `src/data/targets.json`.

The server runs over stdio with `npm run mcp:docs`. It indexes `src/content/docs/**/*.md`, rejects path traversal, writes nothing, and makes no network requests. Run `npm run test:docs-mcp` after changing the server or its index.

A separate Cloudflare Worker serves the same five tools over Streamable HTTP at `/mcp` for agents that cannot run a local process. It is not part of GitHub Pages and does not replace the local server. The corpus is generated from the same Markdown:

```
npm run worker:corpus
npm run worker:test
npm run worker:check
npm run worker:dev
```

Deploy with `npm run worker:deploy` after `wrangler login`. Read `workers/docs-mcp/README.md` before changing the endpoint, CORS, or rate limits. The Worker is read-only: no writes, no issue creation, no remote fetches.

## Editorial policy

Do not use Apple/macOS/Windows as the reference point or promote proprietary or non-standard vendors. The guide borrows the clarity and opinionation of vendor platform documentation, but it explains Linux directly; another OS is not the baseline. Name a third-party alternative only as a sourced example when it is open source, actively maintained, widely accepted, and compared on the quality signals in `reference/quality-signals.md`. Packaging channels are compared on sandboxing, updates, metadata, review, support, and maintenance burden, not on vendor preference.
