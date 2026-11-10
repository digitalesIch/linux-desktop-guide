# Design

## Context

The local `tools/docs-mcp` server reads Markdown from `src/content/docs` with Node APIs and speaks stdio. The Worker cannot use `node:fs` or persist a source signature. It can use Web Standards, `fetch`, and module-scope state that lives for the isolate.

The public site remains on GitHub Pages. The Worker is a separate deployment on a subdomain. The two share the same source content but not a runtime.

## Goals / Non-Goals

**Goals:**

- One remote endpoint with the same five read-only tools and result shapes as the local server.
- Deterministic content: a corpus generated from the same Markdown and baseline JSON.
- No runtime dependency on the Pages site.
- A small, auditable Worker with no secrets and no write path.
- A deploy path that works on the Cloudflare free tier.

**Non-Goals:**

- Authentication or per-user quotas.
- Writes, issue creation, or feedback submission through MCP.
- Real-time index refresh. The Worker is redeployed when content changes.
- Hosting the site on Cloudflare. GitHub Pages remains the site.
- Replacing the local stdio server.

## Decisions

### 1. Bundle a generated corpus

`scripts/generate-mcp-corpus.mjs` uses the existing Node loader to read every Markdown page once, then writes `workers/docs-mcp/src/generated/docs.json`. The Worker imports that JSON. This avoids a runtime fetch of `linux-desktop.guide` on every request, removes a Pages availability dependency, and keeps search deterministic.

The corpus is generated, not committed. `npm run worker:corpus` regenerates it; `worker:check` and `worker:deploy` run it first.

### 2. Reuse search and related-page logic

The local server's `DocsSearch` and `DocsRelated` are pure ESM and work on plain page objects. Only `config.mjs` imported Node paths, so the shared constants move to `sections.mjs`. The Worker imports both classes from `tools/docs-mcp/lib/`. This keeps ranking, excerpts, suggestions, and related-page reasons identical to the local server.

### 3. Stateless Streamable HTTP

Each request creates a fresh `McpServer` and `WebStandardStreamableHTTPServerTransport` with `sessionIdGenerator: undefined` and `enableJsonResponse: true`. Workers are stateless between requests; a stateful session would need Durable Objects and is unnecessary for read-only tools.

### 4. No auth, but rate limiting at the edge

The content is public and read-only. Requiring OAuth would make the endpoint harder to use without protecting anything sensitive. The deployment guidance requires a Cloudflare rate-limiting rule and recommends a custom domain. No secrets are stored in the Worker.

### 5. CORS is explicit

The Worker answers `OPTIONS` and adds CORS headers to every response, including errors. This supports browser-based MCP clients without opening a write path.

### 6. CI builds the Worker without deploying

`wrangler deploy --dry-run` bundles the Worker and catches missing imports, invalid configuration, and corpus generation failures. It does not require a Cloudflare account or an API token. Deployment remains a manual, authenticated step.

## Risks / Trade-offs

- **Content drift:** the corpus is a snapshot. A docs change requires a Worker redeploy. The deployment README and the CI dry-run make this visible; a scheduled deploy can be added later.
- **Bundle size:** the corpus includes Markdown and plain text for every page. It is small enough for the Workers free tier; if it grows, move the corpus to R2 or KV.
- **No auth:** a public endpoint can be scraped. The content is already public, so the risk is request volume, not data exposure. Rate limiting is the control.
- **CORS wildcard:** acceptable for public read-only content. Restrict origins later only if a browser client requires it.
- **Duplicate API surface:** the local and remote servers can drift. The shared search/related code and a parity test reduce the risk; the spec requires the same tools and result shapes.
