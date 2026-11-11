# docs-content Specification

## Purpose
Keep the Linux Desktop Guide factually accurate, current for Ubuntu 26.04 LTS, source-backed, and editorially consistent, so readers can trust its commands, manifests, and version claims.

## Requirements

### Requirement: Verified Ubuntu platform facts

The guide SHALL describe the Ubuntu 26.04 desktop, package formats, toolchains, and support windows using values that match current Canonical documentation.

#### Scenario: Ubuntu desktop session

- **WHEN** a page describes the Ubuntu 26.04 desktop session
- **THEN** it states that the Ubuntu Desktop session is Wayland-only and that XWayland still runs X11 applications

#### Scenario: Toolchain package names

- **WHEN** a page lists an install command for a supported toolchain
- **THEN** the package name is available in the Ubuntu 26.04 archive or the page names the supported alternative source

#### Scenario: Support windows

- **WHEN** a page lists Ubuntu 26.04 support dates
- **THEN** the dates match the cited Canonical release-cycle or release-notes source and any source discrepancy is noted

### Requirement: Channel-valid packaging examples

Every packaging example SHALL be valid for the channel it claims to target.

#### Scenario: Snap example targets Ubuntu 26.04

- **WHEN** a page shows a `snapcraft.yaml` for a new Ubuntu 26.04 app
- **THEN** it uses the recommended `core26` base and handles the absence of the bundled Python runtime when the app is written in Python

#### Scenario: Flathub submission manifest

- **WHEN** a page presents a Flatpak manifest as a Flathub submission
- **THEN** the manifest uses a `git` source with a tag/commit, or an `archive` source with a checksum, not a local `type: dir` source

#### Scenario: Local Flatpak build

- **WHEN** a page uses `type: dir` for a local tutorial build
- **THEN** it labels the source as local-only and points to the Flathub source requirements for submission

#### Scenario: deb architecture

- **WHEN** a page shows a `lintian` command for a package
- **THEN** the changes file matches the package architecture, or the command uses a glob that does not assume `amd64`

### Requirement: Runnable technical examples

Code, D-Bus names, systemd units, and CI examples SHALL use APIs and services that exist on the target platform.

#### Scenario: D-Bus service names

- **WHEN** a page names a D-Bus service for a platform capability
- **THEN** the service is real on Ubuntu 26.04, or the page explains that the capability uses a library/protocol instead of a general D-Bus API

#### Scenario: systemd user units

- **WHEN** a page shows a systemd user unit
- **THEN** every ordering target and dependency is available to the user manager, or the page explains the fallback

#### Scenario: CI workflow

- **WHEN** a page shows a CI workflow for a PyGObject or Flatpak app
- **THEN** the interpreter, bindings, linter, and build dependencies are installed in a way that makes the commands runnable

#### Scenario: Toolkit API

- **WHEN** a page uses a toolkit class, function, or property
- **THEN** the API exists in the version the page targets, or the page marks the minimum version and the fallback

### Requirement: Ubuntu 26.04 coverage

The guide SHALL document the Ubuntu 26.04 changes that materially affect desktop application developers.

#### Scenario: Platform delta is discoverable

- **WHEN** a reader wants to know what changed for app developers in Ubuntu 26.04
- **THEN** the guide has one place that covers Wayland-only, `core26`, App Center deb support, permission prompting/Security Center, Glycin, GStreamer 1.28, Sysprof, Ubuntu Insights, ARM64, NVIDIA Wayland, and fractional scaling

#### Scenario: Snap portals and permission prompting

- **WHEN** a page discusses Snap integration or sandbox permissions
- **THEN** it explains the Ubuntu 26.04 portal integration and the experimental permission-prompting flow, including how users manage permissions in Security Center

#### Scenario: Modern toolkit features

- **WHEN** a page describes GTK 4.22, libadwaita 1.9, or Qt 6.10
- **THEN** it covers the features that change application code or accessibility, such as `GtkSvg`/Glycin, `Adw.Sidebar`, `Adw.ShortcutsDialog`, `Adw.get_enable_animations`, Qt high-contrast support, and the relevant model/view or search APIs

### Requirement: Editorial consistency

The guide SHALL follow its English, self-confident editorial voice and SHALL NOT use Apple/macOS/Windows as the reference point or promote proprietary or non-standard vendors.

#### Scenario: Named alternative

- **WHEN** a page needs to name a third-party stack, runtime, or tool
- **THEN** it is presented as an example, not an endorsement, and only when the project is open source, actively maintained, widely accepted, and compared on verifiable quality signals

#### Scenario: Apple/macOS/Windows comparison

- **WHEN** a page uses an Apple/macOS/Windows convention as the explanatory contrast
- **THEN** the comparison is removed and the Linux behavior is described directly

#### Scenario: Vendor promotion

- **WHEN** a page recommends a proprietary or non-standard vendor solution
- **THEN** the recommendation is removed or replaced with the open standard, the distro-supported path, or neutral selection criteria

#### Scenario: Unsourced absolute claim

- **WHEN** a page makes a version, support, security, or platform claim that could change
- **THEN** the claim links to a primary source or is moved into the baseline with a review date

### Requirement: Installation channel coverage

The guide SHALL present the Ubuntu-supported installation paths first and SHALL also cover high-quality cross-distribution alternatives without presenting any single channel as universal.

#### Scenario: Ubuntu-supported paths

