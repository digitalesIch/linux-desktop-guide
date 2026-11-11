# Design

## Context

Two delivery surfaces now exist:

- `src/content/docs/**/*.md` is the working tree that authors edit. The `docs` server reads it directly, refreshes on file changes, and makes no network requests.
- `https://digitalesich.github.io/linux-desktop-guide/` is the published guide. It is built from the same sources and additionally exposes `llms.txt`, `llms-full.txt`, and one `.md` route per page. GitHub Pages serves it through a CDN with `cache-control: max-age=600` and ETags.

The existing `docs` server is the right tool for an agent that edits the guide. It is the wrong tool for an agent that consumes the guide from another project or machine, because it requires this checkout and returns the working tree. The removed Cloudflare Worker solved the consumer case with a hosted endpoint; that decision was reversed and remains out of scope.

This change adds a local stdio server that consumes the published site. It is distributed as an npm package so a consumer needs Node.js and one configuration block, not this repository.

## Goals / Non-Goals

**Goals**

- One installable command that serves the published guide over stdio MCP.
- The same five tool names and result shapes as `docs`.
- Useful search and related pages without depending on the repository.
- Polite and resilient network access: allowlist, timeouts, size caps, ETags, TTLs, and stale fallback.
- Offline use after a warm cache.
- A deterministic offline test suite and a live post-deploy check.
- One shared implementation of page parsing, search, related pages, and text extraction.

**Non-Goals**

- A remote MCP endpoint, hosted worker, or Cloudflare deployment.
- Authentication, accounts, quotas, or telemetry.
- Writing to the project, creating issues, or mutating content.
- Replacing the `docs` server or removing its offline guarantee.
- Real-time content: the server reads the last successful deployment.
- A custom domain. The base URL is configurable, with the current Pages URL as default.

## Decisions

### 1. Read the published site, not the repository

The consumer server fetches `llms.txt`, `llms-full.txt`, `/<slug>.md`, and `reference/baseline.json` from the configured base URL. It never reads `src/` and has no `PROJECT_ROOT`. This is what makes it distributable and what makes its results match what a reader sees.

The cost is deployment lag and a runtime network dependency. The cache and the explicit `stale` flag make that cost visible instead of hiding it.

### 2. A new capability, not a mode of `docs-mcp`

The `docs-mcp` spec guarantees that the server starts and answers without opening a network connection and never calls remote services. Adding a network mode would break that guarantee and make the offline gate conditional. `guide-mcp` is therefore a separate capability with its own spec, package, and tests. The `docs` server stays unchanged except for shared imports.

### 3. Share the pure logic in `tools/docs-core/`

`search.mjs`, `related.mjs`, `text.mjs`, `sections.mjs`, and the slug rules are pure ESM. They move to `tools/docs-core/` and are imported by both servers. `pages.mjs` keeps the filesystem loader in `docs-mcp`; the guide package builds page objects from the published Markdown instead.

Result shapes stay compatible: `pageSummary`, `pageResult`, `DocsSearch`, and `DocsRelated` use an optional `page.url` / `page.markdownUrl` and fall back to the existing relative form. The local server's output is unchanged.

### 4. Bundle the package with esbuild

The npm package would otherwise need files from outside its directory. `build.mjs` bundles the server, the MCP SDK, `minisearch`, `yaml`, and `zod` into a single `dist/server.mjs` with a shebang. The published package has no runtime dependencies, no postinstall script, and no `node_modules` resolution at the consumer.

`esbuild` is a root dev dependency; the package metadata stays publish-only. `prepack` rebuilds so a manual publish cannot ship a stale bundle.

### 5. Cache outside the project, with conditional requests

The cache lives in the platform cache directory (`~/.cache/linux-desktop-guide-mcp` on Linux, `~/Library/Caches/...` on macOS, `%LOCALAPPDATA%` on Windows) and can be moved or disabled:

- `LDG_CACHE_DIR` overrides the directory.
- `LDG_NO_CACHE=1` disables reads and writes.
- `LDG_CACHE_TTL_MS` overrides all TTLs, mainly for tests.

Default TTLs: manifest 15 minutes, page 30 minutes, full corpus 60 minutes, baseline 60 minutes. These sit above the 10-minute CDN window, so a client refresh is not wasted. Entries store `ETag` and `Last-Modified`; a `304` extends the TTL without transferring the body. A network failure with a cache entry returns the entry with `stale: true` and `fetchedAt`; a cold cache failure returns an actionable error.

### 6. Allowlist the origin and base path

Every request, including redirect targets, must match the configured origin and path prefix. Redirects are followed manually with a limit of three. Responses are capped at 2 MB, requests time out after 10 seconds, and one retry is allowed for network errors and 429/5xx. `Retry-After` is respected up to five seconds. The user agent identifies the package and version.

The server only fetches slugs that appear in `llms.txt`, which prevents arbitrary path requests even before the allowlist applies.

### 7. Publish the baseline as JSON

The baseline page is MDX and its structured source is `src/data/baseline.json`. The build copies it to `dist/reference/baseline.json`, and `check:agent-docs` validates it. The guide server returns that object, matching `docs`'s `get_baseline` instead of parsing a Markdown table.

### 8. Keep publication out of the site build

GitHub Pages is static and cannot host an MCP endpoint. Distribution is an npm package published from a tagged workflow with npm trusted publishing and provenance. The package version is independent of the guide version. Content changes require no release; contract changes do.

### 9. Verify the contract after deployment

The Pages workflow runs a smoke test that starts the built server against the deployed URL and calls `list_pages`, `search_docs`, `get_page`, and `get_baseline`. A broken `.md` route, a missing baseline artifact, or a changed `llms.txt` shape fails the deployment verification instead of waiting for a consumer report.

## Risks / Trade-offs

- **Deployment lag.** Consumers see the last deployment plus the CDN window. The tool output includes `fetchedAt` and `stale`, and the consumer page states the difference from the source server.
- **Contract drift.** The server parses generated artifacts. Fixtures and the post-deploy smoke test cover the shapes; the parser ignores unknown lines rather than failing the whole request.
- **Duplicate surface.** Two servers expose the same tool names. The shared core and a parity test keep behavior aligned; documentation assigns `docs` to authoring and the package to consumption.
- **npm supply chain.** The package is bundled, has no runtime dependencies, no lifecycle scripts beyond `prepack`, and publishes with provenance.
- **Rate limits.** GitHub Pages has no documented per-client quota, but GitHub's acceptable-use rules apply. TTLs above the CDN window, conditional requests, and a single in-flight request per URL keep traffic low.
- **Node baseline.** The package targets Node.js 22 or newer, while the repository gate uses Node.js 24. The consumer page records the requirement.
