---
title: One App Across Linux Targets
description: How to ship one Linux app across Ubuntu, Fedora, Debian, and Arch without pretending one toolkit, HIG, or package channel is native everywhere.
---

A single codebase can run on every target in the matrix. It cannot be equally native on GNOME and KDE at the same time. The Linux-wide approach is a shared foundation plus one primary desktop, with explicit guest behavior everywhere else.

This page connects the guide's three layers. Use it after you have chosen a target and before you promise one app for every Linux desktop.

## The three layers

| Layer | Decides | Where it lives |
| --- | --- | --- |
| **Linux-wide foundation** | Standards, architecture, accessibility, security, testing, and release criteria that apply across targets | [Native Standard](/start/native-standard/), [Wayland](/platform/wayland/), [Design Principles](/design/principles/), [Architecture](/engineering/architecture/), [Quality Bar](/ship/quality-bar/) |
| **Platform guide** | Distribution, desktop, toolkit, HIG, native packaging, integration, and validation for one target | [Platform Targets](/targets/) and the target profiles |
| **Cross-target recipe** | Primary HIG and toolkit, shared code, common package, test matrix, and support statement | This page |

The platform guide is the target-native truth. The Linux-wide foundation is toolkit-neutral. This page connects them; it does not replace either.

## Pick a primary desktop

There is no neutral answer. A GTK 4 + libadwaita app follows the GNOME HIG; on Plasma it is a GNOME app using the host's portals and file dialogs. A Qt 6 + Kirigami app follows the KDE HIG; on GNOME it is a KDE app using the host's integration points.

| If the app is for… | Primary stack | Primary HIG | Guest behavior |
| --- | --- | --- | --- |
| GNOME and Ubuntu users | GTK 4 + libadwaita | GNOME | Use KDE portals and host file dialogs; do not claim Plasma HIG compliance |
| KDE and Fedora users | Qt 6 + Kirigami | KDE Plasma | Use GNOME portals and host file dialogs; do not claim GNOME HIG compliance |
| Both equally | Choose one as primary | The chosen HIG | Document the other desktop as a guest; do not average the HIGs |

“Both equally” is not a stack choice. It is a product decision that will make one desktop secondary. State that in the support notes.

## What can be shared

Share the parts that do not encode a desktop's identity:

- the domain model and data format;
- XDG storage, atomic writes, migrations, and recovery;
- domain and storage tests;
- AppStream metadata, desktop-entry fields, app ID, and icon;
- the security model, permissions, and portal use;
- CI, release process, and update policy;
- user documentation and error-message structure.

Keep these target-specific:

- navigation and window chrome;
- toolkit widgets and accessibility wiring;
- HIG-specific dialogs, settings, and feedback;
- native package metadata and integration points;
- screenshots and store copy that show the primary desktop.

## Package once, adapt where needed

Target-native packaging and cross-target packaging are different decisions. Choose the scope first.

| Scope | Default | Why |
| --- | --- | --- |
| **Ubuntu only** | Snap (`core26`) for third-party apps; deb for archive and system integration | Snap is preinstalled and App Center-integrated; deb is archive-supported |
| **Fedora only** | Flatpak / Flathub | Preconfigured, sandboxed, AppStream, human review |
| **Both reference targets** | Flatpak / Flathub | One artifact, one runtime, one store across Ubuntu and Fedora |
| **Debian or Arch** | Flatpak | Compatibility and validation; the host libraries are not the app runtime |

For a cross-target app, Flatpak is the upstream default. Add Snap or RPM only when the audience or a required integration justifies the extra release work. Do not call Flatpak the Ubuntu native default: Ubuntu does not preinstall it and Canonical does not support it as an Ubuntu package format.

The full decision table and recipes are in [Packaging & Distribution](/platform/packaging/).

## Test the claim

A support statement is only as good as the targets you actually run.

- Build and run on the primary target with its native stack.
- Install the declared package on a clean environment.
- Run the core task: create, edit, save, reopen, and recover from a failure.
- On the other reference desktop, check portals, file dialogs, notifications, scaling, high contrast, and keyboard access.
- Run the validation target checks for Fedora GNOME or Arch when the app uses newer toolkit APIs.
- Test install, update, uninstall, and data preservation on the declared channel.
- Record the target, date, version, and evidence in the release notes.

A website build or link check is not app validation. See [Coherent reference development paths](/start/native-standard/#how-this-guide-defines-a-complete-path).

## Declare the support scope

State the supported targets and the primary desktop in the README, the AppStream metadata, and the release notes:

- **Supported:** Ubuntu 26.04 LTS + GNOME and Fedora 45 KDE Plasma.
- **Primary:** GNOME; Plasma is supported as a guest.
- **Package:** Flatpak/Flathub for both; no Snap or RPM yet.
- **Known limits:** no Plasma-native navigation; file dialogs use the host portal.

“Works on Linux” is not a support statement. The [target matrix](/targets/) defines the environments; the [Quality Bar](/ship/quality-bar/#release-criteria) defines what blocks a release.

## What not to do

- **Do not average the HIGs.** A window that borrows GNOME navigation and Plasma toolbars feels accidental on both.
- **Do not ship every channel.** Each channel adds build, review, test, and support work.
- **Do not treat the Flatpak runtime as the host toolkit.** The app runs on the runtime you pin; the host may have a different GTK or Qt.
- **Do not promise native behavior you did not test.** A Qt app on GNOME is a guest, and so is a GTK app on Plasma.
- **Do not expect a separate tutorial for every target.** Two reference paths and short validation checks are enough.

Next: [Platform Targets](/targets/) to choose the environment, then the platform guide for the target you picked.
