# Spec Delta

## ADDED Requirements

### Requirement: Outcome-based guide purpose

The guide SHALL define its purpose as enabling developers to follow a curated, evidence-backed path to accessible, responsive, reliable, maintainable apps for the selected Linux desktop targets. It SHALL measure completeness by demonstrated user tasks rather than topic, API, page, or packaging-channel counts.

#### Scenario: Reader finds the guide's purpose

- **WHEN** a reader opens the Native Standard
- **THEN** the page states the guide's purpose and links the expected app outcomes to its quality and release criteria
- **AND** the README and contributor instructions point to that statement rather than maintaining a separate detailed goal list

#### Scenario: A content addition is considered

- **WHEN** a maintainer proposes a new chapter, toolkit alternative, or integration feature
- **THEN** the addition identifies the developer decision or user task it serves for an existing target
- **AND** optional capabilities are distinguished from baseline requirements

### Requirement: Coherent reference development paths

The guide SHALL define a reference path as a connected sequence from project setup through a useful core task, persistence and recovery, desktop integration, packaging, installation, and updates. It SHALL distinguish this goal from the path's current implementation and verification status.

#### Scenario: A reference path is presented as complete

- **WHEN** a page calls a reference path complete or verified
- **THEN** its instructions, source files, build dependencies, app identifiers, and package recipes describe a compatible project with evidence for the claimed steps
- **AND** omitted steps and illustrative fragments are not counted as completed or verified outcomes

#### Scenario: A user task crosses several platform APIs

- **WHEN** a path teaches opening, editing, saving, or restoring user content
- **THEN** it connects the observable user task to the applicable platform APIs and describes success, denial or failure, and data preservation

#### Scenario: A capability is not relevant to the app

- **WHEN** media controls, background services, network listeners, extra package formats, or another optional integration are unrelated to the core task
- **THEN** the path does not require that capability merely to improve a score or increase integration coverage

### Requirement: Honest verification claims

The guide SHALL distinguish illustrative examples, source-reviewed facts, successful builds, and runtime-tested behavior. Verification claims SHALL identify their target, date, scope, and evidence; website checks SHALL NOT substitute for app validation.

#### Scenario: The documentation build succeeds

- **WHEN** site generation, link checking, or website accessibility checks pass
- **THEN** the guide does not infer that the documented app builds, preserves user data, or meets native-app accessibility requirements

#### Scenario: App verification is incomplete

- **WHEN** a build, runtime, update, or assistive-technology check has not been performed
- **THEN** the affected guidance states the unverified scope and avoids a complete or validated claim for it

### Requirement: Non-compensable app release criteria

The guide SHALL separate mandatory app release criteria from its advisory quality scores. Known data-loss failures, inaccessible core tasks, unjustified privileges, and broken supported installation or update paths SHALL block a release-ready assessment regardless of the aggregate score.

#### Scenario: A high-scoring app fails a mandatory criterion

- **WHEN** an app has a high quality score but fails data preservation, core-task accessibility, permission safety, or a supported installation or update path
- **THEN** the quality guidance identifies the blocking failure and does not label the app release-ready

#### Scenario: A supported update changes stored data

- **WHEN** a path assesses an update that changes the app's data format
- **THEN** its acceptance criteria include migration and failure recovery that preserve user content

### Requirement: Target-specific platform promise

The guide SHALL distinguish the supported distribution and desktop, build SDK, packaged runtime, optional capabilities, and fallback behavior. Shared standards SHALL NOT be presented as identical desktop interfaces or as an implicit support promise for an additional distribution or edition.

#### Scenario: The app runs on another desktop or edition

- **WHEN** guidance describes cross-desktop behavior or an additional smoke-test environment
- **THEN** it states the primary HIG, the expected fallback behavior, and whether that environment is a selected target or only an additional check

#### Scenario: The SDK differs from the host packages

- **WHEN** a packaged app uses toolkit versions different from those on the host
- **THEN** the guidance identifies the build and runtime versions separately from the host rather than treating them as one baseline
