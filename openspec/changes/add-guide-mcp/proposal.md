# Proposal

## Why

The guide is published at `https://digitalesich.github.io/linux-desktop-guide/` and already emits agent-facing Markdown: `llms.txt`, `llms-full.txt`, and a `.md` route per page. The only MCP server in the project, however, reads `src/content/docs` and requires the repository. An agent that does not have this checkout cannot use it, and an agent with the checkout sees the working tree rather than the published guide.

The project has no supported way to offer MCP access to the published guide. Pointing another agent at `llms-full.txt` works but gives no search, no page retrieval by slug, no related pages, and no caching. The earlier remote Worker was deliberately removed; offering a hosted endpoint is still out of scope.

This change adds a second, independent local stdio server that reads the published site and is distributed as an npm package. It leaves the existing `docs` server as the authoring path and does not replace it.

## What Changes

- Add `guide-mcp`, a read-only stdio MCP server that reads the published guide over HTTPS.
- Expose the same five tools as `docs` (`search_docs`, `get_page`, `list_pages`, `get_related`, `get_baseline`) so agents can switch between source and published content.
- Cache responses outside the project with TTLs, conditional requests, and stale fallback for offline use.
- Restrict requests to the configured site origin and base path; no credentials, no writes to the project, no arbitrary URLs.
- Publish the server as `linux-desktop-guide-mcp` on npm so another agent needs only an `npx` command in its MCP configuration.
- Extract the pure page, search, related, and text logic into `tools/docs-core/` so both servers share one implementation.
- Publish `reference/baseline.json` as a build artifact and use it for the guide server's `get_baseline`.
- Add a consumer page that documents the package, the client configurations, the environment variables, and the `llms.txt` fallback.
- Verify the published MCP contract after each Pages deployment.

## Capabilities

### New Capabilities

- `guide-mcp`: a standalone local stdio server that reads the published guide, caches it, and serves the five read-only documentation tools.

### Modified Capabilities

- `docs-mcp`: the shared core moves to `tools/docs-core/`; tool behavior and result shapes stay compatible, and existing URLs keep working.

## Impact

- `tools/docs-core/` (new), `tools/docs-mcp/` (imports only)
- `tools/guide-mcp/` (new package), root `package.json` (build and test scripts, `esbuild` dev dependency)
- `scripts/generate-agent-docs.mjs`, `scripts/check-agent-docs.mjs` (publish and validate `reference/baseline.json`)
- `scripts/check-mcp-deployed.mjs` (new), `.github/workflows/deploy-pages.yml`, new publish workflow
- `src/content/docs/reference/agent-access.md`, `astro.config.mjs`, `src/content/docs/reference/glossary.md`
- `README.md`, `AGENTS.md`, `PUBLIC_RELEASE.md`
- `openspec/specs/docs-mcp/spec.md`, new `openspec/specs/guide-mcp/spec.md`

No remote endpoint, hosted worker, custom domain, authentication, telemetry, or write path is in scope. The local `docs` server remains the offline authoring path and is not removed by this change.
