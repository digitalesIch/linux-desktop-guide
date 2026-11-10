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

Use `npm run check:baseline` and `npm run check:agent-docs` before releasing. Do not edit `dist/`; it is generated.

## Documentation MCP server

The project registers a local, read-only MCP server named `docs` in `opencode.jsonc`. Use it to search and read this guide efficiently:

1. Call `search_docs` first.
2. Pass a returned slug to `get_page`.
3. Use `list_pages` to browse, `get_related` after a page, and `get_baseline` for validated versions.

The server runs over stdio with `npm run mcp:docs`. It indexes `src/content/docs/**/*.md`, rejects path traversal, writes nothing, and makes no network requests. Run `npm run test:docs-mcp` after changing the server or its index.
