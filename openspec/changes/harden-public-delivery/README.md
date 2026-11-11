# harden-public-delivery

Harden the public GitHub Pages delivery: CI quality, freshness, live verification, and safe integration of the target evidence page.

## Session split

- **Linux Doku Struktur** owns the structural tasks: delivery verification, CI quality, freshness, target CI, and deployment.
- **Content session** owns the guide prose after the evidence page is integrated. Do not edit content in this change to satisfy a structural task; record a content issue instead.

## Current state

- Public site: <https://digitalesich.github.io/linux-desktop-guide/>
- Pages source: GitHub Actions workflow in `.github/workflows/deploy-pages.yml`
- Base path: `/linux-desktop-guide`, configurable through `site.config.mjs`
- Remote MCP/Worker: deliberately removed; only the local stdio server remains
- Evidence page: still on `workspace`, not on `main`

Read `proposal.md`, `design.md`, and `tasks.md` before starting.
