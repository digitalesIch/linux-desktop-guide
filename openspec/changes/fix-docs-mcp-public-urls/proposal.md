# Proposal

## Why

The `docs` MCP server returns site-relative URLs such as `/start/why-linux/` and `/start/why-linux.md`. The site is served from `/linux-desktop-guide/`, so an agent that follows those URLs requests `https://digitalesich.github.io/start/why-linux/` and receives a 404. The same defect affects page summaries, search results, and related-page recommendations.

The `guide` server already returns absolute URLs. The source server should match it so an agent can use a returned URL without knowing the deployment path.

## What Changes

- Derive an absolute public base URL from `SITE_URL` and `BASE_PATH` in `site.config.mjs`.
- Attach absolute `url` and `markdownUrl` values to every page loaded from `src/content/docs`.
- Keep the shared result functions backward compatible: pages without an explicit URL still fall back to the relative form.
- Update the `docs-mcp` page-retrieval scenarios and the tests to assert absolute URLs.
- No network access is added. `site.config.mjs` only reads environment variables.

## Capabilities

### Modified Capabilities

- `docs-mcp`: page retrieval, listing, search, and related results return absolute public URLs.

## Impact

- `tools/docs-mcp/lib/config.mjs`, `tools/docs-mcp/lib/pages.mjs`
- `tools/docs-mcp/test/pages.test.mjs`, `search.test.mjs`, `server.test.mjs`
- `openspec/specs/docs-mcp/spec.md` when the change is archived
- No content, build, or deployment change
