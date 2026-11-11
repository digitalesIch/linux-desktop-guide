# Tasks

## 1. Target index

- [x] 1.1 Replace "Plasma 6 is Wayland-only" with the Plasma 6.8 boundary and the target's Wayland default.
- [x] 1.2 Replace "the same GNOME stack as Ubuntu" with the actual Fedora GNOME 51/GTK 4.24 vs Ubuntu GNOME 50/GTK 4.22 comparison.
- [x] 1.3 Add a short validation note: the review date is the evidence check date; only Ubuntu 26.04.1 was runtime-validated.

## 2. Target profiles

- [x] 2.1 Change the Fedora KDE "Last validated" field to "Last checked" and add a sentence that runtime validation is pending.
- [x] 2.2 Review the Ubuntu profile wording so "Last validated" is only used for the machine that was actually validated.
- [x] 2.3 Verify the target profile links and anchors still resolve under the `/linux-desktop-guide/` base path.

## 3. Qt chapter

- [x] 3.1 Update the chapter description and opening version paragraph to name both baselines: Ubuntu 26.04 Qt 6.10.2/KF 6.24 and Fedora 45 Qt 6.11/KF 6.30+.
- [x] 3.2 Replace "build it against Qt 6.10 and KDE Frameworks 6.24" with the lower-baseline/compatibility-floor wording.
- [x] 3.3 Check that the CMake `find_package` versions and Flatpak runtime still match the stated lower baseline.

## 4. Baseline review

- [x] 4.1 Replace the "future freshness pipeline" sentence with the current manual review contract and the commands to run.
- [x] 4.2 Keep the review date and source links; do not add a promise that a workflow will open an issue.

## 5. Verification

- [x] 5.1 Run `npm run check:docs`; verify the pages build and all internal links and anchors pass.
- [x] 5.2 Run `npm run check:quality -- --no-build`; verify the Lighthouse budgets still pass.
- [x] 5.3 Review the rendered target index, Fedora KDE page, Qt chapter, and baseline page at desktop and narrow widths.
- [ ] 5.4 Commit and push; verify the Pages deployment succeeds and the live pages show the corrected text.
