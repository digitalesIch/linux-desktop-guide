# Tasks

## 1. Share the portable core

- [x] 1.1 Move server metadata and section constants to `tools/docs-mcp/lib/sections.mjs`; verify `config.mjs` re-exports them and the local server still starts.
- [x] 1.2 Point `search.mjs` and `pages.mjs` at `sections.mjs`; verify `npm run test:docs-mcp` passes.
- [x] 1.3 Add a corpus generator at `scripts/generate-mcp-corpus.mjs` that writes `workers/docs-mcp/src/generated/docs.json` from `loadPages` and `readBaseline`; verify the 404 page is excluded and the JSON parses.

## 2. Build the Worker

- [x] 2.1 Add `workers/docs-mcp/src/index.ts` with `/mcp`, `/health`, `/`, and 404 responses; verify the stateless transport and CORS wrapper.
- [x] 2.2 Register `search_docs`, `get_page`, `list_pages`, `get_related`, and `get_baseline` with the same schemas and read-only annotations as the local server; verify the result shapes match.
- [x] 2.3 Add slug normalization, traversal rejection, unknown-page suggestions, and the baseline page error; verify unsafe inputs do not read files.
- [x] 2.4 Add `workers/docs-mcp/wrangler.toml` and `workers/docs-mcp/README.md` with local dev, dry-run, deploy, custom-domain, rate-limit, and client connection instructions.

## 3. Wire scripts and CI

- [x] 3.1 Add `wrangler` as a dev dependency and scripts `worker:corpus`, `worker:check`, `worker:dev`, and `worker:deploy`; verify `npm run worker:check` bundles the Worker.
- [x] 3.2 Add `.wrangler/` and the generated corpus to `.gitignore`; verify no generated file is committed.
- [x] 3.3 Add the Worker dry-run to `.github/workflows/check-docs.yml`; verify the workflow YAML parses.
- [x] 3.4 Update `README.md` and `AGENTS.md` with the remote endpoint, deployment, and read-only limits; verify the local MCP instructions remain.

## 4. Verify

- [x] 4.1 Run `npm run test:docs-mcp` and `npm run check:docs`; verify the local server and site still pass.
- [x] 4.2 Run `npm run worker:check`; verify the Worker bundles and the corpus is generated.
- [x] 4.3 Start `wrangler dev` locally and verify `/health`, MCP `initialize`, `tools/list`, and a `tools/call` for `search_docs` and `get_page`.
- [x] 4.4 Compare `search_docs` and `get_page` output with the local server for at least three queries and three pages; verify the shapes and ordering match.
- [x] 4.5 Run `npm run check:quality -- --no-build`; verify the site still meets the Lighthouse thresholds.
- [x] 4.6 Commit and push; verify the CI workflow passes and the Worker dry-run step succeeds.
