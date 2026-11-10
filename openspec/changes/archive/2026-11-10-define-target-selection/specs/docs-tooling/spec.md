# Spec Delta

## ADDED Requirements

### Requirement: Target matrix validation

The documentation gate SHALL validate the curated target matrix as structured data.

#### Scenario: Default documentation gate

- **WHEN** a maintainer runs `npm run check:docs`
- **THEN** the gate runs `check:targets` and fails if the target data is incomplete or inconsistent

#### Scenario: Target data is invalid

- **WHEN** a target is missing a source, has an invalid role, or uses an out-of-range score
- **THEN** `check:targets` reports the target and field and exits non-zero

#### Scenario: Coverage gates are enforced

- **WHEN** the target matrix no longer contains a reference GTK target, a reference Qt target, an LTS or stable target, a current or rolling target, and both deb- and rpm-based distributions
- **THEN** `check:targets` fails with the missing coverage dimension

## MODIFIED Requirements

### Requirement: Local documentation gate

The project SHALL provide one local command that runs the deterministic documentation release checks.

#### Scenario: Run the default gate

- **WHEN** a maintainer runs `npm run check:docs`
- **THEN** the command verifies the baseline, checks tutorial/example consistency, validates the target matrix, builds the site, validates generated agent docs, runs the MCP tests, and checks internal links and anchors

#### Scenario: A check fails

- **WHEN** any step in `npm run check:docs` fails
- **THEN** the command exits non-zero and identifies the failing step

#### Scenario: Default gate has no network dependency

- **WHEN** `npm run check:docs` runs on a machine without network access
- **THEN** it still completes the deterministic checks and does not perform external URL requests

### Requirement: Browser-based quality gate

The project SHALL provide a local Lighthouse check for the built documentation.

#### Scenario: Representative pages meet the budgets

- **WHEN** a maintainer runs `npm run check:quality` on a machine with Chrome
- **THEN** the command builds the site, serves `dist/` on a loopback port, audits the landing, start, target-matrix, engineering, accessibility, and packaging pages, and exits zero only when accessibility, best practices, and SEO are 100 and performance is at least 90

#### Scenario: A budget is missed

- **WHEN** any audited page scores below a required budget
- **THEN** the command exits non-zero, prints the page and category score, and lists the weighted audits that lost points

#### Scenario: Existing build is reused

- **WHEN** a maintainer runs `npm run check:quality -- --no-build`
- **THEN** the command audits the existing `dist/` without rebuilding

#### Scenario: The gate stays outside the offline check

- **WHEN** a maintainer runs `npm run check:docs`
- **THEN** no browser is launched and no Lighthouse audit runs

#### Scenario: Server is disposable

- **WHEN** the quality check finishes or fails
- **THEN** its HTTP server and Chrome process are closed and no background server remains
