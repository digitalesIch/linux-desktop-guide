# Tasks

## 1. Generator

- [x] 1.1 Add `turndown`, `turndown-plugin-gfm`, and `linkedom` as dev dependencies; verify `npm install` succeeds.
- [x] 1.2 Create `scripts/generate-agent-docs.mjs` to read `dist/**/index.html`, extract title/description/section/content, convert to Markdown, and write `dist/<slug>.md`; verify the baseline page, a code page, a table page, and an aside page.
- [x] 1.3 Generate `dist/llms.txt` grouped by section with absolute `.md` URLs and a `## Optional` section; verify every content page appears exactly once.
- [x] 1.4 Generate `dist/llms-full.txt` with a header and every page separated by title and URL; verify it contains all page titles.
- [x] 1.5 Add a `postbuild` script and verify `npm run build` produces the Markdown files, `llms.txt`, and `llms-full.txt`.

## 2. Discovery

- [x] 2.1 Create `src/components/Head.astro` that preserves Starlight’s head entries and adds `rel="alternate"` plus `rel="describedby"`; register it in `astro.config.mjs`.
- [x] 2.2 Verify a content page HTML head links to its `.md` sibling and to `/llms.txt`, and that the 404 page does not link to a missing Markdown file.

## 3. Validation and documentation

- [x] 3.1 Create `scripts/check-agent-docs.mjs` and a `check:agent-docs` package script; verify it fails on a missing page and passes after a build.
- [x] 3.2 Add an “Agent access” section to `reference/resources` describing `/llms.txt`, `/llms-full.txt`, and the `.md` sibling convention; verify the links work in the built site.
- [x] 3.3 Add the agent docs to `README.md` and a “Documentation for agents” section to `AGENTS.md`; verify the instructions match the generated paths.

## 4. Verification and commit

- [x] 4.1 Run `npm run build` and `npm run check:agent-docs`; verify all checks pass.
- [x] 4.2 Inspect `dist/llms.txt`, `dist/llms-full.txt`, and three generated pages (baseline, code-heavy, table-heavy); verify headings, code fences, tables, links, and frontmatter metadata.
- [x] 4.3 Run the internal link/anchor checker and Lighthouse on `/reference/resources/` and `/reference/baseline/`; verify no regressions.
- [x] 4.4 Review the diff, verify `git diff --check`, and commit on `workspace` with an English message.

## Workflow follow-up

- Archive the change after review.
- Add content negotiation or the MCP server in later changes.
