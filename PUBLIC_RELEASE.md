# Public release checklist

The repository is public. This checklist records the work required for a future visibility change or a new distribution channel. GitHub Pages on the Free plan requires a public repository; GitHub Pro, Team, or Enterprise Cloud can publish Pages from a private repository.

Scope: the guide ships a static site and a local stdio MCP server. No remote MCP endpoint is operated.

## 1. Licensing

- ☑ Choose a license for the code and a license for the prose. They do not have to be the same.
- ☑ Add the license files and the matching `license` field in `package.json`.
- ☑ Confirm that bundled fonts, icons, screenshots, and example assets are compatible with the chosen licenses.
- ☑ Update `README.md` with the license statement.

## 2. Internal material and history

- ☑ The internal target research was moved out of this repository and removed from the public Git history. The private copy and the old history bundle are kept outside the repository.
- ☑ Review `AGENTS.md` and `openspec/` for internal notes, unpublished evidence, and personal paths.
- ☑ Scan the full history for secrets, tokens, private URLs, and personal data.
- ☑ Confirm that no `.env`, credentials, or local worktree paths are present in the history.

## 3. Site delivery

- ☑ Make the repository public. The public repository is [digitalesIch/linux-desktop-guide](https://github.com/digitalesIch/linux-desktop-guide); the old private history is archived as `linux-desktop-guide-private`.
- ☑ Enable GitHub Pages for the Astro build output with the `Deploy to GitHub Pages` workflow.
- ☑ No custom domain is required. The default URL is `https://digitalesich.github.io/linux-desktop-guide/`.
- ☑ `site.config.mjs` sets the Pages URL and `/linux-desktop-guide` base path; the manifest, service worker, and internal links follow it.
- ☑ Verify `/llms.txt`, `/llms-full.txt`, per-page `.md` routes, the PWA manifest, the service worker, and internal links on the deployed host.
- ☑ Run `npm run check:docs` and `npm run check:quality` against the release commit.

## 4. Feedback

- ☑ Remove the private-repository note from `src/content/docs/reference/feedback.md`.
- ☑ Verify the issue form and the `documentation` / `agent-report` labels are public.
- ☑ Verify the issue link resolves for signed-in users and redirects to login otherwise.
- ☑ Confirm that reports do not ask for secrets or personal data.

## 5. After launch

- ☐ Watch the first issues and search misses; triage them through the feedback loop.
- ☐ Schedule the next documentation review and link check.
