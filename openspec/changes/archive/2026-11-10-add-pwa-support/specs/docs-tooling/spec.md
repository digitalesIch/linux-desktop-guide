# Spec Delta

## MODIFIED Requirements

### Requirement: Local documentation gate

The project SHALL provide one local command that runs the deterministic documentation release checks.

#### Scenario: Run the default gate

- **WHEN** a maintainer runs `npm run check:docs`
- **THEN** the command verifies the baseline, checks tutorial/example consistency, validates the target matrix, builds the site, validates the PWA output and generated agent docs, runs the MCP tests, and checks internal links and anchors

#### Scenario: A check fails

- **WHEN** any step in `npm run check:docs` fails
- **THEN** the command exits non-zero and identifies the failing step

#### Scenario: Default gate has no network dependency

- **WHEN** `npm run check:docs` runs on a machine without network access
- **THEN** it still completes the deterministic checks and does not perform external URL requests
