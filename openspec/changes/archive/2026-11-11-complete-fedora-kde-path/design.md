# Design

## Context

See `proposal.md` for the motivation. The GTK reference path has a runnable example with XDG storage and atomic writes. The Qt path is still a UI demo: `NotesModel` owns a `QList<Note>` in memory and `addNote()` inserts a fixed placeholder. The Fedora target calls the chapter illustrative, and the RPM spec omits KF6 development packages that the CMake file requests.

The environment used to prepare the guide has no Qt 6 or KDE Frameworks development packages, no Toolbx, and no `mock`. A real Fedora build is therefore not available. The content can still be made coherent; the verification claim must stay honest.

## Goals / Non-Goals

**Goals:**

- Give the Qt path a useful core task: create, edit, save, reopen, and delete a note.
- Preserve notes across restarts with XDG paths, a versioned format, atomic writes, and a visible storage error.
- Make app identity, metadata, activation, and packaging agree with the app ID.
- Align CMake, QtTest, RPM `BuildRequires`, and the chapter text.
- Record exactly what has and has not been verified.

**Non-Goals:**

- Running a Fedora 45 Toolbx build or `mock` RPM in this change.
- Adding SQLite, search, synchronization, or a full settings UI.
- Replacing the GTK tutorial or the target matrix.
- Declaring Fedora runtime validation.
- Adding a second packaging channel or a new application example repository.

## Decisions

### 1. A small `NotesStore`, not a database

The core task is local notes. A versioned JSON file is enough to demonstrate XDG data paths, atomic writes, and recovery without adding a database dependency. The chapter keeps the existing note that SQLite is the next step for search and large datasets.

### 2. Persist on every mutation and surface failures

`addNote`, `updateNote`, and `removeNote` update the model and call `save()`. A failed write emits `errorChanged`; QML shows a `Kirigami.InlineMessage`. The model keeps the in-memory edit so the user does not lose input, and `reload()` provides a retry path for a recovered file.

### 3. Use the app ID for desktop identity

`QGuiApplication::setDesktopFileName("io.github.yourname.Notes")` ties the process to the desktop entry and metainfo. The binary remains `notes`; the desktop entry declares `StartupWMClass=notes`, and the metainfo uses the same app ID. `KAboutData` keeps the component name `notes` for the about dialog and translation domain.

### 4. Install `KLocalizedContext` before loading QML

QML uses `i18n()`. The entry point creates a `KLocalizedContext` with the `notes` translation domain and sets it as the engine's root context object. Without it, the QML strings are not translated and `i18n()` is not reliably available.

### 5. Activate the existing window

`KDBusService(KDBusService::Unique)` prevents a second process but does not raise the first window by itself. Connect `activateRequested` to `show()`, `raise()`, and `requestActivate()` on the existing `QQuickWindow`.

### 6. Verification is explicit

The chapter gets a caution block: source-reviewed, not build-tested on Fedora 45 in this revision; no Qt/KF6 toolchain or Toolbx/mock in the preparation environment. The Fedora validation checklist remains the place to record the build, `ctest`, `qmllint`, `qmlcachegen`, `mock`, and runtime results.

## Risks / Trade-offs

- **No compiler available** → Keep the code close to documented Qt/KF6 APIs, add tests that a Fedora builder can run, and do not claim a build.
- **JSON is not a database** → State the limits and point to SQLite for search, migrations, and concurrency.
- **QML editor complexity** → Keep one list page and one editor page; do not add navigation abstractions the example does not need.
- **Duplicate metadata** → Use the same app ID in desktop entry, metainfo, icon, Flatpak manifest, and `setDesktopFileName`; link the AppStream chapter for the full metadata reference.
- **Licensing ambiguity** → Keep the example's GPL-3.0-or-later declaration consistent with the existing GTK example; the repository licensing decision remains a separate content issue.

## Migration Plan

Rewrite the Qt model, entry point, QML view, build, tests, and packaging sections in `engineering/qt.md`; update the Fedora target's illustrative wording; align the RPM `BuildRequires`; run the documentation and quality gates; commit and deploy; archive after verification. The Fedora build and runtime checklist stays open.
