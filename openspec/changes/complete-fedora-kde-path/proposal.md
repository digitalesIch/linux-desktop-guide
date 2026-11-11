# Proposal

## Why

The Fedora + KDE reference target still points to a Qt chapter whose project is illustrative. The model stores notes only in `QList<Note>` memory, the app adds a fixed placeholder note, and the Fedora RPM spec does not declare every KF6 component that CMake requests. A reader cannot follow the target from a useful core task through persistence, installation, and updates.

This is the remaining content gap in the Fedora reference path. It is separate from the missing Fedora runtime validation, which cannot be performed in this environment.

## What Changes

- Add a persistent `NotesStore` using `QStandardPaths::AppDataLocation`, versioned JSON, and atomic `QSaveFile` writes.
- Extend `NotesModel` with load, add, update, remove, save, reload, error reporting, and row accessors.
- Replace the fixed-note QML demo with a list and an editor that creates, edits, saves, and deletes notes, and shows storage errors.
- Set the application identity consistently: `setDesktopFileName`, matching desktop entry, metainfo, icon, and Flatpak ID.
- Install a `KLocalizedContext`, connect `KDBusService::activateRequested`, and show the existing window on a second launch.
- Add the Qt project's desktop entry and metainfo, and make the Flatpak manifest self-contained.
- Update CMake and QtTest coverage for the store and model.
- Add the missing KF6 `BuildRequires` to the Fedora RPM example and remove the duplicated Flatpak line.
- Record the verification status: source-reviewed here, Fedora build and runtime checks still pending.

## Impact

- `src/content/docs/engineering/qt.md`
- `src/content/docs/platform/packaging.md` only if the RPM dependency list needs the same correction
- `src/content/docs/targets/fedora-kde.md` for the verification status and golden-path wording
- `openspec/changes/complete-fedora-kde-path/`

No new target, route, component, or package channel. The Qt chapter stays the canonical Fedora tutorial; it becomes a coherent source path, not a claim that Fedora runtime validation has happened.
