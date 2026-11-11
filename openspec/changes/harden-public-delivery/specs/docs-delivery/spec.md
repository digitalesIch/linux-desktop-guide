# Spec Delta

## ADDED Requirements

### Requirement: Configurable static deployment

The site SHALL build for either a domain root or a project path without editing content files.

#### Scenario: Project-path build

- **WHEN** `BASE_PATH=/linux-desktop-guide` and `SITE_URL=https://digitalesich.github.io`
- **THEN** the build prefixes root-relative links and assets, the manifest `start_url` and `scope`, the service-worker paths, the canonical URLs, and the generated agent Markdown with the base
- **AND** no internal link points outside the configured base

#### Scenario: Root-domain build

- **WHEN** `BASE_PATH=/` and `SITE_URL=https://example.com`
- **THEN** the same content builds without a base prefix
- **AND** the manifest, service worker, and agent Markdown use the domain root

#### Scenario: Deployment configuration is external

- **WHEN** the deployment target changes
- **THEN** changing `SITE_URL` and `BASE_PATH` is sufficient; no Markdown page, component, or service worker is edited

### Requirement: GitHub Pages deployment

The repository SHALL deploy the static build to GitHub Pages from `main`.

#### Scenario: Push to main

- **WHEN** a commit lands on `main`
- **THEN** the Deploy to GitHub Pages workflow runs the documentation gate, builds the site, uploads `dist/`, and deploys it
- **AND** a failed gate prevents the deployment

#### Scenario: Manual deployment

- **WHEN** a maintainer runs the deployment workflow manually
- **THEN** the same build and deployment steps run

#### Scenario: Deployment needs no custom domain

- **WHEN** the repository has no custom domain
- **THEN** the site is served from the GitHub Pages project path and the configured base path

### Requirement: Live delivery verification

The project SHALL verify the deployed site after a deployment.

#### Scenario: Core routes are reachable

- **WHEN** the deployed site is checked
- **THEN** the landing page, a representative content page, `/llms.txt`, `/llms-full.txt`, a per-page `.md` route, `/manifest.webmanifest`, `/sw.js`, and `/offline.html` return success under the configured base

#### Scenario: Content types are correct

- **WHEN** the deployed manifest and service worker are fetched
- **THEN** the manifest is served as a manifest JSON content type and the service worker as JavaScript

#### Scenario: Base-path links are intact

- **WHEN** deployed HTML is scanned
- **THEN** no root-relative link or asset omits the configured base path

#### Scenario: Verification is repeatable

- **WHEN** a maintainer runs the live check
- **THEN** the command accepts a base URL and exits non-zero on a missing route, wrong content type, or base-path violation
