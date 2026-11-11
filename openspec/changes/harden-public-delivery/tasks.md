# Tasks

## 1. Delivery baseline

- [x] 1.1 Enable GitHub Pages with `build_type: workflow` and deploy from `main`; verify the site is served at `https://digitalesich.github.io/linux-desktop-guide/`.
- [x] 1.2 Configure `site.config.mjs` with `SITE_URL` and `BASE_PATH`, make the manifest and service worker base-aware, and add the post-build raw-HTML rewrite; verify the landing page, 404, Markdown routes, manifest, service worker, and offline page under the base path.
- [ ] 1.3 Add a `check:deployed` script that accepts a base URL and verifies the core routes, content types, base-path links, manifest scope/start URL, and service-worker registration.
- [ ] 1.4 Run the deployed-site check after the Pages workflow and expose it as a manual command; fail with the missing URL and the page that referenced it.
- [ ] 1.5 Build once with `BASE_PATH=/` and `SITE_URL=https://example.com`; verify no `/linux-desktop-guide` prefix remains in HTML, manifest, service worker, or agent Markdown.

## 2. Continuous checks

- [ ] 2.1 Align the Node version in `check-docs.yml` and `deploy-pages.yml` with the documented baseline (`24`) and verify the offline gate on a clean runner.
- [ ] 2.2 Add a Lighthouse job that runs `npm run check:quality -- --no-build` after a build, with one retry for a transient `n/a`; keep it out of `npm run check:docs`.
- [ ] 2.3 Add a scheduled external-link workflow and a documented allowlist for `doc.qt.io` (network-blocked, seven known warnings); confirm strict mode fails only on real 4xx/5xx responses.
- [ ] 2.4 Verify both workflows are free on the public repository: GitHub-hosted runners, public HTTP endpoints, no paid service or personal token.

## 3. Freshness pipeline

- [ ] 3.1 Define the checked source set from `src/data/baseline.json` and `src/data/targets.json`; record which fields are machine-comparable and which need a human read.
- [ ] 3.2 Add a `check:freshness` script that fetches the sources, compares support dates/toolkit versions, and prints a structured report; no content writes.
- [ ] 3.3 Add a weekly `workflow_dispatch`-enabled workflow that opens or updates an issue labeled `docs:freshness` when a source changes, and exits successfully when nothing changed.
- [ ] 3.4 Add the `docs:freshness` label and an issue template with the source, old value, new value, affected pages, and check date.
- [ ] 3.5 Test the no-change path and at least one simulated change; verify the workflow does not open duplicate issues.

## 4. Target evidence integration

- [ ] 4.1 Apply `src/content/docs/targets/evidence.md` and the source-policy changes from `workspace` without `research/target-selection.md`, without the old PWA archive, and without overwriting `site.config.mjs`, `scripts/rewrite-base.mjs`, or the Pages workflow.
- [ ] 4.2 Update `AGENTS.md`, `README.md`, `astro.config.mjs`, and the Target Evidence sidebar entry; remove the public reference to the internal working copy.
- [ ] 4.3 Run `npm run check:docs`, `npm run check:quality -- --no-build`, and the deployed-site check; verify the evidence page, source links, and anchors under the base path.
- [ ] 4.4 Archive `integrate-target-evidence` and record the merge in `PUBLIC_RELEASE.md`; verify the public history contains no `research/` file.

## 5. Target CI decision

- [ ] 5.1 Decide whether to add a container matrix for Fedora 45, Debian 13, and Arch Linux that builds `examples/notes`, runs `desktop-file-validate` and `appstreamcli validate`, and records the result.
- [ ] 5.2 If the matrix is in scope, add the workflow and make the target pages link to it; if not, state "manual validation" in the target pages and `PUBLIC_RELEASE.md` and remove the implication that CI validates every target.

## 6. PWA device verification

- [ ] 6.1 Test installation on a real Android browser and an iPhone/iPad Safari against the deployed HTTPS URL; record the date, browser versions, result, and any caveat in `PUBLIC_RELEASE.md`.
- [ ] 6.2 Verify the deployed manifest is served as `application/manifest+json`, the service worker is served from the base path, and registration uses the base scope.

## 7. Final verification

- [ ] 7.1 Run `openspec validate harden-public-delivery --strict` and `openspec validate --all --strict`.
- [ ] 7.2 Run `npm run check:docs`, `npm run check:quality`, and the deployed-site check against the release commit.
- [ ] 7.3 Confirm the live site serves `/`, `/targets/evidence/`, `/llms.txt`, a per-page `.md` route, the manifest, the service worker, and the offline page with no base-path errors.
- [ ] 7.4 Commit and push; verify the Pages workflow deploys successfully and the live check passes.
