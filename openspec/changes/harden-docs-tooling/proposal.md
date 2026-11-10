# Proposal

## Why

The documentation now has a broad source and validation trail, but there are two tooling gaps: there is no single local command that runs the full documentation gate, and the MCP server's plain-text extraction undercounts table-heavy pages, which weakens search excerpts and related-page ranking.

## What Changes

- Add `scripts/check-links.mjs`:
  - internal link and anchor checking against the built `dist/` output;
  - optional external URL checking with bounded concurrency, timeouts, placeholder allowlisting, clear failure output, and a strict mode that also fails on unreachable hosts.
- Add `scripts/check-docs.mjs` and npm scripts:
  - `npm run check:docs` runs baseline, build, agent docs, MCP tests, and the internal link check;
  - `npm run check:links` runs only the internal check;
  - `npm run check:links:external` performs the network-dependent external check.
- Fix `markdownToPlain` so table separator rows are removed per line instead of matching across newlines, and so comparison text such as `< 1 s` or `< 200 MB` is not stripped as an HTML tag. This restores the prose/table content used for MCP word counts, excerpts, and related-page similarity.
- Add regression tests for table-heavy pages and table text.
- Document the new commands in `README.md` and `AGENTS.md`.

## Capabilities

### New Capabilities

- `docs-tooling`: local, repeatable documentation quality gates.

### Modified Capabilities

- `docs-mcp`: plain-text extraction now preserves table content and excludes table separator rows.

## Impact

- `scripts/check-links.mjs`, `scripts/check-docs.mjs` (new)
- `package.json`
- `tools/docs-mcp/lib/text.mjs`, `tools/docs-mcp/test/pages.test.mjs` or a focused text test
- `README.md`, `AGENTS.md`
- No site routes or content meaning changes.
