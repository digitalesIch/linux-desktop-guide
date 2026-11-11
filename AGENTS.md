## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Scope and targets

This is a target-based field guide, not a distro-agnostic tutorial. The supported matrix is in `src/data/targets.json`; the selection method and evidence are in `src/content/docs/targets/selection.md`. Do not add a distribution/toolkit combination without evidence and without updating the matrix. Each reference target has one default stack and HIG; alternatives are secondary and must be documented as trade-offs. The full evidence report is maintained outside this repository; it is internal and not published.

## Guide goals

Before adding a chapter or integration, claiming a development path is complete, or assessing release readiness, read the purpose and complete-path criteria in `src/content/docs/start/native-standard.md` and the release criteria in `src/content/docs/ship/quality-bar.md`. Page coverage, API lists, and packaging-channel counts are not evidence that a path works. Label illustrative, source-reviewed, build-tested, and runtime-tested material honestly; optional integrations are not requirements. Keep the developer-only, Linux-first scope; do not add business or market guidance, app showcases, or targets outside the selected matrix.

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

Run `npm run check:docs` before releasing. It performs baseline validation, tutorial/example consistency checking, target-matrix validation, freshness fixture tests, a full build, PWA validation, agent-doc validation, MCP tests, and internal link/anchor checking. The default gate is offline. External link checks are opt-in with `npm run check:links:external`; strict mode fails on real HTTP 4xx/5xx responses, while network warnings and allowlisted hosts do not fail.

Run `npm run check:quality` for the browser-based gate. It serves `dist/`, runs Lighthouse on representative pages, requires accessibility, best practices, and SEO at 100, and keeps performance at or above 90. It needs a local Chrome and is intentionally separate from the offline `check:docs` gate. Add `-- --no-build` to reuse an existing build. The `Quality` workflow runs the same gate on pushes and pull requests with one retry for a transient `n/a`.

Add the deployed-site check after a Pages deployment: `npm run check:deployed -- <base-url>`. The `Deploy to GitHub Pages` workflow runs it in a `verify` job. The weekly `Freshness` workflow runs `npm run check:freshness` and opens or updates an issue labeled `docs:freshness`; it never edits content. Node 24 is the baseline.

Do not edit `dist/`; it is generated.

## Documentation MCP server

The project registers a local, read-only MCP server named `docs` in `opencode.jsonc`. Use it to search and read this guide efficiently:

1. Call `search_docs` first.
2. Pass a returned slug to `get_page`.
3. Use `list_pages` to browse, `get_related` after a page, and `get_baseline` for the Ubuntu/GNOME reference baseline. The full target matrix is in `src/data/targets.json`.

The server runs over stdio with `npm run mcp:docs`. It indexes `src/content/docs/**/*.md`, rejects path traversal, writes nothing, and makes no network requests. Run `npm run test:docs-mcp` after changing the server or its index.

Only the local stdio server is offered. Do not add a remote MCP endpoint, a hosted worker, or a Cloudflare deployment without a new decision and an OpenSpec change. Agents that cannot run a local process use `llms.txt` or the per-page Markdown.

## Editorial policy

Do not use Apple/macOS/Windows as the reference point or promote proprietary or non-standard vendors. The guide borrows the clarity and opinionation of vendor platform documentation, but it explains Linux directly; another OS is not the baseline. Name a third-party alternative only as a sourced example when it is open source, actively maintained, widely accepted, and compared on the quality signals in `reference/quality-signals.md`. Packaging channels are compared on sandboxing, updates, metadata, review, support, and maintenance burden, not on vendor preference.
