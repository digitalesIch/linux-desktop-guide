# Design

## Context

The public repository is `digitalesIch/linux-desktop-guide`. GitHub Pages is enabled with `build_type: workflow` and serves the project site at:

```text
https://digitalesich.github.io/linux-desktop-guide/
```

The current deployment is implemented by:

- `site.config.mjs` — `SITE_URL` defaults to `https://digitalesich.github.io`, `BASE_PATH` defaults to `/linux-desktop-guide`;
- `astro.config.mjs` — `site`, `base`, and the `rehypeBaseLinks` plugin;
- `scripts/rewrite-base.mjs` — post-build pass for raw HTML and frontmatter HTML that bypass the Markdown rehype plugin;
- `src/pages/manifest.webmanifest.ts` — base-aware manifest;
- `public/sw.js` — base-aware service worker;
- `.github/workflows/deploy-pages.yml` — build, documentation gate, upload, deploy.

The live site was verified on 2026-11-11: the landing page, `llms.txt`, `llms-full.txt`, a per-page Markdown route, the manifest, the service worker, the offline page, and 84 sitemap/Markdown/asset URLs returned successfully. The Lighthouse check against the base-path build scored 99–100 performance and 100 accessibility, best practices, and SEO.

The remote MCP/Worker path was removed in `a587c7c`. Only the local stdio MCP server remains. This is a deliberate scope decision, not a missing deployment.

The `workspace` branch still contains the target evidence page and source policy. It is based on the older history and also contains `research/target-selection.md`. The public history was created without that report. The evidence work must therefore be applied as a file-level change, not as a branch merge.

## Goals / Non-Goals

**Goals**

- Keep the public site deployable from `main` with one workflow.
- Make the base path configurable without editing content.
- Verify the deployed site, not only the local build.
- Enforce the Lighthouse budgets continuously.
- Check upstream sources on a free schedule and report drift without editing content.
- Make external-link strictness useful by allowlisting known network blocks.
- Bring the target evidence page to `main` safely.
- Record whether the target matrix has a real CI matrix.

**Non-Goals**

- A custom domain. It remains optional through `SITE_URL` and `BASE_PATH`.
- A remote MCP endpoint, Cloudflare Worker, or hosted search.
- Paid monitoring, paid CI runners, or a paid link checker.
- Analytics, telemetry, or issue creation from the docs MCP server.
- Automatic content changes from the freshness check.
- Rewriting the guide prose as part of this structural change.

## Decisions

### 1. GitHub Pages project path is the default

The guide is served from `/linux-desktop-guide/`, not from a domain root. All root-relative links, the manifest, the service worker, and generated agent Markdown use the base path. A custom domain remains a deployment option: set `SITE_URL=https://example.com` and `BASE_PATH=/`; no content changes are required.

### 2. The offline gate stays browser-free

`npm run check:docs` remains deterministic and offline. The Lighthouse gate is a separate job because it needs Chrome and is more sensitive to machine timing. It must not become a hidden dependency of the offline gate.

The quality job should run on pull requests that touch content or site code, and on `main`. A single retry is acceptable for the known Lighthouse `n/a` transient; a repeated failure is a real failure. If the retry is not enough, the job can move to a scheduled/manual gate, but that decision must be recorded.

### 3. Live verification is a first-class check

A deployment is not done when the upload succeeds. A `check:deployed` command accepts a base URL and verifies:

- the landing page and a representative content page;
- `/llms.txt`, `/llms-full.txt`, and a per-page `.md` route;
- `/manifest.webmanifest`, `/sw.js`, and `/offline.html` with the expected content types;
- every root-relative link in the sampled pages stays inside the configured base;
- the manifest `start_url` and `scope` and the service-worker registration match the base.

The command runs after deployment and can also be run manually against a preview URL.

### 4. Freshness is scheduled, free, and issue-based

The freshness check reads the source URLs already stored in `baseline.json` and `targets.json`, fetches public release/lifecycle/package pages, and compares the recorded values with what the page says. It opens or updates a GitHub issue with a `docs:freshness` label. It does not edit content and does not call a paid service.

GitHub-hosted runners on the public repository are free for standard use. The workflow runs weekly, with `workflow_dispatch` for a manual run. GitHub API rate limits are handled with the automatic `GITHUB_TOKEN`; no personal token is required.

### 5. External-link allowlist is explicit

`doc.qt.io` is unreachable from the current network and produces seven warnings. The allowlist records the host and the reason. Strict mode still fails on real 4xx/5xx responses. The scheduled external check runs non-strict; a maintainer can run strict locally after reviewing the allowlist.

### 6. Evidence is applied as files, not as a branch merge

The `workspace` branch and `main` have different histories. Merging the branch would reintroduce `research/target-selection.md` and the old PWA archive. The evidence change is applied by copying the target evidence page, the source-policy updates, the baseline sources, and the sidebar/AGENTS/README changes, while keeping the current `site.config.mjs`, base-path scripts, feedback page, style guide, and deployment workflow.

After the evidence page is on `main`, the `integrate-target-evidence` change is archived and the content session owns `targets/evidence.md`.

### 7. Target CI is a scoped decision

A real target CI matrix would build the example app in Fedora, Debian, and Arch containers and validate the desktop entry and AppStream metadata. It is valuable but not required to keep the site online. The change records the decision point: either add the matrix or explicitly state that target validation remains manual.

## Risks / Trade-offs

- **Lighthouse flakiness.** The quality gate occasionally returns `n/a` for a page (observed once on `engineering/gtk`). A retry handles the transient; a persistent failure must not be silenced.
- **GitHub Pages base-path regressions.** A raw HTML link or a new frontmatter `html` image can bypass the rehype plugin. The post-build rewrite and the base-path assertion in `check:links` are the guards; both must stay.
- **Freshness false positives.** Release pages change layout. The check should compare explicit fields or package versions where possible, and fail soft with a report when a page cannot be parsed.
- **Branch divergence.** The evidence work is the only remaining content on `workspace`; after it is applied, the old branch must not be merged wholesale.
- **PWA device testing.** Android and iOS installation cannot be automated in this environment. The result is a dated manual check, not a CI claim.
- **Scope creep.** The change is about delivery and verification, not a redesign of the guide or the target matrix.

## Migration Plan

1. Add the live-check and quality/freshness workflows on a branch from `main`.
2. Apply the evidence files from `workspace` without `research/` and without reverting the base-path/PWA work.
3. Run `npm run check:docs`, `npm run check:quality`, `openspec validate --all --strict`, and the new deployed-site check.
4. Merge to `main`; the Pages workflow deploys.
5. Verify the live evidence page and archive `integrate-target-evidence`.
6. Record the PWA device test result and the target-CI decision in `PUBLIC_RELEASE.md`.

## Open Questions

- Should the Lighthouse job block pull requests or run post-merge/nightly after one retry?
- Is the target CI matrix in scope now, or is "manual validation" the accepted answer for Fedora/Debian/Arch?
- Which public source fields should the freshness check compare first: support dates, toolkit versions, or both?
