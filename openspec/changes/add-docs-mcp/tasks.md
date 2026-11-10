# Tasks

## 1. Server foundation

- [x] 1.1 Add a direct `zod` dependency and npm scripts for `mcp:docs` and `test:docs-mcp`.
- [x] 1.2 Add `tools/docs-mcp/lib/` helpers for configuration, frontmatter, text extraction, page loading, and errors.
- [x] 1.3 Implement `tools/docs-mcp/server.mjs` with the MCP stdio transport, read-only tool annotations, and stderr-only logging.

## 2. Tools

- [x] 2.1 Implement `search_docs` with MiniSearch, section filters, limits, excerpts, AND-to-OR fallback, and empty-result guidance.
- [x] 2.2 Implement `get_page` with canonical slug normalization, map-based lookup, traversal rejection, and suggestions for unknown pages.
- [x] 2.3 Implement `list_pages` grouped by section and ordered by the configured sidebar where available.
- [x] 2.4 Implement `get_related` with TF-IDF similarity, internal-link and same-section bonuses, and reasons.
- [x] 2.5 Implement `get_baseline` by reading `src/data/baseline.json` and returning a clear error when it is unavailable.
- [x] 2.6 Add source-signature refresh so long-running sessions see edited Markdown.

## 3. Integration

- [x] 3.1 Register the server under `mcp.servers.docs` in `opencode.jsonc` with the workspace root as `cwd`.
- [x] 3.2 Document the server, tools, commands, and read-only guarantees in `README.md` and `AGENTS.md`.

## 4. Verification

- [x] 4.1 Add unit tests for page loading, slug safety, search, related pages, and baseline parsing.
- [x] 4.2 Add a stdio integration test that lists and calls every tool, including a traversal attempt and an unknown page.
- [x] 4.3 Run `npm run test:docs-mcp`, `npm run build`, `npm run check:baseline`, and `npm run check:agent-docs`.
- [x] 4.4 Verify `opencode mcp list` or an equivalent stdio smoke test sees the `docs` server.
- [x] 4.5 Review the diff, confirm there are no write or network calls in the server, run `git diff --check`, and commit on `workspace` with an English message.

## Workflow follow-up

- Archive the change after review.
