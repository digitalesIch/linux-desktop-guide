# docs-tooling Specification

## Purpose
Provide repeatable local checks for documentation correctness, generated agent output, MCP behavior, and internal links, with network-dependent external checks kept opt-in.

## Requirements

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

### Requirement: Link and anchor validation

The project SHALL provide a link checker for the built documentation.

#### Scenario: Internal link target is missing

- **WHEN** a built HTML page contains a root-relative link to a page that does not exist
- **THEN** the checker reports the source page and target and exits non-zero

#### Scenario: Internal anchor is missing

- **WHEN** a built HTML page links to a fragment that no target page defines
- **THEN** the checker reports the missing anchor and exits non-zero

#### Scenario: External links are checked on request

- **WHEN** a maintainer runs the external link command
- **THEN** the checker checks the source URLs with bounded concurrency and a timeout and reports non-success responses or login redirects

#### Scenario: Placeholder URLs are ignored

- **WHEN** the source contains example or placeholder URLs
- **THEN** the external checker skips them instead of reporting a false failure

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

### Requirement: Example consistency check

The documentation gate SHALL verify that the first-app tutorial and the runnable example agree.

#### Scenario: Default documentation gate

- **WHEN** a maintainer runs `npm run check:docs`
- **THEN** the gate runs `check:examples` before the build and fails if a tutorial file block differs from `examples/notes`

#### Scenario: Check runs offline

- **WHEN** `check:examples` runs without network access or GUI tooling
- **THEN** it completes using only the repository files and Node.js

#### Scenario: Drift is actionable

- **WHEN** a mismatch is found
- **THEN** the check prints the file, the tutorial line, and a unified diff

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
