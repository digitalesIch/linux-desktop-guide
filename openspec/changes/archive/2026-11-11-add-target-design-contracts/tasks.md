# Tasks

## 1. GNOME design contract

- [x] 1.1 Add a `Design contract: GNOME` section to `targets/ubuntu-gnome.md` covering navigation, header bars, dialogs, feedback, spacing/typography, icons, keyboard/focus, scaling/high contrast, and guest behavior on KDE; verify every recommendation has a matching GNOME HIG concept and the canonical HIG link is present.
- [x] 1.2 Link the contract from `design/principles.md` and check that it does not contradict the shared principles or the GTK chapter.

## 2. KDE design contract

- [x] 2.1 Add a `Design contract: KDE Plasma` section to `targets/fedora-kde.md` covering "simple by default, powerful when needed", navigation, toolbar/menu thresholds, spacing/icons, settings, status/feedback, undo, keyboard, and Plasma-first cross-desktop behavior; verify every recommendation has a matching KDE HIG concept and the canonical HIG link is present.
- [x] 2.2 Link the contract from `design/principles.md` and check that it does not contradict the shared principles or the Qt chapter.

## 3. Shared layer

- [x] 3.1 Update `design/principles.md` to state the three-layer model: canonical HIG, target design contract, shared principles; verify it links both target contracts and keeps the HIGs as the exhaustive reference.
- [x] 3.2 Add the HIG check date and any missing source to `reference/resources.md`; verify no second HIG summary is introduced.

## 4. Verification

- [x] 4.1 Run `npm run check:docs` and `npm run check:quality -- --no-build`; verify headings, links, anchors, and base-path rendering.
- [x] 4.2 Review both contracts and the principles page at desktop and narrow widths; verify the guidance is scannable and does not imply that either HIG is fully reproduced.
- [x] 4.3 Run `openspec validate add-target-design-contracts --strict`; verify only the planned content pages and change artifacts are touched.
- [x] 4.4 Commit and push; verify the Pages deployment and the live sections.

## Workflow follow-up

- Archive after implementation and verification.
- Resume the remaining Fedora KDE validation work; this change adds design guidance, not runtime validation.
