# Proposal

## Why

The guide is delivered as a static site on GitHub Pages. Pages cannot host an MCP server: there is no request runtime, no POST handling, no sessions, and no rate limiting. A public repository makes the local stdio server available to anyone who clones it, but a remote endpoint is needed for agents that cannot run a local process.

Cloudflare Workers is the chosen host. It provides a Web Standards runtime, a free tier, custom domains, and the `@modelcontextprotocol/sdk` already supports `WebStandardStreamableHTTPServerTransport` on Workers.

## What Changes

- Add `workers/docs-mcp/` with a stateless Streamable HTTP MCP endpoint at `/mcp`.
- Expose the same five read-only tools as the local server: `search_docs`, `get_page`, `list_pages`, `get_related`, and `get_baseline`.
- Generate a content corpus from `src/content/docs` and `src/data/baseline.json` at build time, so the Worker does not depend on the Pages site at runtime.
- Reuse the local server's search and related-page logic instead of maintaining a second implementation.
- Add `/health` and `/` discovery responses, CORS headers, and explicit read-only tool annotations.
- Add `wrangler.toml`, npm scripts, deployment documentation, and a CI dry-run build.
- Keep the local stdio server unchanged and read-only.
- Do not add write tools, authentication, analytics, or remote content fetches.

## Capabilities

### New Capabilities

- `docs-mcp-remote`: read-only MCP access to the Linux Desktop Guide over Streamable HTTP on Cloudflare Workers.

### Modified Capabilities

None. The local `docs-mcp` capability keeps its existing contract.

## Impact

- `workers/docs-mcp/` (new): Worker source, Wrangler config, README.
- `scripts/generate-mcp-corpus.mjs` (new).
- `tools/docs-mcp/lib/sections.mjs` (new shared constants).
- `tools/docs-mcp/lib/config.mjs`, `search.mjs`, `pages.mjs` (import the shared constants).
- `package.json`, `package-lock.json` (Wrangler dev dependency and scripts).
- `.github/workflows/check-docs.yml` (Worker dry-run step).
- `.gitignore` (generated corpus and Wrangler output).
- No changes to the published site, the local MCP contract, or the example app.
