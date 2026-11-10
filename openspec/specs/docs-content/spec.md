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
