# Spec Delta

## ADDED Requirements

### Requirement: Layered platform and Linux-wide guidance

The guide SHALL separate target-native platform guidance from toolkit-neutral Linux-wide guidance. Platform guides SHALL contain the distribution, desktop, toolkit, HIG, native packaging, integration, and validation decisions for one target. Shared rules SHALL live in the Linux-wide chapters.

#### Scenario: A platform guide needs a shared rule

- **WHEN** a platform guide describes accessibility, security, testing, or release criteria that apply beyond one target
- **THEN** it links the canonical Linux-wide page instead of duplicating the rule
- **AND** it states only the target-specific consequence or exception

#### Scenario: A shared chapter needs a target example

- **WHEN** a Linux-wide chapter uses an Ubuntu, Fedora, Debian, or Arch example
- **THEN** it names the target and links the relevant platform guide
- **AND** it does not present that example as the default for every target

### Requirement: Cross-target app recipe

The guide SHALL provide a cross-target recipe that selects one primary HIG and toolkit, shares architecture, data, tests, metadata, and a common package channel, and documents guest behavior on the other desktop.

#### Scenario: One app supports both reference targets

- **WHEN** a reader wants one app on Ubuntu GNOME and Fedora KDE
- **THEN** the recipe names the primary HIG and toolkit, the common package channel, the guest behavior on the other desktop, and the test matrix
- **AND** it states that the app cannot be equally native on both desktops

#### Scenario: A reader asks for one universal stack

- **WHEN** a reader wants one stack that is fully native on every target
- **THEN** the guide states that no toolkit or HIG is native on both GNOME and KDE
- **AND** it requires a primary-desktop choice instead of presenting a universal default

### Requirement: Explicit packaging scope

The guide SHALL distinguish a target-native packaging default from a cross-target channel. It SHALL NOT present a cross-target channel as the target's native default.

#### Scenario: The Ubuntu target is described

- **WHEN** the guide names packaging for Ubuntu 26.04 + GNOME
- **THEN** Snap for third-party apps and deb for archive or system integration are identified as target-native
- **AND** Flatpak is identified as the cross-target channel, not preinstalled and not Canonical-supported

#### Scenario: The Fedora target is described

- **WHEN** the guide names packaging for Fedora 45 KDE
- **THEN** Flatpak/Flathub is identified as both target-native and cross-target
- **AND** RPM is identified as the archive-native secondary channel

#### Scenario: An app supports both reference targets

- **WHEN** an app declares support for both reference targets
- **THEN** Flatpak/Flathub is the cross-target default and target-native channels are optional additions
- **AND** the guide does not require every channel or treat additional channels as a quality score
