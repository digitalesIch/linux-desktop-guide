# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Local documentation gate

The project SHALL provide one local command that runs the deterministic documentation release checks.

#### Scenario: Run the default gate

- **WHEN** a maintainer runs `npm run check:docs`
- **THEN** the command verifies the baseline, checks tutorial/example consistency, builds the site, validates generated agent docs, runs the MCP tests, and checks internal links and anchors

#### Scenario: A check fails

- **WHEN** any step in `npm run check:docs` fails
- **THEN** the command exits non-zero and identifies the failing step

#### Scenario: Default gate has no network dependency

- **WHEN** `npm run check:docs` runs on a machine without network access
- **THEN** it still completes the deterministic checks and does not perform external URL requests