- **WHEN** a reader asks how to install an app on Ubuntu 26.04
- **THEN** the guide explains deb/archive and Snap/App Center as the paths Ubuntu documents and supports

#### Scenario: Flatpak is intentionally separate

- **WHEN** the guide discusses Flatpak
- **THEN** it states that Flatpak is not installed or supported by default on Ubuntu, that it is a mature open-source cross-distribution channel, and how to install it and add Flathub deliberately

#### Scenario: Alternative channels

- **WHEN** the guide compares Flatpak, AppImage, source/tarball, or self-hosted repositories
- **THEN** each channel has explicit trade-offs for sandboxing, updates, metadata, review, support, and maintenance burden

### Requirement: Maintainer and community health signals

The guide SHALL evaluate stacks, runtimes, and packaging channels with observable maintenance and community-health signals rather than popularity alone.

#### Scenario: Project health check

- **WHEN** a reader is choosing between maintained alternatives
- **THEN** the guide provides a repeatable check covering release recency, activity, bus factor, issue responsiveness, security process, release engineering, governance, standards compliance, and adoption

#### Scenario: Signals are sourced

- **WHEN** the guide cites a health signal
- **THEN** the reader can verify it through repository APIs, OpenSSF Scorecard, OSV, Reproducible Builds, distro package pages, or Flathub/Snap metadata

### Requirement: Source-backed resources

The guide SHALL maintain a curated resource list that covers the primary sources used for its factual claims.

#### Scenario: Version claims have sources

- **WHEN** a reader wants to verify a version claim for Ubuntu, GNOME, GTK, libadwaita, Qt, KDE, Snap, or Flatpak
- **THEN** `reference/resources.md` or the page itself links to the relevant primary documentation

#### Scenario: Missing source is found

- **WHEN** a review finds a factual claim without a source
- **THEN** the next review adds the source to the page or the resources list, or removes the claim

### Requirement: Baseline consistency

The baseline JSON, the baseline page, and the guide's version claims SHALL agree.

#### Scenario: Baseline is read by the MCP server

- **WHEN** the baseline page or the documentation MCP server returns platform versions
- **THEN** the values come from `src/data/baseline.json` and match the current validated environment

#### Scenario: Baseline is updated

- **WHEN** a supported Ubuntu, Snap, toolchain, or toolkit version changes
- **THEN** the baseline JSON, the baseline page, the affected docs, and `npm run check:baseline` are updated together

### Requirement: Reviewable freshness

The guide SHALL make its next content review repeatable without adding a paid or automated upstream pipeline.

#### Scenario: Next review starts

- **WHEN** a maintainer starts the next Ubuntu or toolkit review
- **THEN** they can use a checklist of sources, baseline fields, affected pages, and validation commands rather than re-discovering the scope

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

### Requirement: Complete stack chapters

Each stack chapter SHALL be complete enough for a reader to start a project, not only to read isolated API snippets.

#### Scenario: Reader starts a Qt project

- **WHEN** a reader follows the Qt chapter
- **THEN** the chapter provides a file tree, a matching CMake file, a complete `main.cpp`, a complete `Main.qml`, and a `QAbstractListModel` with an add action

#### Scenario: Reader starts a Rust project

- **WHEN** a reader follows the Rust chapter
- **THEN** the chapter provides a `Cargo.toml`, a complete gtk-rs `main.rs` with a window action and a list, and a tested domain module

#### Scenario: Reader tests a GTK project

- **WHEN** a reader reaches the testing section of the GTK chapter
- **THEN** the chapter shows a concrete model test and names the metadata and UI checks to run

#### Scenario: Reader checks accessibility

- **WHEN** a reader reaches the accessibility section of any stack chapter
- **THEN** the chapter names the toolkit's accessible properties or roles and a way to test them with Orca or Accerciser

#### Scenario: Snippet is not compiled

- **WHEN** a code block was not compiled in the guide's environment
- **THEN** the chapter labels it as illustrative and links to the API documentation

### Requirement: Evidence-based target selection

The guide SHALL select its development targets from published criteria and dated evidence, not from an arbitrary list of distributions.

#### Scenario: Criteria are published

- **WHEN** a reader opens the target-selection page
- **THEN** the page states the criteria, their weights, the evidence sources, and the review cadence

#### Scenario: A target is proposed

- **WHEN** a distribution or desktop is considered as a target
- **THEN** its adoption, momentum, developer environment, platform quality, support window, and role are recorded with a primary source and a check date

#### Scenario: Popularity proxy is used

- **WHEN** the guide cites Steam, Fedora countme, Debian popcon, Arch pkgstats, or DistroWatch
- **THEN** it labels the metric as a proxy, states its bias or limitation, and does not call it market share

#### Scenario: Missing evidence

- **WHEN** a metric cannot be verified
- **THEN** the guide marks it as unverified instead of estimating it

#### Scenario: Coverage constraints

- **WHEN** the final matrix is selected
- **THEN** it includes at least one GNOME/GTK target, one KDE/Qt target, one LTS/stable target, one current/rolling target, and both deb- and rpm-based distributions

#### Scenario: Target role

- **WHEN** a target appears in the matrix
- **THEN** it is labeled reference, validation, or compatibility and its role is explained

#### Scenario: Review and removal

- **WHEN** a target no longer meets the gates at review time
- **THEN** it is removed or demoted, and the review date and reason are recorded

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
