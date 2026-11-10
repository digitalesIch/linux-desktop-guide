# Tasks

## 1. Link checker

- [x] 1.1 Add `scripts/check-links.mjs` with internal page/anchor checking against `dist/`.
- [x] 1.2 Add external URL mode with placeholder allowlisting, bounded concurrency, timeouts, login-redirect detection, warnings for unreachable hosts, and a `--strict` mode.
- [x] 1.3 Add npm scripts `check:links` and `check:links:external`.

## 2. Documentation gate

- [x] 2.1 Add `scripts/check-docs.mjs` that runs baseline, build, agent docs, MCP tests, and internal links in order.
- [x] 2.2 Add the `check:docs` npm script and make it fail with the failing step's name.
- [x] 2.3 Document `check:docs`, `check:links`, and `check:links:external` in `README.md` and `AGENTS.md`.

## 3. MCP text extraction

- [x] 3.1 Fix both lossy transforms in `tools/docs-mcp/lib/text.mjs`: line-bounded table separators and HTML stripping limited to real tags (so `< 1 s`/`< 200 MB` survive).
- [x] 3.2 Add regression tests for a synthetic table, angle-bracket comparisons, and a table-heavy guide page with a realistic word count.
- [x] 3.3 Run the MCP search/related tests and verify excerpts still work.

## 4. Verification

- [x] 4.1 Run `npm run check:docs`.
- [x] 4.2 Run `npm run check:links:external` and review the reported URLs/warnings; run the strict variant where the network is reliable.
- [x] 4.3 Run `npm run test:docs-mcp`.
- [ ] 4.4 Review the diff, run `git diff --check`, commit on `workspace`, and merge to `main`.

## Workflow follow-up

- Archive the change after review.
