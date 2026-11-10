## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Documentation for agents

The public guide is published for agents as well as humans. After `npm run build`:

- `/llms.txt` — curated index of every page in Markdown.
- `/llms-full.txt` — the complete guide in one file.
- Append `.md` to a page route for a clean Markdown version, for example `/start/why-linux.md`.

Run `npm run check:docs` before releasing. It performs baseline validation, tutorial/example consistency checking, a full build, agent-doc validation, MCP tests, and internal link/anchor checking. The default gate is offline. External link checks are opt-in with `npm run check:links:external`; unreachable hosts are warnings unless `check:links:external:strict` is used.

Run `npm run check:quality` for the browser-based gate. It serves `dist/`, runs Lighthouse on representative pages, requires accessibility, best practices, and SEO at 100, and keeps performance at or above 90. It needs a local Chrome and is intentionally separate from the offline `check:docs` gate. Add `-- --no-build` to reuse an existing build.

Do not edit `dist/`; it is generated.

## Documentation MCP server

The project registers a local, read-only MCP server named `docs` in `opencode.jsonc`. Use it to search and read this guide efficiently:

1. Call `search_docs` first.
2. Pass a returned slug to `get_page`.
3. Use `list_pages` to browse, `get_related` after a page, and `get_baseline` for validated versions.

The server runs over stdio with `npm run mcp:docs`. It indexes `src/content/docs/**/*.md`, rejects path traversal, writes nothing, and makes no network requests. Run `npm run test:docs-mcp` after changing the server or its index.

## Editorial policy

Do not use Apple/macOS/Windows as the reference point or promote proprietary or non-standard vendors. Name a third-party alternative only as a sourced example when it is open source, actively maintained, widely accepted, and compared on the quality signals in `reference/quality-signals.md`. Packaging channels are compared on sandboxing, updates, metadata, review, support, and maintenance burden, not on vendor preference.
