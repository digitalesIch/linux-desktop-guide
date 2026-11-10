---
title: System Integration
description: D-Bus, notifications, file dialogs, secrets, search, media controls, background services, and hardware APIs — how a Linux app becomes part of the desktop instead of a window on top of it.
---

A window that opens is not an integrated app. Integration is what happens when the app uses the desktop's file picker, appears in search, sends a notification the user can act on, remembers a password in the keyring, and yields to suspend without leaving a mess.

On Linux, most of that integration happens over **D-Bus** and **XDG Desktop Portals**. The toolkit wraps the common cases; the specs cover the rest.

## The integration surface

| Capability | Standard interface | Typical API |
| --- | --- | --- |
| Application activation | `org.freedesktop.Application` | `Gtk.Application`, `QApplication` |
| Notifications | `org.freedesktop.Notifications` | `Gio.Notification`, `KNotification` |
| File dialogs | FileChooser portal | `Gtk.FileDialog`, Qt platform theme |
| Open files/URLs | OpenURI portal | `Gtk.FileLauncher`, `Gio.AppInfo` |
| Secrets | Secret Service | libsecret, `QKeychain`/KWallet |
| Screen capture | ScreenCast portal | PipeWire + portal |
| Global shortcuts | GlobalShortcuts portal | portal client |
| Search | GNOME Shell search provider | D-Bus service |
| Media controls | MPRIS | `org.mpris.MediaPlayer2` |
| Background/autostart | Background portal | portal client |
| Settings | GSettings / dconf | `Gio.Settings` |
| Power/idle | Inhibit portal, UPower | `Gtk.Application.inhibit`, D-Bus |
| Hardware | UPower, BlueZ, NetworkManager, UDisks | D-Bus proxies |

Use the highest-level API the toolkit offers. It will choose the right transport, handle async, and keep the app working inside a sandbox.

