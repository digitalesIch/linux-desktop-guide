# Proposal

## Why

The three stack chapters do not carry the same weight. The GTK chapter has a widget vocabulary, settings, async work, custom widgets, resources, debugging, and pitfalls. The Qt and Rust chapters are about 1,000 words each and stop at fragments: the Qt QML example references a `notesModel` and a `detailPage` that are never defined, and the CMake module name does not match a `Main.qml` file. The Rust example builds a window but has no action, no list, and no state beyond a label. A reader who chooses Qt or Rust does not get the same starting point as a reader who follows the GTK/Python tutorial.

## What Changes

Give all three chapters the same working structure:

1. project skeleton and build files;
2. a complete minimal app with at least one action and one list;
3. a state/data boundary;
4. testing;
5. accessibility;
6. packaging;
7. pitfalls and sources.

Specific fixes:

- **GTK:** add the project skeleton, a testing section with a pure model test and metadata/UI checks, and an accessibility section with `Gtk.Accessible` properties and Orca/Accerciser practice.
- **Qt:** replace the incoherent QML fragment with a complete `Main.qml`, `NotesModel` (`QAbstractListModel`), `main.cpp` with `KAboutData` and `KDBusService`, and a matching `CMakeLists.txt`; add a model test and a concrete accessibility example.
- **Rust:** replace the static window with a complete gtk-rs app that has a window action, a list, and a small tested domain module; add a project tree, a testing section, and an accessibility section.

## Capabilities

### Modified Capabilities

- `docs-content`: stack chapters must be complete enough to start and test a project, not only to illustrate an API.

## Impact

- `src/content/docs/engineering/gtk.md`
- `src/content/docs/engineering/qt.md`
- `src/content/docs/engineering/rust.md`
- No site structure or navigation changes.
- Code remains illustrative where the local environment cannot compile it; claims are limited to documented APIs.
