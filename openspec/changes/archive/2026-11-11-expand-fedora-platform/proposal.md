# Proposal

## Why

Fedora 45 KDE is a reference target, but the guide's platform chapters are still Ubuntu-centric:

- `platform/packaging.md` covers Flatpak, deb, Snap, OCI, and AppImage, but not RPM.
- `platform/security.md` covers AppArmor, but not SELinux, which Fedora enables by default.
- `targets/fedora-kde.md` covers the development environment and quality gates, but not the Fedora-specific integration points a KDE app actually uses: the KDE portal backend, KWallet/KIO/KNotification, systemd user services, firewalld, and the Atomic/Kinoite Flatpak-first model.

A reader who chooses the Fedora KDE reference target can build the app but cannot package it natively, diagnose an SELinux denial, or decide which Fedora integration work is real. That is a content gap in the second reference target.

## What Changes

- Add an **RPM packages** section to `platform/packaging.md`:
  - when RPM is the right secondary channel and when Flatpak remains primary;
  - the Fedora packaging guidelines, a spec-file skeleton, `rpmdev-setuptree`, `rpmbuild`, `mock`, `rpmlint`, `fedpkg`, and COPR;
  - the boundary between a distribution package and a vendor repository.
- Add a **SELinux** section to `platform/security.md`:
  - targeted policy, `getenforce`/`sestatus`, and why disabling SELinux is not a fix;
  - the difference between a desktop user app, a system service, and a Flatpak;
  - `ausearch`, `audit2allow`, `semanage fcontext`, and `restorecon` as diagnostic and packaging tools;
  - why generated policy needs review before shipping.
- Add **Fedora and KDE integration notes** to `targets/fedora-kde.md`:
  - `xdg-desktop-portal-kde`, KWallet, KIO, KNotification, and `KDBusService`;
  - systemd user services and firewalld for apps that need them;
  - Fedora Atomic/Kinoite, Toolbx, and the Flatpak-first rule;
  - links to the new RPM and SELinux sections.
- Add the primary sources to the affected pages and to `reference/resources.md`.

## Capabilities

### New Capabilities

None. This is a content expansion with no new runtime behavior. The change opts out of spec deltas with `skip_specs: true`.

### Modified Capabilities

None. The existing `docs-content` requirements already require target-specific depth, primary sources, and honest uncertainty.

## Impact

- `src/content/docs/platform/packaging.md`
- `src/content/docs/platform/security.md`
- `src/content/docs/targets/fedora-kde.md`
- `src/content/docs/reference/resources.md`
- No site configuration, workflow, route, or sidebar change.
