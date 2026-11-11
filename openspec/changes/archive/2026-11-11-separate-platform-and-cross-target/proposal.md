# Proposal

## Why

The guide mixes two different decisions. Target-native guidance says what is native on Ubuntu or Fedora: toolkit, HIG, package manager, integration, and validation. Cross-target guidance says how one app reaches several targets: a primary HIG, shared architecture, one common package, and explicit guest behavior. Because the pages do not separate these layers, the Ubuntu profile calls Flatpak "primary" even though Canonical supports Snap and deb and does not preinstall Flatpak.

That is not a packaging detail. It is a contradiction in the guide's model. A reader cannot tell whether "default" means the target's native channel or the guide's common upstream channel.

## What Changes

- Define a Linux-wide foundation for toolkit-neutral, shared guidance.
- Treat the existing target profiles as platform guides: target-native stack, HIG, packaging, integration, and validation, with shared rules linked rather than repeated.
- Add a cross-target recipe at `start/one-app-across-targets.md`.
- Distinguish target-native packaging from the cross-target channel:
  - Ubuntu + GNOME: Snap (`core26`) for third-party apps and deb for archive/system integration are native; Flatpak is the cross-target channel, not preinstalled and not Canonical-supported.
  - Fedora + KDE: Flatpak/Flathub is both native and cross-target; RPM is the archive-native secondary channel.
- Update the target matrix, packaging page, first-app tutorial, choose-stack walkthrough, homepage, README, and contributor guidance to use the same model.
- Add `docs-content` requirements for layer separation, the cross-target recipe, and packaging scope.

## Impact

- `src/content/docs/start/one-app-across-targets.md` (new)
- `src/content/docs/targets/index.md`
- `src/content/docs/targets/ubuntu-gnome.md`
- `src/content/docs/targets/fedora-kde.md`
- `src/content/docs/platform/packaging.md`
- `src/content/docs/start/first-app.md`
- `src/content/docs/start/choose-stack.md`
- `src/content/docs/index.mdx`
- `README.md`
- `AGENTS.md`
- `openspec/specs/docs-content/spec.md` via the change delta

No new target, component, stylesheet, or package channel. The existing URLs stay stable. The new page gets one Start sidebar entry; the page is also linked from the target matrix and the cross-target references in this change.
