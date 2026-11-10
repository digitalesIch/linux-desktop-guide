# Spec Delta

## ADDED Requirements

### Requirement: Tutorial and example stay in sync

The first-app tutorial SHALL show the same files that the runnable example contains.

#### Scenario: File block matches the example

- **WHEN** the tutorial contains a fenced block titled with a file from `examples/notes`
- **THEN** the block content matches that file after trimming trailing blank lines

#### Scenario: A file block drifts

- **WHEN** a tutorial file block no longer matches its example file
- **THEN** `npm run check:examples` prints a unified diff and exits non-zero

#### Scenario: A required block disappears

- **WHEN** a tutorial file block for a known example file is missing
- **THEN** the check fails and names the missing file

### Requirement: Coherent reading path

The guide's "Next" links SHALL follow the sidebar order and SHALL NOT skip a section.

#### Scenario: Leaving the Native Standard

- **WHEN** a reader reaches the end of `start/native-standard`
- **THEN** the next link points to `platform/ubuntu`, the first Platform page

#### Scenario: Leaving the Ubuntu page

- **WHEN** a reader reaches the end of `platform/ubuntu`
- **THEN** the next link points to `platform/wayland`

### Requirement: Discoverable glossary

The glossary SHALL be linked from pages where its terms first matter, not only from the sidebar.

#### Scenario: Reader meets platform terms

- **WHEN** a reader reads the contracts section of `start/why-linux` or the Ubuntu platform page
- **THEN** a link to `/reference/glossary/` is available
