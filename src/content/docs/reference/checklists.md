---
title: Checklists
description: Condensed, copy-paste checklists for new Linux desktop projects, releases, accessibility, performance, security, metadata, and Flatpak.
---

The short version of this guide. Copy these into an issue template, a `RELEASE.md`, or a pull request checklist.

## New project

- ☐ Pick a primary desktop and toolkit (GTK/libadwaita or Qt/Kirigami).
- ☐ Choose a reverse-DNS application ID and use it everywhere.
- ☐ Set up version control, a license, and a README.
- ☐ Create the app skeleton with `Gtk.Application` / `QApplication`.
- ☐ Add a desktop entry, icon, and AppStream metainfo from day one.
- ☐ Store data in XDG directories from the first commit.
- ☐ Add a build system (Meson or CMake) and a Flatpak manifest.
- ☐ Set up CI: build, tests, metadata validation.
- ☐ Define a startup and memory budget.
- ☐ Add a `SECURITY.md` and a code of conduct.
- ☐ Decide the translation workflow (gettext + Weblate/Damned Lies).

## Before first release

- ☐ Core flows work end to end.
- ☐ Empty, loading, and error states exist.
- ☐ Keyboard-only flow works.
- ☐ Light, dark, and high-contrast modes work.
- ☐ 100%, 125%, 150%, and 200% scaling work.
- ☐ Data persists across restarts; writes are atomic.
- ☐ File open/save uses portals or native dialogs.
- ☐ Notifications are actionable and rate-limited.
- ☐ Secrets use the Secret Service.
- ☐ Desktop file, metainfo, and icon validate.
- ☐ Flatpak builds and runs with minimal permissions.
- ☐ Screenshots and release notes are ready.
- ☐ Upgrade from the previous version is tested.
- ☐ A rollback path exists.

## Accessibility

- ☐ Every action is keyboard reachable.
- ☐ Focus is visible, logical, and restored after dialogs.
- ☐ Every control has an accessible name and role.
- ☐ Icon-only buttons have labels.
- ☐ Contrast meets WCAG 2.2 AA.
- ☐ Text scales to 200% without clipping.
- ☐ Layout works in RTL.
- ☐ Reduced motion is respected.
- ☐ Orca reads the main flows.
- ☐ High-contrast mode works.
- ☐ Media has captions/transcripts.
- ☐ Accessibility statement and contact exist.

## Performance

- ☐ Cold start is within budget on the oldest supported hardware.
- ☐ First window appears before data loading finishes.
- ☐ Main loop never blocks; I/O is async and cancellable.
- ☐ Scrolling holds 60 fps with realistic data.
- ☐ Idle CPU is near zero.
- ☐ Memory stays bounded over 30 minutes.
- ☐ Large files/lists do not freeze the UI.
- ☐ Timers stop when the window is hidden.
- ☐ Startup benchmark runs in CI.
- ☐ A profile has been taken with Sysprof on real hardware.

## Security and privacy

- ☐ The app runs without root.
- ☐ Flatpak/Snap permissions are minimal.
- ☐ Portals are used where available.
- ☐ Secrets are in the keyring, never in files or logs.
- ☐ File writes are atomic; symlinks/traversal handled.
- ☐ Untrusted images use Glycin or an equivalent.
- ☐ Network uses TLS, timeouts, and cancellation.
- ☐ No shell interpolation of untrusted data.
- ☐ Telemetry/crash reporting is opt-in and redacted.
- ☐ Dependencies are pinned and monitored.
- ☐ Updates come from a signed channel.
- ☐ `SECURITY.md` is current.

## Metadata

- ☐ App ID matches metainfo, desktop file, icon, Flatpak, D-Bus.
- ☐ Name and summary are concise and user-facing.
- ☐ Description explains the value.
- ☐ At least two screenshots, light and dark.
- ☐ Release notes are current, newest first.
- ☐ License is valid SPDX.
- ☐ Developer and contact URL are present.
- ☐ Categories and keywords are accurate.
- ☐ Content rating is present.
- ☐ `appstreamcli validate --no-net` passes.
- ☐ `desktop-file-validate` passes.
- ☐ Icon is legible at 16 px.

## Flatpak

- ☐ Manifest at the top level, named after the app ID.
- ☐ Current runtime and SDK.
- ☐ Builds from source with no network.
- ☐ No prebuilt binaries.
- ☐ Minimal `finish-args`.
- ☐ Portal-based file dialogs, notifications, secrets.
- ☐ License files installed.
- ☐ `flatpak-builder-lint` passes.
- ☐ App launches from the app grid.
- ☐ App works on a clean install with no overrides.
- ☐ Data stays inside the sandbox's XDG dirs.
- ☐ Uninstall leaves no stray host files.

## Release day

- ☐ Install the published artifact on a clean VM.
- ☐ Create, open, save, and delete data.
- ☐ Open a file through the file manager.
- ☐ Switch to dark mode and 200% scaling.
- ☐ Tab through the main flow without a mouse.
- ☐ Trigger an error and read the message.
- ☐ Check the software-center listing.
- ☐ Verify the upgrade from the previous version.
- ☐ Publish checksums/signatures.
- ☐ Announce with migration notes.
- ☐ Watch crashes and issues for 24 hours.
- ☐ Keep the previous artifact available.

## The ten-minute audit

If you have ten minutes:

1. Launch the published build.
2. Press `Tab` ten times; can you reach everything?
3. Switch to dark mode; does anything disappear?
4. Set 200% scaling; does anything clip?
5. Open a file through the file manager.
6. Turn off the network; does the app explain itself?
7. Trigger a save error; is the message human?
8. Check the app in the software center.
9. Uninstall; did it leave junk behind?
10. Read the release notes; would you install it?

## Key takeaways

- Checklists are only useful if they are enforced; put them in CI or the PR template.
- The ten-minute audit catches the failures users notice first.
- Metadata and permissions are as important as code.
- Release day is part of the product; plan it.

Back to [The Quality Bar](/ship/quality-bar/) or [Resources](/reference/resources/).
