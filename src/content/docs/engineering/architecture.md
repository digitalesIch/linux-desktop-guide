---
title: Architecture
description: "A maintainable structure for Linux desktop apps: the main loop, state, async work, storage, D-Bus, and testing seams that keep the UI fast and the codebase understandable."
---

Desktop apps fail in predictable ways: the main loop blocks, state is duplicated across widgets, storage is coupled to the UI, and the whole thing becomes untestable. The toolkit is not the problem. The structure is.

This page describes an architecture that works for GTK, Qt, and Rust apps of any size. It is deliberately boring: separate the UI from the application logic, keep one source of truth, and make the boundaries testable.

## The main loop is sacred

Every desktop toolkit has an event loop on the main thread. GTK, Qt, and the GLib main context all share the same rule: **do not block it**.

Blocking the main loop means no redraws, no input, no animations, and an unresponsive window. A synchronous network call, a large file read, a database query, or a `sleep` on the main thread is a bug even if it "usually finishes quickly".

```text
main thread:   input → state change → layout → paint → input …
worker thread: I/O, parsing, network, compression
main thread:   receive result → update state → repaint
```

Rules:

- UI objects are touched only on the main thread.
- Long work runs on a worker, a thread pool, or an async runtime bridged to the main loop.
- Results are delivered back to the main thread.
- Every long operation is cancellable.
- Progress is reported, not guessed.

### GTK / GLib

- Use `Gio` async APIs (`load_contents_async`, `read_async`, `GTask`).
- Use `GLib.idle_add` / `GLib.MainContext.invoke_full` to return to the main thread.
- Use `GCancellable` for cancellation.
- Never call `time.sleep()` or a blocking socket on the main thread.

### Qt

- Use `QtConcurrent`, `QThreadPool`, or `QNetworkAccessManager` (async by design).
- Use signals/slots to deliver results to the GUI thread.
- Never touch `QWidget` from a worker thread.
- Use `QFutureWatcher` to observe async work.

### Rust

- `gtk-rs` objects are not `Send`; keep them on the main thread.
- Use `glib::MainContext::spawn_local` for UI-bound async work.
- Bridge Tokio with `glib` carefully; do not run a Tokio runtime on the GTK main thread.
- Use channels to send results back to the UI.

## Layers

A practical structure:

```text
src/
├── main.py / main.rs / main.cpp   # entry point, application lifecycle
├── application/                    # use cases, commands, state
│   ├── app.py
│   └── state.py
├── domain/                         # pure models and rules
│   ├── note.py
│   └── note_repository.py          # interface
├── infrastructure/                 # files, SQLite, network, D-Bus
│   ├── sqlite_repository.py
│   └── sync_client.py
└── ui/                             # widgets, windows, view models
    ├── window.py
    └── preferences.py
```

The dependency rule: **domain does not import UI or infrastructure**. The UI depends on application/domain interfaces; infrastructure implements them. This keeps the core testable without a display server.

For a small app, you do not need four packages. You do need the *seams*: a repository interface, a clock, a network client, and a settings object that can be faked in tests.

## State

Have one source of truth. Widgets render state; they do not own it.

- Keep a model (dataclass, GObject, struct) for the app's data.
- Derive UI from the model; do not copy fields into labels and forget to update them.
- Use observable properties or a small store to notify views.
- Keep transient UI state (selection, focus, scroll) separate from domain state.
- Make invalid states unrepresentable where practical.

### GTK

- GObject properties + `GBinding` for simple cases.
- `Gio.ListStore` + `Gtk.ListView` for collections.
- `Gtk.FilterListModel` / `Gtk.SortListModel` for derived views.
- A small view-model object for complex screens.

### Qt

- `QAbstractItemModel` for lists and tables.
- `Q_PROPERTY` + signals for observable state.
- QML bindings for simple derivation; avoid JavaScript logic in bindings.

### Rust

- Relm4's message/update model, or a plain struct with explicit `update` methods.
- Avoid `Rc<RefCell<>>` webs; prefer ownership plus messages.
- Use `Arc<Mutex<>>` only across threads, not as a default.

## Async and cancellation

Every operation that can take longer than a frame should be cancellable.

