# Tasks

## 1. Cross-target recipe

- [x] 1.1 Add `src/content/docs/start/one-app-across-targets.md` with the three layers, the primary-HIG rule, shared versus target-specific work, packaging scope, test matrix, support statement, and non-goals.
- [x] 1.2 Link the page from the target matrix, the homepage, `choose-stack.md`, and `README.md`; verify the links resolve and no page promises native behavior on both desktops.

## 2. Platform guides

- [x] 2.1 Add a short orientation line to `targets/ubuntu-gnome.md` and `targets/fedora-kde.md` that names the target-native decisions and links the Linux-wide foundation and the cross-target recipe.
- [x] 2.2 Replace the Ubuntu profile's `Primary packaging` label with target-native Snap/deb and cross-target Flatpak; update the trade-off text so Flatpak is not presented as Canonical-supported or preinstalled.
- [x] 2.3 Update the Fedora profile's packaging rows so Flatpak is both target-native and cross-target, with RPM as the archive-native secondary channel.

## 3. Linux-wide foundation and packaging

- [x] 3.1 Update `targets/index.md` to separate platform defaults from the cross-target channel and to explain that Debian, Arch, and Fedora GNOME are validation/compatibility entries, not full golden paths.
- [x] 3.2 Update `platform/packaging.md` with the two packaging scopes and a decision tree: Ubuntu-only, Fedora-only, both reference targets, Debian/Arch; verify Flatpak is never called the Ubuntu native default.
- [x] 3.3 Add the cross-target note to `start/first-app.md` and the packaging step in `start/choose-stack.md`; verify the Flatpak tutorial remains valid while Snap/deb are named as Ubuntu-native.
- [x] 3.4 Update the homepage shipping card and target section to use "cross-target default" rather than an unqualified Flatpak default.
- [x] 3.5 Update `README.md` and `AGENTS.md` so contributors keep platform-native and Linux-wide guidance separate and do not duplicate shared rules.

## 4. Specification and verification

- [x] 4.1 Add `docs-content` requirements for layer separation, the cross-target recipe, and explicit packaging scope; run `openspec validate separate-platform-and-cross-target --strict`.
- [x] 4.2 Run `npm run check:docs`; verify all links, anchors, target-matrix checks, agent docs, and the base path.
- [x] 4.3 Run `npm run check:quality -- --no-build` and review the new page and updated profiles at desktop and narrow widths.
- [x] 4.4 Commit and push; verify the Pages deployment and the live cross-target page.
- [x] 4.5 Archive the change and sync the `docs-content` specification.

## Workflow follow-up

- The structure session adds the sidebar entry for the cross-target page.
- Then close the Fedora KDE development path: persistent Qt core task, app identity, build dependencies, and recorded runtime checks.
- Debian, Arch, and Fedora GNOME validation guides remain the next platform-guide scope.
