# Design

## Context

See `proposal.md`. The repository has separate checks for baseline data, generated agent docs, the MCP server, and links, but no single gate. The MCP server also has two text-extraction defects: the table-separator regular expression uses `\s`, which includes newlines, and the HTML-strip regex treats comparison text such as `< 1 s` / `< 200 MB` as an HTML tag, swallowing large table/prose blocks. The performance page was indexed with 246 words instead of roughly 1,350.

## Goals / Non-Goals

**Goals:**

- One deterministic local command for the documentation release gate.
- Internal links and anchors checked against the actual built output.
- Optional external link checking without making the default gate network-dependent.
- Plain-text extraction that preserves table content and keeps separator rows out.
- Regression tests that would have caught the word-count loss.

**Non-Goals:**

- A remote CI service or scheduled crawler.
- Browser-based visual or accessibility testing.
- Rewriting the MCP search engine.
- Checking links inside third-party pages.

## Decisions

### 1. `check:docs` is deterministic and offline by default

`npm run check:docs` runs:

1. `check:baseline`
2. `build` (which also generates agent docs)
3. `check:agent-docs`
4. `test:docs-mcp`
5. the internal link/anchor check

External URLs are excluded because they are slow, flaky, rate-limited, and depend on network access. `npm run check:links:external` is the explicit opt-in.

### 2. Link checking has two modes

`scripts/check-links.mjs` supports:

- **Internal mode (default):** walk `dist/**/*.html`, collect root-relative `href` values, resolve them to files, and verify fragments against `id="..."`. Asset links are ignored. Missing pages and anchors fail.
- **External mode (`--external`):** extract `http(s)` URLs from `src/content/docs`, skip `example.org` and `github.com/yourname` placeholders, check with bounded concurrency and a timeout, and fail on non-2xx/3xx responses or login redirects. Network errors and timeouts are reported as warnings by default; `--strict` turns them into failures. It reports the effective URL.

The script exits non-zero on failures and prints a short summary. It does not cache results.

### 3. `check-docs.mjs` orchestrates, it does not duplicate logic

The orchestrator spawns the existing npm scripts with `npm run` and stops on the first failure. This keeps the individual commands usable and avoids duplicating build logic.

### 4. Fix both lossy transforms

Replace the current separator pattern:

```js
/^\s*\|?[\s:|-]+\|[\s:|-]*$/gm
```

with a line-bounded class that excludes newlines:

```js
/^[ \t]*\|?[ \t:|-]+\|?[ \t]*$/gm
```

The new pattern still removes `| --- | :---: |` separator rows but cannot consume table header/body lines.

The HTML strip must only match real HTML element names, not `< 1 s` or `< 200 MB`. Use a bounded tag-name alternation instead of `/<[^>]+>/g`.

### 5. Test the defect at the level that matters

Add tests that:

- `markdownToPlain` on a table-heavy page retains table cell text and yields a realistic word count;
- a synthetic Markdown table keeps its header and body text while dropping the separator row;
- the performance page's MCP word count is above a meaningful threshold (for example 1,000) so a regression cannot silently return to the 246-word result.

## Risks / Trade-offs

- **External checks are flaky** → keep them opt-in and report the effective URL so redirects and login walls are visible.
- **Internal anchor check can be fooled by HTML entities** → unescape fragments before matching.
- **Word-count thresholds are approximate** → use a low threshold that catches the structural bug without freezing editorial changes.
- **Comparison text looks like markup** → restrict HTML stripping to known tags and cover `< 1 s` / `< 200 MB` in a regression test.
- **External network access** → never part of `check:docs`; the default gate remains offline and free.