```python title="Cancellable file load"
self.cancellable = Gio.Cancellable()

def load(self):
    file = Gio.File.new_for_path(self.path)
    file.load_contents_async(self.cancellable, self.on_loaded)

def on_loaded(self, file, result):
    try:
        ok, contents, _etag = file.load_contents_finish(result)
    except GLib.Error as error:
        if error.matches(Gio.io_error_quark(), Gio.IOErrorEnum.CANCELLED):
            return
        self.show_error(error)
        return
    self.apply(contents)

def cancel(self):
    self.cancellable.cancel()
```

Cancel when the view closes, the user navigates away, or a newer request supersedes the old one. Do not let stale results overwrite fresh state.

## Storage

| Data | Store | Why |
| --- | --- | --- |
| Preferences | GSettings | Desktop integration, schema validation |
| Small app state | Keyfile/JSON | Human-readable, simple |
| Structured/user data | SQLite | Queries, migrations, concurrency |
| Large blobs | Files in XDG data dir | Streaming, backup |
| Secrets | Secret Service | Encrypted, user-controlled |
| Logs | journald or XDG state | Structured, rotated |

Rules:

- Write atomically.
- Version the schema and migrate forward.
- Use transactions for multi-step writes.
- Handle disk full, permission denied, and corrupt data.
- Never store secrets in the same database as ordinary data without encryption.
- Back up before a destructive migration.

## Single instance and IPC

Use `Gtk.Application` / `QApplication` for single-instance behavior and file-open activation. If the app needs a custom service:

- Own a well-known D-Bus name.
- Export a small, versioned interface.
- Validate all inputs.
- Return errors, not crashes.
- Document the interface for other apps.

Do not use a local socket if D-Bus already solves the problem. Do not use the session bus for high-frequency data; use a direct pipe or shared memory.

## Error boundaries

Errors should be handled at the layer that can do something about them:

- **Infrastructure** returns typed errors (`Result`, exceptions, `GError`).
- **Application** decides whether to retry, fall back, or surface.
- **UI** presents a human message and a next step.
- **Logging** records the technical detail with context.

Never swallow an error silently. Never show a raw exception to the user. Never use a crash as control flow.

## Testing seams

Design for tests before you need them:

- Inject the clock, filesystem root, network client, and settings.
- Keep domain logic pure.
- Make the UI constructible with a fake application object.
- Separate "what to do" from "how to draw it".
- Provide a headless mode for integration tests.

If a class is hard to test, it usually has too many responsibilities or talks to the world directly.

## A small example

```python
# domain/note.py
from dataclasses import dataclass

@dataclass(frozen=True)
class Note:
    id: str
    title: str
    body: str

# domain/note_repository.py
from typing import Protocol

class NoteRepository(Protocol):
    def list(self) -> list[Note]: ...
    def save(self, note: Note) -> None: ...
    def delete(self, note_id: str) -> None: ...

# application/notes.py
class NotesService:
    def __init__(self, repository: NoteRepository):
        self.repository = repository

    def create(self, title: str, body: str) -> Note:
        note = Note(id=new_id(), title=title.strip() or "Untitled", body=body)
        self.repository.save(note)
        return note
```

The UI calls `NotesService`; tests use an in-memory `NoteRepository`. The database is an implementation detail.

## Anti-patterns

| Anti-pattern | Cost |
| --- | --- |
| Business logic in signal handlers | Untestable, duplicated, hard to reason about |
| Widgets as the model | State drifts; refresh bugs |
| Global mutable state | Hidden coupling; test interference |
| Blocking the main loop | Frozen UI, watchdog kills, bad reviews |
| One giant window class | 3,000 lines, merge conflicts, no reuse |
| Premature abstraction | Layers with no purpose, more code to maintain |
| Custom IPC when D-Bus exists | Reinvented discovery, auth, and lifecycle |
| Silent exception handling | Data loss with no diagnosis |

## Key takeaways

- Keep the main loop free; move I/O and heavy work off it.
- One source of truth; widgets render state, they do not own it.
- Separate domain, application, infrastructure, and UI with clear seams.
- Make long work cancellable and stale results harmless.
- Use the platform's storage, IPC, and single-instance primitives.
- Testability is an architectural property, not a testing afterthought.

Next: [GTK & libadwaita](/engineering/gtk/) — the deep dive into the Ubuntu-native toolkit.
