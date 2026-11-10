# Proposal

## Why

Agents currently have to read `llms-full.txt` or crawl several pages to answer a documentation question. That wastes context and makes targeted retrieval slow. A local MCP server gives agents a small, predictable interface for searching the guide and reading only the pages they need.

## What Changes

- Add a local, read-only MCP server under `tools/docs-mcp/` that speaks stdio.
- Index the English Markdown guide from `src/content/docs/**/*.md` at startup, using frontmatter, headings, and body text. The 404 page is excluded.
- Expose five tools:
  - `search_docs` for ranked full-text search with section filters and excerpts;
  - `get_page` for one page's Markdown by slug;
  - `list_pages` for browsing the table of contents;
  - `get_related` for related pages;
  - `get_baseline` for the validated platform data in `src/data/baseline.json`.
- Reject path traversal and unknown slugs; the server never writes files, opens sockets, or calls remote services.
- Register the server as `docs` in `opencode.jsonc` using the OpenCode V2 `mcp.servers` shape.
- Add unit and stdio integration tests plus npm scripts for running the server and its tests.
- Document the local MCP workflow in `README.md` and `AGENTS.md`.

## Capabilities

### New Capabilities

- `docs-mcp`: offline, read-only MCP access to the Linux Desktop Guide.

### Modified Capabilities

None.

## Impact

- `tools/docs-mcp/` (new)
- `package.json`, `package-lock.json` (direct `zod` dependency and scripts)
- `opencode.jsonc`
- `README.md`, `AGENTS.md`
- No site routes, content meaning, build output, or example-app changes.
