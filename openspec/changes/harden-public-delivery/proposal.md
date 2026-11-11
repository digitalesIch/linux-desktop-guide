# Proposal

## Why

The guide is now public and deployed at `https://digitalesich.github.io/linux-desktop-guide/`. The site uses a GitHub Pages project path, a configurable `SITE_URL` / `BASE_PATH`, a base-aware manifest and service worker, and a Pages deployment workflow. The remote MCP/Worker path was deliberately removed; only the local stdio server remains.

The content and build are in good shape, but the public delivery is still mostly manual:

- the Lighthouse quality gate exists locally but does not run in CI;
- the freshness pipeline is still a promise on the baseline page, not a scheduled check;
- external link failures and known blocked hosts are not distinguished in strict mode;
- the deployed site has no repeatable live verification;
- the 109-source target evidence page is only on the `workspace` branch and cannot be edited or published from `main` yet;
- the target matrix has no CI that actually builds on Fedora, Debian, or Arch.

This change records the structural work so the session that owns the build and deployment can pick it up without rediscovering the current state or damaging the base-path deployment.

## What Changes

- Formalize the GitHub Pages project-path deployment and the environment-based root-domain option.
- Add a repeatable deployed-site check for core routes, manifest, service worker, Markdown routes, agent files, and base-path links.
- Add a CI quality job for the Lighthouse budgets, separate from the offline documentation gate.
- Add a free, scheduled freshness check that compares `baseline.json` and `targets.json` sources with upstream release notes and package indexes, then opens an issue instead of editing content.
- Add an explicit external-link allowlist for hosts that are unreachable from the CI network, so strict mode remains meaningful.
- Align the CI Node version with the documented baseline.
- Integrate `targets/evidence.md` and its source policy from `workspace` without publishing `research/target-selection.md`, without merging the old branch history, and without overwriting the base-path/PWA work.
- Decide whether the target matrix gets a real CI matrix; if not, record the decision instead of leaving the claim implicit.
- Record the real Android/iOS PWA installation result on the deployed host.

## Capabilities

### New Capabilities

- `docs-delivery`: static delivery on GitHub Pages, configurable base path, deployment from `main`, and live verification.

### Modified Capabilities

- `docs-tooling`: CI quality gate, scheduled freshness check, and external-link policy.
- `docs-pwa`: verification of the deployed PWA and real-device installation.

## Impact

- `.github/workflows/check-docs.yml`, `.github/workflows/deploy-pages.yml`, and new scheduled workflows
- `site.config.mjs`, `astro.config.mjs`, `scripts/rewrite-base.mjs`, `scripts/check-links.mjs`
- `scripts/check-quality.mjs`, new freshness and deployed-site scripts
- `PUBLIC_RELEASE.md`, `README.md`, `AGENTS.md`
- `src/content/docs/targets/evidence.md` and `src/content/docs/targets/selection.md`
- `openspec/changes/integrate-target-evidence` (workspace) and the target matrix

No custom domain, remote MCP endpoint, paid service, analytics, or automatic content rewrite is in scope.
