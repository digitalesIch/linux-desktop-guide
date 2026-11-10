# docs-tooling Specification

## Purpose
Provide repeatable local checks for documentation correctness, generated agent output, MCP behavior, and internal links, with network-dependent external checks kept opt-in.

## Requirements

### Requirement: Local documentation gate

The project SHALL provide one local command that runs the deterministic documentation release checks.

#### Scenario: Run the default gate

- **WHEN** a maintainer runs `npm run check:docs`
- **THEN** the command verifies the baseline, builds the site, validates generated agent docs, runs the MCP tests, and checks internal links and anchors

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