:::note[Ubuntu defaults]
On Ubuntu, these interfaces are provided by specific system services: NetworkManager, PipeWire/WirePlumber, UPower, BlueZ, CUPS, UDisks2, and Polkit. The [Ubuntu Platform](/platform/ubuntu/#system-services) page maps each service to its supported API and tells you when an app should use a portal instead of talking to the service directly.
:::

## Single instance and activation

A desktop app should be a single instance with multiple windows — not five independent processes. `Gtk.Application` and `QApplication` solve this via D-Bus: the first process owns the application bus name, later launches activate it.

```python title="Single-instance application with file opening"
class NotesApplication(Adw.Application):
    def __init__(self):
        super().__init__(
            application_id="io.github.yourname.Notes",
            flags=Gio.ApplicationFlags.HANDLES_OPEN,
        )
        self.connect("activate", self.on_activate)
        self.connect("open", self.on_open)

    def on_activate(self, _app):
        self.present_window()

    def on_open(self, _app, files, _n_files, _hint):
        window = self.present_window()
        for file in files:
            window.open_file(file)
```

Set `DBusActivatable=true` in the desktop entry and ship a D-Bus service file if the app should start on demand:

```ini title="io.github.yourname.Notes.service"
[D-BUS Service]
Name=io.github.yourname.Notes
Exec=/usr/bin/notes
```

`Gtk.Application` implements `org.freedesktop.Application` for you. Do not invent a second activation protocol.

## Notifications

Notifications are for events the user should know about **while not looking at the app**: an export finished, a sync failed, a message arrived. They are not a logging channel and not a way to advertise features.

```python title="Sending an actionable notification"
notification = Gio.Notification.new("Export finished")
notification.set_body("Your notes were exported to Documents.")
notification.add_button("Open folder", "app.open-export")
notification.set_default_action("app.open-export")
notification.set_priority(Gio.NotificationPriority.NORMAL)
app.send_notification("export-finished", notification)
```

- Reuse a stable notification ID to replace an existing notification instead of stacking duplicates.
- Provide an action whenever there is something useful to do.
- Withdraw the notification when the task is cancelled or resolved.
- Never include secrets, tokens, full file paths, or personal data in the body.
- Respect the desktop's "do not disturb" state; do not escalate priority to bypass it.

On GNOME, notifications are grouped by application. On KDE, they follow the host's notification settings. Both are correct. Do not build a custom popup.

## File dialogs and opening files

Use the toolkit's file dialog. It uses the FileChooser portal when sandboxed, remembers the last folder, and respects the desktop's bookmarks.

```python title="Opening a file with Gtk.FileDialog"
dialog = Gtk.FileDialog(title="Open note")
dialog.open(self, None, self.on_open_finished)

def on_open_finished(self, dialog, result):
    try:
        file = dialog.open_finish(result)
    except GLib.Error:
        return  # user cancelled or portal denied
    self.load_note(file)
```

For "open with the default app", use `Gtk.FileLauncher` (GTK 4.10+) or `Gio.AppInfo.launch_default_for_uri()`. Do not shell out to `xdg-open`; it bypasses the sandbox and loses error handling.

For recent files, register with `Gtk.RecentManager` so the file appears in the desktop's recent list. Do not keep a private list that only your app can see.

## Secrets

Never store passwords, OAuth tokens, or API keys in a JSON/INI file. Use the **Secret Service** (libsecret on GNOME, KWallet on KDE with a compatible service). The secret is encrypted at rest and unlocked with the user's login keyring.

```python title="Storing a secret with libsecret"
import gi
gi.require_version("Secret", "1")
from gi.repository import Secret

schema = Secret.Schema.new(
    "io.github.yourname.Notes",
    Secret.SchemaFlags.NONE,
    {"account": Secret.SchemaAttributeType.STRING},
)

Secret.password_store_sync(
    schema,
    {"account": "sync"},
    Secret.COLLECTION_DEFAULT,
    "Notes sync token",
    token,
    None,
)
```

- Use a stable schema name and attributes that identify the secret, not the user's email address.
- Handle "keyring locked" and "user denied" as normal states, not crashes.
- Provide a way to forget the secret.
- In a Flatpak, the Secret Service is available through the portal; no extra filesystem permission is needed.

## Search

If the app has searchable content, expose a GNOME Shell search provider. It is a D-Bus service implementing `org.gnome.Shell.SearchProvider2`:

- `GetInitialResultSet(terms)`
- `GetSubsearchResultSet(previous, terms)`
- `GetResultMetas(ids)`
- `ActivateResult(id, terms, timestamp)`
- `LaunchSearch(terms, timestamp)`

Keep results fast: return IDs first, load metadata lazily, and never block the shell. A search provider is optional; a broken one is worse than none.

On KDE, the equivalent is KRunner runners. Do not build both unless you are targeting both desktops seriously.

## Media controls with MPRIS

Media players should implement **MPRIS** (`org.mpris.MediaPlayer2` and `org.mpris.MediaPlayer2.Player`). That gives the desktop media widget, lock-screen controls, keyboard media keys, and `playerctl` compatibility for free.

Minimum surface:

- `PlaybackStatus` (`Playing`, `Paused`, `Stopped`)
- `Metadata` (title, artist, album, artwork URL, length)
- `Play`, `Pause`, `PlayPause`, `Stop`, `Next`, `Previous`, `Seek`
- `CanPlay`, `CanPause`, `CanGoNext`, `CanGoPrevious`, `CanSeek`

Emit `PropertiesChanged` when state changes. Do not poll the desktop; it will poll you.

## Background work and autostart

A GUI app should not keep a process alive after the last window closes unless it has a real background job. If it does:

- Use `Gtk.Application.hold()` / `release()` to keep the application alive intentionally.
- Use a systemd user service for long-running work, not a hand-rolled daemon.
- Use the Background portal for autostart inside a sandbox.
- Make the background state visible in the UI and easy to turn off.

```ini title="~/.config/systemd/user/notes-sync.service"
[Unit]
Description=Notes sync
After=network-online.target

[Service]
ExecStart=/usr/bin/notes --sync
Restart=on-failure

[Install]
WantedBy=default.target
```

```bash title="Terminal"
systemctl --user enable --now notes-sync.service
journalctl --user -u notes-sync.service -f
```

Do not daemonize manually, fork into the background, or write PID files. systemd already does that job.

## Hardware and system services

Use D-Bus APIs instead of parsing `/proc`, `/sys`, or shelling out to command-line tools.

| Service | Interface | Use for |
| --- | --- | --- |
| UPower | `org.freedesktop.UPower` | Battery, suspend/resume, power profiles |
| BlueZ | `org.bluez` | Bluetooth devices and adapters |
| NetworkManager | `org.freedesktop.NetworkManager` | Connectivity, Wi-Fi, VPN state |
| UDisks2 | `org.freedesktop.UDisks2` | Disks, partitions, mounts |
| PipeWire | `org.pipewire` | Audio/video streams |
| CUPS | `org.cups.cupsd` | Printing |
| GeoClue | `org.freedesktop.GeoClue2` | Location (with permission) |

In a sandbox, many of these are proxied by portals or unavailable by design. Check for the service, handle its absence, and explain the limitation to the user instead of crashing.

## Settings and preferences

Desktop-integrated preferences belong in GSettings, with a schema and an `Adw.PreferencesPage` or a Qt settings dialog. The desktop can then expose search, reset, and backup behavior.

- Group settings by task, not by implementation.
- Use the host's switches, sliders, and combo rows.
- Apply changes immediately; do not require a "Save" button for preferences.
- Provide a "Reset to defaults" action.
- Never hide a critical setting behind a config file only.

## Integration checklist

- ☐ The app is single-instance and handles file-open activation.
- ☐ The desktop entry has `DBusActivatable=true` when appropriate.
- ☐ Notifications are actionable, rate-limited, and contain no secrets.
- ☐ File dialogs use `Gtk.FileDialog` / the FileChooser portal.
- ☐ Opening files/URLs uses `Gtk.FileLauncher` or `Gio.AppInfo`.
- ☐ Secrets use the Secret Service, never plaintext.
- ☐ Recent files use `Gtk.RecentManager`.
- ☐ Search is exposed only if the app has searchable content.
- ☐ Media apps implement MPRIS.
- ☐ Background work uses systemd user units or the Background portal.
- ☐ Hardware state comes from D-Bus services, not `/proc` parsing.
- ☐ Settings are in GSettings with a schema and a reset path.

## Key takeaways

- Integration is a set of standard interfaces, not a pile of features.
- `Gtk.Application` already gives you single-instance behavior and activation; use it.
- Notifications, file dialogs, and secrets have platform APIs. Use them.
- Search and MPRIS are optional, but if you expose them, make them fast and correct.
- Background work belongs in systemd, not in a forked process.

Next: [Flatpak & Portals](/platform/flatpak-portals/) — the sandbox model and the mediation layer that makes integration safe.
