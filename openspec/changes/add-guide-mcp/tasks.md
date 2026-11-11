# Tasks

## 1. Shared core

- [x] 1.1 Create `tools/docs-core/` and move `sections.mjs`, `errors.mjs`, `text.mjs`, `search.mjs`, and `related.mjs` without behavior changes.
- [x] 1.2 Extract the slug rules (`normalizeSlug`, `pageUrl`, `markdownUrl`, link resolution) into `tools/docs-core/slug.mjs`; keep the filesystem loader in `tools/docs-mcp/lib/pages.mjs`.
- [x] 1.3 Let page summaries, search results, related pages, and page results prefer an explicit `page.url` / `page.markdownUrl` and fall back to the existing relative form.
- [x] 1.4 Update `tools/docs-mcp` imports and tests; run `npm run test:docs-mcp` and confirm the existing output is byte-for-byte compatible for pages without an explicit URL.

## 2. Guide package

- [x] 2.1 Add `tools/guide-mcp/package.json` with the name `linux-desktop-guide-mcp`, version `0.1.0`, `bin`, `files`, `engines: >=22`, MIT license, repository metadata, and a `prepack` build.
- [x] 2.2 Implement `src/config.mjs` with the default base URL, TTLs, response cap, timeout, and environment overrides (`LDG_SITE_URL`, `LDG_CACHE_DIR`, `LDG_NO_CACHE`, `LDG_CACHE_TTL_MS`).
- [x] 2.3 Implement `src/cache.mjs`: platform cache directory, atomic JSON entries, corrupt-entry recovery, ETag and Last-Modified storage.
- [x] 2.4 Implement `src/site.mjs`: origin and path allowlist, manual redirects, size cap, timeout, one retry, `Retry-After`, user agent, conditional requests, and stale fallback.
- [x] 2.5 Implement `src/corpus.mjs`: parse `llms.txt`, split `llms-full.txt` on page boundaries, parse page Markdown and frontmatter, normalize absolute internal links, and build page objects for the shared core.
- [x] 2.6 Implement `src/store.mjs`: lazily load the manifest, build the search index and related graph from the corpus, validate slugs against the manifest, and expose the five operations.
- [x] 2.7 Implement `src/server.mjs` with the five tool registrations, read-only annotations, stderr logging, and actionable errors.
- [x] 2.8 Add `build.mjs` using esbuild to emit a single `dist/server.mjs` with a shebang; add `esbuild` to the root dev dependencies.
- [x] 2.9 Add `tools/guide-mcp/README.md` and `LICENSE`.

## 3. Tool behavior

- [x] 3.1 `list_pages` returns sections and absolute URLs from the manifest and states that the published order is alphabetical within a section.
- [x] 3.2 `get_page` accepts the common slug forms, rejects traversal and unknown slugs, suggests near matches, and redirects `reference/baseline` to `get_baseline`.
- [x] 3.3 `search_docs` ranks published pages with the shared search core and supports section filters.
- [x] 3.4 `get_related` uses published links and text similarity with the shared related core.
- [x] 3.5 `get_baseline` returns the parsed `reference/baseline.json` object and fails clearly when the artifact is missing.

## 4. Build artifacts

- [x] 4.1 Copy `src/data/baseline.json` to `dist/reference/baseline.json` in `scripts/generate-agent-docs.mjs`.
- [x] 4.2 Extend `scripts/check-agent-docs.mjs` to validate the copied baseline against the source file and fail on divergence.
- [x] 4.3 Add a deploy smoke test that starts the built server against the deployed base URL and calls the four network-backed tools.

## 5. Tests

- [x] 5.1 Add fixtures for `llms.txt`, `llms-full.txt`, representative pages, and `baseline.json`, served by a local HTTP fixture server.
- [x] 5.2 Test manifest parsing, corpus parsing, absolute link normalization, slug handling, and baseline parsing without network access.
- [x] 5.3 Test cache hits, TTL expiry, `304` refresh, stale fallback with `LDG_CACHE_TTL_MS=0`, cold-cache failure, and corrupt cache entries.
- [x] 5.4 Test allowlist rejection, redirect rejection, size cap, timeout, and retry behavior with an injected `fetch`.
- [x] 5.5 Add a stdio integration test that starts the server against the fixture server and exercises all five tools, including error cases.
- [x] 5.6 Add a bundle check that builds the package, runs `npm pack`, installs the tarball in a temporary directory, starts the packed server, and calls `list_pages`.
- [x] 5.7 Add a parity test that compares tool names and required result fields between `docs` and `guide`.
- [x] 5.8 Add `test:guide-mcp`, `build:guide-mcp`, and `check:guide-package` scripts; include the offline tests in `check:docs`.

## 6. Publication

- [x] 6.1 Add `.github/workflows/publish-guide-mcp.yml` triggered by `guide-mcp-v*` tags and manual runs, using npm trusted publishing with `id-token: write` and provenance.
- [x] 6.2 Document the one-time npm trusted-publisher setup and the release tag format in `PUBLIC_RELEASE.md`.
- [x] 6.3 Verify `npm pack --dry-run` includes only the bundle, README, and license and declares no runtime dependencies.

## 7. Documentation

- [x] 7.1 Add `src/content/docs/reference/agent-access.md` with the package, client configurations for OpenCode, Claude Desktop, and Cursor, the environment variables, cache and offline behavior, and the `llms.txt` fallback.
- [x] 7.2 Add the page to the Reference sidebar and define "guide MCP" in the glossary next to "docs MCP".
- [x] 7.3 Update `README.md` and `AGENTS.md`: two local stdio servers, `docs` for the working tree, the package for the published guide, and no remote endpoint.
- [x] 7.4 Update the public release checklist with the npm package, its version, and the post-deploy MCP smoke test.

## 8. Verification

- [x] 8.1 Run `openspec validate add-guide-mcp --strict` and `openspec validate --all --strict`.
- [x] 8.2 Run `npm run check:docs` offline and confirm every step passes.
- [ ] 8.3 Run the built server against the live deployed URL and exercise all five tools.
- [ ] 8.4 Run `npm run check:deployed -- https://digitalesich.github.io/linux-desktop-guide/` and the new MCP smoke test against the same URL.
- [x] 8.5 Confirm the repository contains no generated cache, tarball, or `dist/` output from the package.
