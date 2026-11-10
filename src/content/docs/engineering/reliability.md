---
title: Reliability & Logging
description: How Linux desktop apps fail — disk full, network down, permission denied, portal unavailable — and how to log, recover, report crashes, and support users without leaking their data.
---

Every app fails. The disk fills up, the network disappears, the keyring is locked, the compositor restarts, a portal is missing, and a file is corrupted. Reliability is not the absence of failure; it is the ability to fail visibly, recover gracefully, and explain what happened.

This page is about the unglamorous engineering that decides whether users trust the app after the first bad day.

## Failure modes

| Failure | What the user sees | What the app should do |
| --- | --- | --- |
| Disk full | Save fails | Keep the draft in memory, offer export, explain |
| Permission denied | File cannot open | Explain which permission; suggest the portal |
| Network down | Sync fails | Keep local data, retry with backoff, show offline state |
| Keyring locked | Secret unavailable | Prompt to unlock; do not crash |
| Portal missing | File dialog unavailable | Fall back to a clear explanation, not a dead button |
| Corrupt config | App fails to start | Back up, reset to defaults, tell the user |
| Corrupt database | Data unreadable | Restore backup, run integrity check, preserve the file |
| Compositor restart | Window disappears/reappears | Reconnect, restore size/state, do not lose work |
| Suspend/resume | Timers fire late | Recompute state, reconnect, refresh |
| Out of memory | App killed | Reduce caches, stream data, fail gracefully |
| Dependency missing | Import/startup error | Ship the runtime; fail with a clear message |

## Error handling

Handle errors at the layer that can do something about them.

- **Infrastructure** returns typed errors with context.
- **Application** decides: retry, fall back, or surface.
- **UI** presents a human message and a next step.
- **Logging** records the technical detail with a correlation ID.

Do not swallow exceptions. Do not show a raw traceback as the primary message. Do not use a crash as control flow.

```python title="A user-facing error with technical detail"
try:
    self.repository.save(note)
except StorageFullError as error:
    self.show_error(
        title="Could not save the note",
        body="The disk is full. Free some space, then try again.",
        details=str(error),
        retry=self.save_current_note,
    )
```

The "Details" expansion can show the technical error; the primary message must be understandable.

## Logging

Logs are for diagnosis, not for users. They should be structured, leveled, rotated, and free of secrets.

### GLib / C

```c
#define G_LOG_DOMAIN "notes"

g_message("Opened database at %s", path);
g_warning("Sync failed: %s", error->message);
g_debug("Loaded %u notes", count);
```

GLib logs go to stderr, which systemd captures in the journal when the app is launched from a unit or desktop session. Use `g_log_structured()` if you need key-value fields.

### Python

```python title="Structured-ish logging"
import logging

log = logging.getLogger("notes")

log.info("opened database", extra={"path": path})
log.warning("sync failed", extra={"error": str(error)})
```

Configure one handler at startup. Do not call `logging.basicConfig()` in library code. Send logs to stderr; let the session capture them.

### Qt

```cpp
Q_DECLARE_LOGGING_CATEGORY(notes)
Q_LOGGING_CATEGORY(notes, "notes")

qCInfo(notes) << "Opened database" << path;
qCWarning(notes) << "Sync failed" << error;
```

Use `QT_LOGGING_RULES="notes.debug=true"` to enable categories at runtime.

### Rust

```rust
use tracing::{info, warn};

info!(path = %path.display(), "opened database");
warn!(error = %error, "sync failed");
```

Initialize `tracing-subscriber` once, with a level from `RUST_LOG` or a `--debug` flag. Do not log secrets or full document contents.

### Log levels

| Level | Use |
| --- | --- |
| Error | The operation failed and the user needs to know |
| Warning | Something is degraded but recoverable |
| Info | Lifecycle events: start, open, save, sync |
| Debug | Diagnostic detail, off by default |
| Trace | Very verbose, development only |

Rate-limit repeated warnings. A broken network should not produce one log line per retry per second.

## journald

On a systemd desktop, stderr is captured by the journal. Users and support can inspect it:

```bash title="Terminal"
journalctl --user -u notes.service -f
journalctl --user --since "1 hour ago" | grep notes
```

