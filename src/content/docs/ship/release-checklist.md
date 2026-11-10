---
title: Release Checklist
description: A practical pre-release, release-day, and post-release checklist for Linux desktop apps — quality gates, packaging, metadata, UX matrix, and rollback.
---

A release is not "the tests pass and the tag is pushed". It is the moment the app becomes someone else's daily tool. This checklist is designed to catch the failures that unit tests do not: the dark-mode layout that clips, the Flatpak permission that blocks the file picker, the upgrade that loses settings.

Use it as a living document. Delete items that do not apply; add the ones your users keep hitting.

## 1. Freeze and version

- ☐ The version number is final and follows semantic versioning.
- ☐ The version matches the AppStream release, the package version, and `--version`.
- ☐ The changelog/release notes are written for users.
- ☐ Translations are complete for the release; string freeze is over.
- ☐ The git tag is signed and points to the release commit.
- ☐ The build is reproducible from the tag in a clean environment.

## 2. Quality gates

### Tests

- ☐ Unit tests pass.
- ☐ Integration tests pass.
- ☐ Critical UI flows pass (create, open, save, delete, undo).
- ☐ Packaging smoke test passes on a clean VM/container.
- ☐ Upgrade from the previous release is tested.
- ☐ The app starts with a fresh config and with an existing config.

### Accessibility

- ☐ Keyboard-only flow works end to end.
- ☐ Focus is visible and logical; dialogs trap and restore focus.
- ☐ Orca reads the main flows without missing labels.
- ☐ Contrast passes in light, dark, and high-contrast modes.
- ☐ 200% text scaling and 200% display scaling work.
- ☐ Reduced motion is respected.
- ☐ Icon-only buttons have accessible labels.

### Performance

- ☐ Cold start is within budget on the oldest supported hardware.
- ☐ The first window appears before data loading completes.
- ☐ Scrolling holds 60 fps in a realistic dataset.
- ☐ Idle CPU is near zero; no unnecessary timers.
- ☐ Memory stays bounded during a 30-minute session.
- ☐ Large files and large lists do not freeze the UI.

### Security and privacy

- ☐ Flatpak/Snap permissions are minimal and justified.
- ☐ Secrets use the Secret Service, not config files.
- ☐ Logs and crash reports contain no secrets or personal data.
- ☐ Telemetry is opt-in and documented.
- ☐ Dependencies are pinned and scanned for known CVEs.
- ☐ `SECURITY.md` has a working contact.

## 3. UX matrix

Test the app in each of these states, not just your development setup.

| Dimension | States to test |
| --- | --- |
| Color scheme | Light, dark, high contrast |
| Accent | Default, custom system accent |
| Scale | 100%, 125%, 150%, 200% |
| Text size | Default, 150%, 200% |
| Window size | 360 px, 720 px, 1280 px, maximized |
| Monitors | Single, dual, different scales, unplug/replug |
| Input | Mouse, keyboard only, touchpad, touch, IME, RTL |
| Network | Online, offline, slow, captive portal |
| Power | Battery, suspend/resume, low-power mode |
| Files | Empty, large, read-only, permission denied, corrupt |
| Locale | English, German (long words), Arabic (RTL), Japanese |
| Session | Wayland, XWayland fallback if supported |

Also test:

- ☐ First run with no data.
- ☐ Upgrade with existing data.
- ☐ Uninstall/reinstall; data survives or is removed as documented.
- ☐ File open from the file manager and from the command line.
- ☐ Notification actions.
- ☐ Screen lock/unlock while a task runs.
- ☐ Compositor restart or session logout during a save.
- ☐ Disk full during a save (simulate with a small tmpfs).

## 4. Metadata and assets

- ☐ AppStream metainfo validates (`appstreamcli validate --no-net`).
- ☐ Desktop entry validates (`desktop-file-validate`).
- ☐ Icon is installed in hicolor, legible at 16 px and 256 px.
- ☐ Screenshots are current, light and dark, 1600×900 or larger.
- ☐ Release notes are in the metainfo and on the website.
- ☐ The app name, summary, and description match the product.
- ☐ License and copyright are installed.
- ☐ The about dialog shows the correct version, developers, and license.
- ☐ The website/download page links to the current release.

## 5. Packaging

### Flatpak

- ☐ The manifest builds from a clean checkout with no network.
- ☐ `flatpak-builder-lint` passes.
- ☐ Static permissions are minimal; portals work.
- ☐ The app launches from the app grid and the command line.
- ☐ The runtime is current and supported.
- ☐ The app works on a clean install with no host overrides.
- ☐ Data is stored in the sandbox's XDG directories.
- ☐ Uninstall leaves no stray host files.

### deb

- ☐ `dpkg-buildpackage` succeeds in a clean chroot.
- ☐ `lintian` passes (or every warning is understood).
- ☐ Dependencies are correct for the target release.
- ☐ The package installs, upgrades, and removes cleanly.
- ☐ The desktop file and icon appear after install.
- ☐ The app works without the build dependencies installed.

### Snap

- ☐ `snapcraft pack` succeeds.
- ☐ `confinement: strict` is used.
- ☐ The app installs and launches on a clean VM.
- ☐ Interfaces are minimal; portals work.
- ☐ Refresh does not lose data or interrupt work.

### AppImage (if shipped)

- ☐ The AppImage runs on a clean distro.
- ☐ The desktop file and icon are embedded.
- ☐ A checksum and signature are published.
- ☐ The update path is documented.

## 6. Distribution

- ☐ The release is tagged and the artifacts are uploaded.
- ☐ Checksums and signatures are published.
- ☐ Flathub/deb/Snap release notes are live.
- ☐ The website download links point to the new version.
- ☐ The announcement is accurate and includes migration notes.
- ☐ The issue tracker has a release milestone and a known-issues list.
- ☐ Support has the diagnostic instructions and the new version number.

## 7. Release day

- ☐ Smoke-test the published artifact, not the local build.
- ☐ Install from the store/package manager as a user would.
- ☐ Check the software-center listing (name, icon, screenshots, version).
- ☐ Verify the update path from the previous version.
- ☐ Monitor crash reports and issue tracker for the first 24 hours.
- ☐ Have a rollback plan:
  - ☐ previous artifact still available;
  - ☐ store/package rollback procedure documented;
  - ☐ data migration is backward-compatible or reversible.

## 8. Post-release

- ☐ Triage new issues within the agreed window.
- ☐ Respond to reviews and crash reports.
- ☐ Measure adoption and error rates (privacy-preserving).
- ☐ Schedule the next patch release.
- ☐ Update the roadmap and changelog.
- ☐ Thank translators and contributors.

## Release audit

Run the canonical [one-hour audit](/ship/quality-bar/#the-one-hour-audit). It covers the clean install, first launch, file opening, dark mode, 200% scaling, keyboard navigation, error handling, store listing, and upgrade.

For a release, add these checks:

- Install the exact artifact that was published, not a local build.
- Verify the upgrade from the previous version, including its data.
- Confirm the release notes and store listing show the new version.

If any check fails, fix it before you announce.

Next: [The Quality Bar](/ship/quality-bar/) — a scorecard for the whole product.
