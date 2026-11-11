# Tasks

## 1. URL source

- [x] 1.1 Export `PUBLIC_BASE_URL` from `tools/docs-mcp/lib/config.mjs`, derived from `SITE_URL` and `BASE_PATH` in `site.config.mjs`.
- [x] 1.2 Attach absolute `url` and `markdownUrl` values to every page in `loadPages`; keep the shared result fallback for pages without an explicit URL.

## 2. Tests and specification

- [x] 2.1 Update the page, search, and server tests to assert absolute URLs under `PUBLIC_BASE_URL`.
- [x] 2.2 Record the changed page-retrieval scenario in the `docs-mcp` spec delta.

## 3. Verification

- [x] 3.1 Run `npm run test:docs-mcp` and `npm run check:docs`.
- [x] 3.2 Call `get_page` through the MCP client and confirm the URL opens the deployed page.
- [x] 3.3 Run `openspec validate fix-docs-mcp-public-urls --strict`.
