# Tasks

## 1. Persistent Qt core task

- [x] 1.1 Add a `NotesStore` with XDG `AppDataLocation`, versioned JSON, `QSaveFile` atomic writes, load errors, and a testable file-path constructor.
- [x] 1.2 Extend `NotesModel` with load, add, update, remove, save, reload, `lastError`, and row accessors; verify every mutation persists and a failed write surfaces an error.
- [x] 1.3 Replace the fixed-note QML demo with a list and editor that create, edit, save, delete, and show a storage error; verify the editor reads the selected row and returns to the list.

## 2. Identity and activation

- [x] 2.1 Set `setDesktopFileName` and application identity consistently; add the desktop entry, metainfo, icon name, and Flatpak ID that use the same app ID.
- [x] 2.2 Install a `KLocalizedContext` for QML `i18n()` and connect `KDBusService::activateRequested` to show, raise, and activate the existing window.

## 3. Build, tests, and packaging

- [x] 3.1 Update CMake to build `NotesStore`, `NotesModel`, the application, and QtTest targets; add store round-trip, invalid-file, and model mutation tests.
- [x] 3.2 Make the Flatpak manifest self-contained and remove the duplicated runtime line.
- [x] 3.3 Add the missing KF6 `BuildRequires` to the Fedora RPM example and verify every CMake component has a matching package.
- [x] 3.4 Update the Fedora target's golden-path wording and verification status; do not call the path runtime-validated.

## 4. Verification

- [x] 4.1 Add a source-review note to the Qt chapter that names the missing Fedora build/runtime evidence and links the validation checklist.
- [x] 4.2 Run `npm run check:docs`; verify links, anchors, target consistency, and agent-doc validation.
- [x] 4.3 Run `npm run check:quality -- --no-build` and review the Qt chapter at desktop and narrow widths.
- [x] 4.4 Run `openspec validate complete-fedora-kde-path --strict`; verify only the planned content and change artifacts are touched.
- [ ] 4.5 Commit and push; verify the Pages deployment and the live Qt chapter.
- [ ] 4.6 Archive the change.

## Workflow follow-up

- Run the Fedora 45 Toolbx build, `ctest`, `qmllint`, `qmlcachegen`, `mock` RPM build, and Kinoite Flatpak smoke test; record the results in the target's validation checklist.
- Then add the short validation/compatibility guides for Fedora GNOME, Arch, and Debian.
