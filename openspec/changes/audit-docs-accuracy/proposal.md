# Proposal

## Why

The guide is positioned as a practical reference for Ubuntu 26.04 LTS, but a content audit found stale package names, an outdated Snap base, packaging examples that would fail submission, several technical API errors, and missing Ubuntu 26.04 changes. A guide that is confidently wrong is worse than one that is visibly incomplete.

## What Changes

- Correct verified Ubuntu 26.04 facts: Wayland-only GNOME session, `core26` for snaps, .NET 10, OpenJDK 25, Zig 0.15.2, App Center deb support, permission prompting/Security Center, and the support-window wording.
- Fix packaging examples so they are valid for their channel: Snap `core26` with explicit Python, Flathub `git`/`archive` sources instead of local `type: dir`, correct `lintian` architecture, and current Debian policy.
- Fix technical examples that use nonexistent or misleading APIs: `QRecentFiles`, `org.pipewire` as a general D-Bus service, `network-online.target` in a user unit, X11-only `xinput` in a Wayland performance workflow, and CI that mixes `setup-python` with apt PyGObject.
- Add missing modern coverage: GTK 4.22 `GtkSvg` and Glycin, libadwaita 1.9 widgets and reduced-motion API, Qt 6.10 high-contrast and model/view features, Ubuntu 26.04 platform changes, Snap portals and permission prompting, and Flathub metainfo/linter guidance.
- Enforce the editorial rule: remove Apple/macOS references and named competitor comparisons (Electron, Tauri, Flutter, Wails) from the guide.
- Expand `reference/resources.md` with the primary sources used for the audit, including Ubuntu 26.04 release notes, GNOME 50/GTK 4.22/libadwaita 1.9 notes, Qt 6.10 notes, KDE Frameworks 6.24, Snapcraft `core26`, Flathub metainfo/linter, WCAG 2.2/EAA, AT-SPI, Meson/CMake, GStreamer, Security Center/permission prompting, and supply-chain references.
- Add a lightweight content-review checklist and source annotations so the next Ubuntu or toolkit release can be processed without re-auditing everything from scratch.

## Capabilities

### New Capabilities

- `docs-content`: accuracy, coverage, sourcing, and editorial consistency of the guide's prose and examples.

### Modified Capabilities

None.

## Impact

- Most pages under `src/content/docs/`, with the largest changes in `platform/`, `engineering/`, `ship/`, `start/choose-stack.md`, `start/first-app.md`, `start/why-linux.md`, and `reference/`.
- `src/data/baseline.json`, `src/content/docs/reference/baseline.mdx`, and `scripts/check-baseline.mjs`.
- `reference/resources.md` and checklists.
- No route, layout, navigation, or runtime behavior changes.
- No automated freshness pipeline in this change; that remains deferred and free.
