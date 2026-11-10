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