For a GUI app launched from the desktop, the journal may show the app's stderr under the session. Use `journalctl --user -b` and filter by the app name or a structured field.

Do not write your own log rotation unless you have a specific need. If you do write a log file, put it in `XDG_STATE_HOME`, rotate it, and bound its size.

## Crash reporting

### Local crash dumps

Ubuntu uses `systemd-coredump`. Check for crashes:

```bash title="Terminal"
coredumpctl list notes
coredumpctl info notes
coredumpctl gdb notes
```

Ship with symbols or a separate debug package so the stack trace is useful. Do not strip everything and then ask users for a backtrace.

### Remote crash reporting

Remote reporting must be **opt-in** and privacy-preserving.

- Show a crash dialog with "Send report" and "Don't send".
- Explain what is included (stack trace, app version, OS, GPU) and what is not (documents, paths, secrets).
- Scrub paths and usernames.
- Use a project-specific DSN/key; do not embed a shared secret.
- Provide a way to inspect the payload before sending.
- Honor the user's choice permanently.

Sentry, Backtrace, and self-hosted endpoints are all viable. The important part is consent and redaction.

## Data integrity

- Write files atomically: temp file in the same directory, `fsync`, rename.
- Use SQLite transactions for multi-step writes.
- Enable WAL mode for concurrent reads; handle `SQLITE_BUSY`.
- Version the schema and migrate forward in a transaction.
- Back up before a destructive migration.
- Run `PRAGMA integrity_check` on startup or on demand; if it fails, preserve the file and offer recovery.
- Never truncate a file before the replacement is durable.

```python title="SQLite migration"
with connection:
    version = connection.execute("PRAGMA user_version").fetchone()[0]
    if version < 2:
        connection.execute("ALTER TABLE notes ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0")
        connection.execute("PRAGMA user_version = 2")
```

## Recovery

Users should be able to recover from a bad state without losing everything.

- **Autosave** drafts and restore them after a crash.
- **Session restore** for open windows, tabs, and scroll positions.
- **Safe mode** that starts with settings disabled when a plugin or config causes a crash.
- **Reset settings** without deleting user data.
- **Export data** in an open format before a destructive operation.
- **Backup rotation** for the database and config.

A "Reset" button that silently deletes documents is not recovery; it is data loss.

## Diagnostics

Give support a way to collect the facts:

```bash title="Terminal"
notes --version
notes --debug
notes --doctor
```

`--doctor` can check:

- app version, runtime, toolkit version;
- session type (Wayland/X11) and desktop;
- portal availability;
- permissions (Flatpak/Snap);
- config/data paths and writability;
- database integrity;
- recent errors (redacted).

A diagnostic bundle should be a single file the user can review before sending. Never include documents or secrets by default.

## Resource cleanup

- Cancel async work when a view closes.
- Disconnect signal handlers when a widget is destroyed.
- Release idle inhibitors, screen casts, and file locks.
- Close database connections and flush writes on exit.
- Remove temporary files and sockets.
- Handle `SIGTERM` and session logout gracefully; do not block shutdown indefinitely.

## Reliability checklist

- ☐ Every I/O operation has an error path.
- ☐ The app can start with a missing config, corrupt cache, and read-only data dir.
- ☐ Writes are atomic; migrations are transactional.
- ☐ Logs are leveled, rate-limited, and free of secrets.
- ☐ Crashes produce a useful local backtrace.
- ☐ Remote crash reporting is opt-in and redacted.
- ☐ Autosave and session restore exist for editable content.
- ☐ There is a safe mode or settings reset.
- ☐ `--version`, `--help`, and `--debug` work.
- ☐ The app handles suspend/resume and compositor restart.
- ☐ Background work is cancellable and cleaned up.
- ☐ Support has a diagnostic bundle path.

## Key takeaways

- Reliability is designed: every failure needs a path, a message, and a recovery.
- Logs are for diagnosis; keep them structured, bounded, and secret-free.
- Crash reporting requires consent and redaction.
- Atomic writes, transactions, and migrations prevent the worst data loss.
- Autosave, session restore, and safe mode turn a disaster into an inconvenience.
- A diagnostic command is a feature, not an afterthought.

Next: [AppStream & Metadata](/ship/appstream/) — how the software center sees your app.
