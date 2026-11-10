# Design

## Context

See `proposal.md`. The GTK chapter is the deepest because the first-app tutorial gives it a runnable project. Qt and Rust have no equivalent. The pages also use different structures, so readers cannot compare them.

## Goals / Non-Goals

**Goals:**

- A reader can create a minimal project in each stack from the chapter alone.
- Each chapter shows an action, a list, and a state boundary, not only a window.
- Each chapter has a testing and accessibility section.
- The three chapters follow the same section order.

**Non-Goals:**

- Full production apps or a second tutorial series.
- Compiling Qt or GTK C code in the documentation gate; the local environment does not have those toolchains.
- Replacing the first-app tutorial or the example app.
- Covering every toolkit in the Rust ecosystem; the comparison table remains.

## Decisions

### 1. Shared chapter contract

Each chapter contains, in order:

1. **Project skeleton** — file tree and build file.
2. **Minimal app** — complete enough to run.
3. **State and actions** — how the app changes.
4. **Testing** — at least one concrete test.
5. **Accessibility** — toolkit-specific semantics and a test path.
6. **Packaging** — the channel-specific step and a link to the detailed page.
7. **Common pitfalls** and **Sources**.

Sections that already exist keep their content; new sections fill the gaps.

### 2. GTK stays Python-first

The first-app tutorial is Python, and the GTK chapter's snippets are Python. Do not introduce a second language for the minimal app. Add a project skeleton that points to `examples/notes` and the tutorial rather than duplicating the whole Meson project.

### 3. Qt uses a coherent C++/QML split

Use a `QAbstractListModel` in C++ and a QML view. The model is small but complete: roles, `rowCount`, `data`, and an `addNote` invokable. Register it as a context property. Use `KDBusService` and `KAboutData` in `main.cpp`. The CMake module must load `Main.qml` with the same URI.

### 4. Rust uses gtk-rs with a real action

The minimal app uses `adw::ApplicationWindow`, a `Gtk.ListBox`, and a `gio::SimpleAction` bound to the add button and `Ctrl+N`. A small `note` module holds the title normalization and its unit test. This demonstrates the GTK object model without pretending to be a full notes product.

### 5. Label what is illustrative

The local environment has no Qt or GTK C toolchain. The chapters must not claim a compile check that did not happen. Say "illustrative" where appropriate; the APIs are linked to official documentation. The GTK Blueprint snippet already has a compile-check note from an earlier environment; keep that claim scoped to the snippet, not the whole chapter.

### 6. No new screenshots or app showcase

The depth comes from code and explanation, not from promoting an app. The chapters remain toolkit guides.

## Risks / Trade-offs

- **Longer pages** → keep each addition focused on the shared contract; move deep API catalogs to existing reference pages.
- **Qt/GTK code cannot be compiled here** → verify API names against official docs and label illustrative snippets.
- **Duplication with the first-app tutorial** → the GTK chapter links to the tutorial for the full Meson/Flatpak project instead of repeating it.
- **Relm4 and Iced remain comparisons** → the Rust chapter's depth is in gtk-rs, the recommended native path; the other toolkits keep their trade-off notes.
