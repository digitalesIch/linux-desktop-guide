# Design

## Context

See `proposal.md`. The guide already publishes agent-readable Markdown (`llms.txt`, `llms-full.txt`, and per-page `.md` files), but an agent still has to fetch a large file or guess page URLs. The MCP server adds a local retrieval layer over the same source of truth without changing the site.

The project uses plain Node ESM for scripts. There is no compile step, no server framework, and no remote service. The server must be cheap to start, easy to inspect, and safe to run from OpenCode.

## Goals / Non-Goals

**Goals:**

- A local stdio MCP server with the five requested tools.
- Fast, relevant search over the current Markdown sources.
- Page retrieval that cannot escape the docs root.
- No network access, no writes, no telemetry, no cost.
- Automatic index refresh when source files change.
- Tests that exercise the real MCP protocol, not only helper functions.
- One-command local setup through `opencode.jsonc`.

**Non-Goals:**

- Hosted or remote MCP transport.
- Editing, creating, or deleting documentation through MCP.
- A vector database, embeddings, or an external search service.
- Replacing Pagefind or the published site search.
- Indexing generated `dist/` output.
- A freshness pipeline for upstream platform data; that remains deferred.

## Decisions

### 1. Plain Node ESM under `tools/docs-mcp/`

The server runs directly with `node tools/docs-mcp/server.mjs`, so there is no build step and no generated server bundle. The root package already uses `"type": "module"`. Code is split into small helpers for loading, search, related pages, and baseline access; `server.mjs` only wires the MCP surface.

### 2. Source Markdown is the index

The loader walks `src/content/docs/**/*.md`, parses frontmatter with `yaml`, and extracts headings, links, prose, and a word count. `reference/baseline.mdx` is intentionally not indexed because it is MDX and its data is exposed through `get_baseline`; the landing page (`index.mdx`) and `404.md` are not guide pages. This keeps the index deterministic and independent of `dist/`.

Each page record contains the canonical slug, title, description, section, body, plain text, headings, internal links, and URL paths. Slugs are derived from the file path, never accepted from the filesystem at request time.

### 3. MiniSearch with modest, explainable ranking

MiniSearch indexes `title`, `description`, `headings`, and `body`. Title matches receive the highest boost, followed by description and headings. Queries are normalized with a small English stopword list, use prefix matching for partial words, and use fuzzy matching only for terms longer than four characters.

Multi-term queries try `AND` first for precision and fall back to `OR` when nothing matches. An optional section filter is applied inside the search so a filtered query still returns the best matches from that section. Results include a short excerpt around the first matched term and up to three matching headings.

### 4. Slug lookup uses a closed map, not path joining

`normalizeSlug` accepts `/start/why-linux/`, `start/why-linux`, and `start/why-linux.md`, then canonicalizes to `start/why-linux`. It rejects empty segments, `.`/`..`, backslashes, and characters outside the guide's slug alphabet. `get_page` then looks up the canonical slug in a map built at load time. A request can therefore never construct a path, escape the docs root, or read `package.json`.

Unknown slugs return an MCP tool error with up to three search-based suggestions and a pointer to `list_pages`.

### 5. Related pages combine links, section, and text similarity

`get_related` builds normalized TF-IDF vectors from title, description, headings, and prose. Scores add a small bonus for pages in the same section and a larger bonus for internal links in either direction. The response includes a human-readable reason and the top shared topics. Self-links are excluded.

### 6. Refresh by source signature

The store computes a signature from the relative path, mtime, and size of every indexed file. Before each tool call it compares the signature and rebuilds the search and related indexes only when the sources changed. This keeps a long-running OpenCode session current without file watchers or a daemon.

### 7. Read-only by construction

The server imports only `node:fs`, `node:path`, `node:url`, the MCP SDK, MiniSearch, YAML, and Zod. It has no HTTP client, no database, no write calls, and no environment-dependent remote endpoint. Logs go to stderr because stdout belongs to the MCP transport.

### 8. OpenCode V2 configuration

The project config uses the V2 shape:

```jsonc
{
  "mcp": {
    "servers": {
      "docs": {
        "type": "local",
        "command": ["node", "tools/docs-mcp/server.mjs"],
        "cwd": "."
      }
    }
  }
}
```

`cwd: "."` resolves to the workspace root, which matches both the canonical checkout and a worktree. The default Code Mode exposure groups the tools as `docs_search_docs`, and so on.

### 9. Tests use the MCP SDK client

Unit tests cover loading, slug safety, search, related pages, and baseline parsing. The integration test spawns the real server over stdio with the SDK client, lists the tools, and calls every tool, including a traversal attempt. This catches stdout pollution, bad schemas, and transport wiring that helper-only tests would miss.

## Risks / Trade-offs

- **Search quality without embeddings** → Use field boosts, prefix/fuzzy matching, AND-to-OR fallback, excerpts, and related pages. The corpus is small, so lexical search is sufficient and predictable.
- **Large pages in context** → `get_page` returns one page at a time; agents are instructed to search first. No automatic full-guide dump.
- **Stale index** → The mtime/size signature rebuilds on change; a restart is always safe.
- **Path traversal** → Canonical slug validation plus map lookup; the request never becomes a path.
- **stdout corruption** → All diagnostics use stderr; integration tests assert the protocol still works.
- **Dependency surface** → Three runtime dependencies, all already used by the project or the MCP SDK; no service or account.
- **OpenCode config drift** → Use the documented V2 `mcp.servers` shape and verify with `opencode mcp list` if available.
