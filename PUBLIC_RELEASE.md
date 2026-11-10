# Public release checklist

The repository is public. This checklist records the work required for a future visibility change or a new distribution channel. GitHub Pages on the Free plan requires a public repository; GitHub Pro, Team, or Enterprise Cloud can publish Pages from a private repository.

## 1. Licensing

- ☑ Choose a license for the code and a license for the prose. They do not have to be the same.
- ☑ Add the license files and the matching `license` field in `package.json`.
- ☑ Confirm that bundled fonts, icons, screenshots, and example assets are compatible with the chosen licenses.
- ☑ Update `README.md` with the license statement.

## 2. Internal material and history

- ☑ Decide whether `research/target-selection.md` is published. The current policy calls it internal and not published.
- ☑ If it stays internal, remove it from the public tree **and from the Git history** before making the repository public. A normal delete is not enough; use `git filter-repo` or create a fresh public repository from a clean snapshot.
- ☑ Review `AGENTS.md`, `openspec/`, and `research/` for internal notes, unpublished evidence, and personal paths.
- ☑ Scan the full history for secrets, tokens, private URLs, and personal data.
- ☑ Confirm that no `.env`, credentials, or local worktree paths are present in the history.

## 3. Site delivery

- ☐ Make the repository public, or keep it private on a plan that supports private Pages.
- ☐ Enable GitHub Pages for the Astro build output.
- ☐ Set `site` in `astro.config.mjs` to the real URL and verify canonical URLs.
- ☐ Verify `/llms.txt`, `/llms-full.txt`, per-page `.md` routes, the PWA manifest, the service worker, and internal links on the deployed host.
- ☐ Run `npm run check:docs` and `npm run check:quality` against the release commit.

## 4. Remote MCP

- ☐ Deploy the Worker with `npm run worker:deploy`.
- ☐ Add the custom domain, for example `mcp.linux-desktop.guide`, and the DNS record.
- ☐ Add a Cloudflare rate-limiting rule for the Worker hostname.
- ☐ Verify `/health`, MCP `initialize`, `tools/list`, `search_docs`, and `get_page` against the deployed endpoint.
- ☐ Add the endpoint to `README.md`, `AGENTS.md`, and the agent-facing docs page.
- ☐ Keep the local stdio server as the offline path.

## 5. Feedback

- ☑ Remove the private-repository note from `src/content/docs/reference/feedback.md`.
- ☐ Verify the issue form and the `documentation` / `agent-report` labels are public.
- ☐ Verify the issue link works without authentication.
- ☐ Confirm that reports do not ask for secrets or personal data.

## 6. After launch

- ☐ Watch the first issues and search misses; triage them through the feedback loop.
- ☐ Re-check the Worker corpus and redeploy after guide changes.
- ☐ Review the rate limit and Worker logs after the first traffic.
- ☐ Schedule the next documentation review and link check.
