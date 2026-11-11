# Proposal

## Why

The guide now defines a feedback loop, but the site has no way to start it. GitHub Pages is static: there is no server endpoint, no request log, and no write API. A feedback form that posts to the site cannot work. The transport has to be GitHub Issues, reached by ordinary links, with the report format carried by an issue form.

The repository is private during development. The feedback path must say so and must not pretend that external readers can open an issue yet.

## What Changes

- Add `src/content/docs/reference/feedback.md`: what to report, the fields an issue needs, the agent protocol, and how the loop closes.
- Add `.github/ISSUE_TEMPLATE/docs-feedback.yml`: a structured issue form for page, section, quote, expected/actual result, version, target, reporter type, and source.
- Add a small `Feedback` link to the page header in `PageTitle.astro`, next to the existing Markdown link, so every page points at the feedback page.
- Add `.github/workflows/check-docs.yml`: run `npm run check:docs` on pushes and pull requests. This is repository automation, not a Pages runtime.
- Document the `gh issue create` path for agents in `AGENTS.md`; the docs MCP server stays read-only.
- State the private-repository limitation on the feedback page and in `README.md`.
- Reject server endpoints, server-side search logs, third-party analytics by default, and MCP query logging; none are compatible with the static delivery constraint.

## Capabilities

### New Capabilities

None. This is a content and repository-automation change with no application behavior or public API changes. The change opts out of spec deltas with `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- `src/content/docs/reference/feedback.md`
- `.github/ISSUE_TEMPLATE/docs-feedback.yml`
- `.github/workflows/check-docs.yml`
- `src/components/PageTitle.astro`
- `astro.config.mjs`
- `AGENTS.md`
- `README.md`
- No runtime server, database, analytics, or MCP write path.
