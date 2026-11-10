---
title: The XDG Contract
description: Where Linux apps put configuration, data, state, caches, desktop entries, icons, MIME types, and autostart files — and why the XDG specs are the closest thing the desktop has to a stable API.
---

Linux has no single per-user application-support directory. It has a small set of environment variables and directory conventions maintained by [freedesktop.org](https://specifications.freedesktop.org/). They are boring, underspecified in places, and absolutely essential.

If your app writes to the right place, backups include it, resets remove it, sandboxes map it, and users can find it. If it writes next to the binary, into `~/.myapp`, or into the current working directory, all of that breaks — often silently, often only after a user upgrades.

## The base directories

| Variable | Default | Put here |
| --- | --- | --- |
| `XDG_CONFIG_HOME` | `~/.config` | User preferences and configuration |
| `XDG_DATA_HOME` | `~/.local/share` | User data that should be backed up |
| `XDG_STATE_HOME` | `~/.local/state` | Logs, session state, recent history |
| `XDG_CACHE_HOME` | `~/.cache` | Regenerable data; safe to delete |
| `XDG_RUNTIME_DIR` | `/run/user/$UID` | Sockets, locks, pipes; cleared on logout |
| `XDG_DATA_DIRS` | `/usr/local/share:/usr/share` | System-wide data |
| `XDG_CONFIG_DIRS` | `/etc/xdg` | System-wide configuration defaults |

The `XDG_RUNTIME_DIR` is created by `pam_systemd` with mode `0700`. Do not create it yourself; check that it exists and fall back to a private temporary directory only if necessary.

:::caution[Never hardcode the defaults]
`~/.config` is the default, not a guarantee. Users, containers, test harnesses, and Flatpak all change these variables. Use `GLib.get_user_config_dir()`, `GLib.get_user_data_dir()`, `GLib.get_user_cache_dir()`, `GLib.get_user_state_dir()`, or the equivalent Qt/XDG library.
:::

### A healthy app directory

```text
~/.config/notes/
└── settings.ini              # small, human-editable preferences

~/.local/share/notes/
├── notes.db                  # user data
└── templates/                # user-visible assets

~/.local/state/notes/
├── session.json              # window layout, last opened note
└── logs/
    └── notes.log             # rotated, no secrets

~/.cache/notes/
└── thumbnails/               # regenerable, safe to delete
```

If the app is sandboxed, these paths are remapped inside the sandbox. A Flatpak app's `~/.local/share/notes` becomes `~/.var/app/io.github.yourname.Notes/data/notes`, and the host paths are not visible unless the user granted them. That is the point.

## Configuration: GSettings or a file?

Use **GSettings** when the settings should integrate with the desktop, be discoverable, and be schema-validated. Use a simple config file when the settings are app-private, highly dynamic, or need to be edited outside the app.

| Approach | Best for | Notes |
| --- | --- | --- |
| GSettings / dconf | Desktop-integrated preferences | Schema XML, `glib-compile-schemas`, `Gio.Settings` |
| INI/TOML/JSON | App-private config, portable builds | Write atomically; validate; version the format |
| SQLite | Structured data, search, migrations | Use WAL mode; handle corruption |
| Keyfile (`GKeyFile`) | Small, human-readable config | GLib-native, no extra dependency |

Do not mix all four. Pick one primary store and document the migration path.

### GSettings example

```xml title="data/io.github.yourname.Notes.gschema.xml"
<?xml version="1.0" encoding="UTF-8"?>
<schemalist>
  <schema id="io.github.yourname.Notes" path="/io/github/yourname/Notes/">
    <key name="window-width" type="i">
      <default>980</default>
      <summary>Window width</summary>
    </key>
    <key name="window-height" type="i">
      <default>680</default>
      <summary>Window height</summary>
    </key>
    <key name="sort-order" type="s">
      <default>'modified'</default>
      <summary>Sort order for notes</summary>
      <choices>
        <choice value="modified"/>
        <choice value="title"/>
      </choices>
    </key>
  </schema>
</schemalist>
```

```python title="Persisting window size in Python"
self.settings = Gio.Settings.new(APP_ID)

# On startup: default-width/default-height are the initial size.
self.settings.bind("window-width", self, "default-width", Gio.SettingsBindFlags.DEFAULT)
self.settings.bind("window-height", self, "default-height", Gio.SettingsBindFlags.DEFAULT)

# On close: save the actual size, not the initial size.
def on_close_request(self, _window):
    self.settings.set_int("window-width", self.get_width())
    self.settings.set_int("window-height", self.get_height())
    return False
```

`default-width`/`default-height` are not updated when the user resizes the window; save `get_width()`/`get_height()` on close and restore them with `set_default_size()` or the bindings above.

Install the schema to `$datadir/glib-2.0/schemas/` and run `glib-compile-schemas`. For local development, set `GSETTINGS_SCHEMA_DIR` to the directory containing your compiled schema.

## Desktop entries

Every graphical app needs a `.desktop` file. It is how the app appears in the app grid, the software center, and the file manager's "Open With" menu.

```ini title="io.github.yourname.Notes.desktop"
[Desktop Entry]
Name=Notes
GenericName=Note Taking
Comment=Write and organize notes
Exec=notes %U
Icon=io.github.yourname.Notes
Terminal=false
Type=Application
Categories=Office;
MimeType=text/markdown;text/plain;
Keywords=notes;writing;markdown;
StartupNotify=true
StartupWMClass=notes
DBusActivatable=true
```

| Field | Why it matters |
| --- | --- |
| `Exec` | Must match the installed binary; `%U` passes files/URLs |
| `Icon` | Must match the installed icon name, not a file path |
| `Categories` | Used by menus and software centers; follow the spec |
| `MimeType` | Declares what the app can open; use `xdg-mime` to verify |
| `StartupNotify` | Lets the compositor show a launch indicator |
| `StartupWMClass` | Matches the window to the desktop entry; GTK derives `WM_CLASS` from the program name unless you set it, so test with `xprop WM_CLASS` |
| `DBusActivatable` | Lets the desktop start the app through D-Bus; ship a matching service file with `--gapplication-service` |
| `NoDisplay` | Hides helper entries from menus |
| `OnlyShowIn` / `NotShowIn` | Restricts to specific desktops; use sparingly |

Validate it:

```bash title="Terminal"
desktop-file-validate io.github.yourname.Notes.desktop
```

Do not put shell pipelines or environment-specific paths in `Exec`. If you need environment variables, use a wrapper script or `Exec=env FOO=bar notes`. Keep the command simple and consistent with the installed binary; `%U` passes files or URLs.

## MIME types

The shared MIME-info database tells the desktop how to identify files and which app should open them. For common formats (`text/plain`, `image/png`, `application/pdf`), you only need to declare `MimeType=` in the desktop file.

For a custom format, install an XML file under `$datadir/mime/packages/` and run `update-mime-database`:

```xml title="data/io.github.yourname.Notes-mime.xml"
<?xml version="1.0" encoding="UTF-8"?>
<mime-info xmlns="http://www.freedesktop.org/standards/shared-mime-info">
  <mime-type type="application/x-notes-document">
    <comment>Notes document</comment>
    <glob pattern="*.notes"/>
    <magic priority="60">
      <match type="string" value="NOTES" offset="0"/>
    </magic>
  </mime-type>
</mime-info>
```

```bash title="Terminal"
sudo update-mime-database /usr/share/mime
xdg-mime query default application/x-notes-document
```

Prefer an existing MIME type when one fits. A custom type is a commitment: you need an icon, a description, and a fallback for apps that do not know it.

## Icons

Install icons into the hicolor theme:

```text
/usr/share/icons/hicolor/scalable/apps/io.github.yourname.Notes.svg
/usr/share/icons/hicolor/256x256/apps/io.github.yourname.Notes.png
/usr/share/icons/hicolor/symbolic/apps/io.github.yourname.Notes-symbolic.svg
```

- The name must match the desktop entry's `Icon=` value.
- Provide a scalable SVG and at least a 256×256 PNG fallback.
- A symbolic variant is useful for menus and buttons; keep it monochrome and legible at 16 px.
- Do not install icons into an app-private directory unless the desktop entry points to an absolute path (which is fragile).

## Autostart

Autostart entries live in `$XDG_CONFIG_HOME/autostart/`. They are normal desktop files. A user can disable one by creating an override with `Hidden=true`; do not ship `Hidden=true` in the app's own autostart file, because that disables it for everyone.

```ini title="~/.config/autostart/io.github.yourname.Notes.desktop"
[Desktop Entry]
Type=Application
Name=Notes
Exec=notes --background
Icon=io.github.yourname.Notes
X-GNOME-Autostart-enabled=true
NoDisplay=true
```

Autostart is a user choice, not a default. If the app needs to run in the background, offer an explicit switch in settings. In a sandbox, use the **Background** portal rather than writing to the host autostart directory.

## Trash, recent files, and user directories

- **Trash:** use `Gio.File.trash()` or the Trash portal. Never permanently delete a user file without an explicit confirmation.
- **Recent files:** use `Gtk.RecentManager` on GTK or `KRecentFilesAction` on KDE so the file appears in the desktop's recent list. Do not maintain a private recent-files list.
- **User directories:** use `g_get_user_special_dir()` or `xdg-user-dir` instead of assuming `~/Documents`. The localized paths are defined in `~/.config/user-dirs.dirs`, but the API is the stable interface.

## System-wide installation

| Asset | Install to |
| --- | --- |
| Executable | `$prefix/bin` |
| Desktop entry | `$prefix/share/applications` |
| AppStream metainfo | `$prefix/share/metainfo` |
| Icons | `$prefix/share/icons/hicolor/...` |
| GSettings schema | `$prefix/share/glib-2.0/schemas` |
| MIME package | `$prefix/share/mime/packages` |
| D-Bus service file | `$prefix/share/dbus-1/services` |
| systemd user unit | `$prefix/lib/systemd/user` |
| Translations | `$prefix/share/locale` |
| Documentation | `$prefix/share/doc/$app-id` |
| License | `$prefix/share/doc/<package>/copyright` |

Use your build system's install directories (`get_option('datadir')` in Meson, `GNUInstallDirs` in CMake) instead of hardcoding `/usr/share`.

## Migration and compatibility

Apps evolve. When the storage format changes:

1. Read the old format if it exists.
2. Migrate in memory or into a new file.
3. Write the new format atomically.
4. Keep a backup until the migration succeeds.
5. Never delete the old data on first launch without a fallback.

When moving from `~/.myapp` to XDG paths, look for the old directory once, copy the data, and leave a note in the log. Do not silently abandon the user's history.

## Validation checklist

- ☐ No hardcoded `~/.config`, `~/.local/share`, or `~/.myapp` paths.
- ☐ Config, data, state, cache, and runtime files are separated.
- ☐ Writes are atomic; partial writes cannot corrupt data.
- ☐ The desktop file passes `desktop-file-validate`.
- ☐ The metainfo file passes `appstreamcli validate`.
- ☐ The icon name matches the desktop entry and the app ID.
- ☐ The app declares the MIME types it can open.
- ☐ Autostart is opt-in and uses the Background portal when sandboxed.
- ☐ Recent files and trash use the desktop APIs.
- ☐ A reset removes config and state but not user data without confirmation.

Next: [System Integration](/platform/integration/) — D-Bus, notifications, secrets, search, and the services that make an app feel part of the desktop.
