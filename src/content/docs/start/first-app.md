---
title: Build Your First App
description: A complete, minimal GTK 4 + libadwaita app for Ubuntu 26.04 — with adaptive layout, XDG storage, keyboard shortcuts, AppStream metadata, and a Flatpak manifest.
---

This tutorial builds **Notes**, a small but real GTK 4 + libadwaita application. It is deliberately incomplete as a product and complete as a *platform citizen*: adaptive layout, XDG storage, a keyboard shortcut, a proper about dialog, AppStream metadata, and a sandboxed Flatpak build with no unnecessary permissions.

The code is Python to keep the example readable. The structure maps directly to C, Rust, or Vala; the toolkit behaves the same.

:::note[What you need]
[Ubuntu 26.04 LTS](/reference/baseline/) (or a recent Fedora/Arch with GTK 4.22 and libadwaita 1.9), `python3-gi`, `gir1.2-gtk-4.0`, `gir1.2-adw-1`, `meson`, `flatpak`, and `flatpak-builder`.
:::

## 1. Install the toolchain

```bash title="Terminal"
sudo apt install python3-gi gir1.2-gtk-4.0 gir1.2-adw-1 \
  meson ninja-build flatpak flatpak-builder \
  desktop-file-utils appstream
```

Install the GNOME runtime and SDK used by the manifest:

```bash title="Terminal"
flatpak remote-add --if-not-exists --user flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install --user flathub org.gnome.Platform//50 org.gnome.Sdk//50
```

The runtime branch is documented in [Flatpak runtimes](https://docs.flatpak.org/en/latest/available-runtimes.html).

## 2. Create the project

```text title="Project layout"
notes/
├── data/
│   ├── io.github.yourname.Notes.desktop
│   ├── io.github.yourname.Notes.metainfo.xml
│   └── io.github.yourname.Notes.svg
├── src/
│   └── main.py
├── io.github.yourname.Notes.yml
└── meson.build
```

The application ID is a reverse-DNS identifier. Use a domain you control, or a code-hosting ID such as `io.github.yourname.Notes`. It must match the desktop file, the metainfo file, the icon name, and the Flatpak ID.

## 3. Write the application

Create `src/main.py`:

```python title="src/main.py"
#!/usr/bin/env python3

import json
import pathlib

import gi

gi.require_version("Gtk", "4.0")
gi.require_version("Adw", "1")

from gi.repository import Adw, Gio, GLib, GObject, Gtk


APP_ID = "io.github.yourname.Notes"


class NotesApplication(Adw.Application):
    def __init__(self):
        super().__init__(application_id=APP_ID)
        self.connect("activate", self.on_activate)
        self.set_accels_for_action("win.new-note", ["<Control>n"])

    def on_activate(self, _app):
        window = NotesWindow(application=self)
        window.present()


class NotesWindow(Adw.ApplicationWindow):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.set_title("Notes")
        self.set_default_size(980, 680)

        self.data_file = pathlib.Path(GLib.get_user_data_dir()) / APP_ID / "notes.json"
        self.notes = self.load_notes()
        self.rows = {}

        # Window actions -------------------------------------------------
        new_action = Gio.SimpleAction.new("new-note", None)
        new_action.connect("activate", self.on_new_note)
        self.add_action(new_action)

        about_action = Gio.SimpleAction.new("about", None)
        about_action.connect("activate", self.on_about)
        self.add_action(about_action)

        # Header bar -----------------------------------------------------
        header = Adw.HeaderBar()

        new_button = Gtk.Button(icon_name="list-add-symbolic")
        new_button.set_tooltip_text("New note (Ctrl+N)")
        new_button.update_property([Gtk.AccessibleProperty.LABEL], ["New note"])
        new_button.set_action_name("win.new-note")
        new_button.add_css_class("suggested-action")
        header.pack_start(new_button)

        menu = Gio.Menu()
        menu.append("About Notes", "win.about")
        menu_button = Gtk.MenuButton(icon_name="open-menu-symbolic", menu_model=menu)
        menu_button.set_tooltip_text("Main menu")
        menu_button.update_property([Gtk.AccessibleProperty.LABEL], ["Main menu"])
        header.pack_end(menu_button)

        # Sidebar --------------------------------------------------------
        self.listbox = Gtk.ListBox()
        self.listbox.set_selection_mode(Gtk.SelectionMode.SINGLE)
        self.listbox.add_css_class("navigation-sidebar")
        self.listbox.connect("row-selected", self.on_row_selected)

        sidebar_scroller = Gtk.ScrolledWindow()
        sidebar_scroller.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC)
        sidebar_scroller.set_child(self.listbox)
        sidebar_scroller.set_vexpand(True)

        # Content --------------------------------------------------------
        self.title_label = Gtk.Label(xalign=0)
        self.title_label.add_css_class("title-2")

        self.body_label = Gtk.Label(xalign=0, wrap=True, selectable=True)
        self.body_label.add_css_class("document")

        content_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=12)
        content_box.set_margin_top(30)
        content_box.set_margin_bottom(30)
        content_box.set_margin_start(36)
        content_box.set_margin_end(36)
        content_box.append(self.title_label)
        content_box.append(self.body_label)

        content_scroller = Gtk.ScrolledWindow()
        content_scroller.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC)
        content_scroller.set_child(content_box)
        content_scroller.set_vexpand(True)

        empty = Adw.StatusPage()
        empty.set_icon_name("document-edit-symbolic")
        empty.set_title("No note selected")
        empty.set_description("Select a note or create a new one with Ctrl+N.")
        empty.set_vexpand(True)

        self.stack = Gtk.Stack()
        self.stack.set_transition_type(Gtk.StackTransitionType.CROSSFADE)
        self.stack.add_named(empty, "empty")
        self.stack.add_named(content_scroller, "editor")
        self.stack.set_visible_child_name("empty")

        # Adaptive split view -------------------------------------------
        split = Adw.OverlaySplitView()
        split.set_sidebar(sidebar_scroller)
        split.set_content(self.stack)
        split.set_min_sidebar_width(240)
        split.set_max_sidebar_width(320)
        split.set_show_sidebar(True)

        breakpoint = Adw.Breakpoint.new(
            Adw.BreakpointCondition.parse("max-width: 600sp")
        )
        breakpoint.add_setter(split, "collapsed", True)
        self.add_breakpoint(breakpoint)

        # Layout ---------------------------------------------------------
        toolbar = Adw.ToolbarView()
        toolbar.add_top_bar(header)
        toolbar.set_content(split)
        self.set_content(toolbar)

        self.refresh()
        self.connect("close-request", self.on_close_request)

    # Data ---------------------------------------------------------------
    def load_notes(self):
        try:
            data = json.loads(self.data_file.read_text(encoding="utf-8"))
            if isinstance(data, list):
                return data
        except (FileNotFoundError, json.JSONDecodeError):
            pass
        return [
            {
                "title": "Welcome to Notes",
                "body": "This note lives in your XDG data directory.\n\n"
                "It survives restarts, works inside a Flatpak sandbox, "
                "and never writes next to the application binary.",
            },
            {
                "title": "Keyboard first",
                "body": "Press Ctrl+N to create a note. Every action in a "
                "native app should be reachable without a mouse.",
            },
        ]

    def save_notes(self):
        self.data_file.parent.mkdir(parents=True, exist_ok=True)
        temp = self.data_file.with_suffix(".tmp")
        temp.write_text(json.dumps(self.notes, indent=2, ensure_ascii=False), encoding="utf-8")
        temp.replace(self.data_file)

    def refresh(self):
        self.listbox.remove_all()
        self.rows.clear()
        for index, note in enumerate(self.notes):
            row = Adw.ActionRow(title=note["title"], subtitle=note["body"].splitlines()[0])
            row.set_subtitle_lines(1)
            row.set_activatable(True)
            self.listbox.append(row)
            self.rows[row] = index

        first = self.listbox.get_row_at_index(0)
        if first is not None:
            self.listbox.select_row(first)

    # Signal handlers ---------------------------------------------------
    def on_row_selected(self, _listbox, row):
        if row is None or row not in self.rows:
            return
        note = self.notes[self.rows[row]]
        self.title_label.set_text(note["title"])
        self.body_label.set_text(note["body"])
        self.stack.set_visible_child_name("editor")

    def on_new_note(self, _action, _param):
        self.notes.insert(0, {"title": "Untitled note", "body": "Start writing…"})
        self.save_notes()
        self.refresh()

    def on_about(self, _action, _param):
        about = Adw.AboutDialog(
            application_name="Notes",
            application_icon=APP_ID,
            developer_name="Your Name",
            version="0.1.0",
            developers=["Your Name <you@example.com>"],
            copyright="© 2026 Your Name",
            license_type=Gtk.License.GPL_3_0,
            website="https://example.org/notes",
            issue_url="https://example.org/notes/issues",
        )
        about.present(self)

    def on_close_request(self, _window):
        self.save_notes()
        return False


if __name__ == "__main__":
    app = NotesApplication()
    app.run(None)
```

Run it locally:

```bash title="Terminal"
python3 src/main.py
```

You should get a window with a sidebar, two notes, an adaptive split view, and a working `Ctrl+N` shortcut. Close and reopen it: the notes persist in `~/.local/share/notes/notes.json`.

## 4. Add the desktop entry

Create `data/io.github.yourname.Notes.desktop`:

```ini title="data/io.github.yourname.Notes.desktop"
[Desktop Entry]
Name=Notes
GenericName=Note Taking
Comment=Write and organize notes
Exec=notes
Icon=io.github.yourname.Notes
Terminal=false
Type=Application
Categories=Office;Utility;
Keywords=notes;writing;markdown;
StartupNotify=true
StartupWMClass=notes
DBusActivatable=true
```

Validate it:

```bash title="Terminal"
desktop-file-validate data/io.github.yourname.Notes.desktop
```

`DBusActivatable=true` needs a matching D-Bus service file when the app is installed outside Flatpak; see [System Integration](/platform/integration/#single-instance-and-activation). Flatpak exports the application ID for you.

## 5. Add AppStream metadata

Create `data/io.github.yourname.Notes.metainfo.xml`:

```xml title="data/io.github.yourname.Notes.metainfo.xml"
<?xml version="1.0" encoding="UTF-8"?>
<component type="desktop-application">
  <id>io.github.yourname.Notes</id>
  <name>Notes</name>
  <summary>Write and organize notes</summary>
  <metadata_license>CC0-1.0</metadata_license>
  <project_license>GPL-3.0-or-later</project_license>

  <description>
    <p>Notes is a small, fast note-taking app for the Linux desktop with a calm, keyboard-first interface.</p>
    <p>It stores your notes locally, works offline, and integrates with the desktop through standard XDG interfaces.</p>
  </description>

  <launchable type="desktop-id">io.github.yourname.Notes.desktop</launchable>
  <url type="homepage">https://example.org/notes</url>
  <categories>
    <category>Office</category>
    <category>Utility</category>
  </categories>
  <keywords>
    <keyword>notes</keyword>
    <keyword>writing</keyword>
    <keyword>markdown</keyword>
  </keywords>
  <developer id="org.example">
    <name>Your Name</name>
  </developer>
  <content_rating type="oars-1.1"/>

  <releases>
    <release version="0.1.0" date="2026-11-10"/>
  </releases>
</component>
```

Validate it:

```bash title="Terminal"
appstreamcli validate --no-net data/io.github.yourname.Notes.metainfo.xml
```

A software center needs more than this to look good — screenshots, categories, keywords, release notes. Those are covered in [AppStream & Metadata](/ship/appstream/).

## 6. Add an icon

Install an SVG icon as `data/io.github.yourname.Notes.svg`. It must be a square, scalable icon that reads at 16 px and at 256 px. For the tutorial, a simple placeholder is fine; do not ship a generic toolkit logo.

```xml title="data/io.github.yourname.Notes.svg"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="#c6ff3d"/>
  <rect x="26" y="30" width="76" height="68" rx="10" fill="#06100b"/>
  <path d="M26 46h76" stroke="#c6ff3d" stroke-width="4"/>
  <path d="M42 62h44M42 76h30" stroke="#5eead4" stroke-width="5" stroke-linecap="round"/>
</svg>
```

## 7. Add the Meson build

Create `meson.build`:

```python title="meson.build"
project('notes', version: '0.1.0', meson_version: '>=1.3.0')

bindir = get_option('bindir')
datadir = get_option('datadir')

configure_file(
  input: 'src/main.py',
  output: 'notes',
  copy: true,
  install: true,
  install_dir: bindir,
  install_mode: 'rwxr-xr-x',
)

install_data('data/io.github.yourname.Notes.desktop',
  install_dir: datadir / 'applications')
install_data('data/io.github.yourname.Notes.metainfo.xml',
  install_dir: datadir / 'metainfo')
install_data('data/io.github.yourname.Notes.svg',
  install_dir: datadir / 'icons' / 'hicolor' / 'scalable' / 'apps')
```

Test the install into a staging directory:

```bash title="Terminal"
meson setup build --prefix=/tmp/notes-prefix
meson install -C build
find /tmp/notes-prefix -type f
```

## 8. Package it as a Flatpak

Create `io.github.yourname.Notes.yml`:

```yaml title="io.github.yourname.Notes.yml"
id: io.github.yourname.Notes
runtime: org.gnome.Platform
runtime-version: '50'
sdk: org.gnome.Sdk
command: notes

finish-args:
  - --share=ipc
  - --socket=wayland
  - --socket=fallback-x11
  - --device=dri

modules:
  - name: notes
    buildsystem: meson
    sources:
      - type: dir
        path: .
```

`type: dir` is for local development only. A Flathub submission uses a `git` source pinned to a tag/commit or an `archive` source with a checksum.

Build and install it for your user:

```bash title="Terminal"
flatpak-builder --user --install --force-clean build-dir io.github.yourname.Notes.yml
flatpak run io.github.yourname.Notes
```

Inspect the sandbox:

```bash title="Terminal"
flatpak info --show-permissions io.github.yourname.Notes
flatpak run --command=sh io.github.yourname.Notes
```

You now have an app that:

- launches from the desktop and the app grid;
- stores data inside its sandbox at `~/.var/app/io.github.yourname.Notes/data/notes/notes.json`;
- uses Wayland and falls back to X11 only when needed;
- has no access to your home directory, network, or devices beyond the GPU;
- uses the GNOME runtime, so the GTK version is the same on every distribution.

## 9. What to change before shipping

This tutorial is intentionally minimal. A real app needs:

- **A real data model.** JSON is fine for a demo; use SQLite for search, migrations, and concurrent access.
- **Editing.** A `Gtk.TextView` with undo/redo, autosave, and conflict handling.
- **Search.** A `Gtk.SearchEntry`, a filtered list model, and a keyboard shortcut.
- **Settings.** A GSettings schema with window size, font, and sort order.
- **Tests.** Unit tests for storage, UI tests for keyboard flows, and a packaging smoke test.
- **Screenshots and release notes.** Required for a good software-center listing.
- **A license, privacy policy, and security contact.** Trust is part of the product.
- **A Flathub submission.** See [Flathub](/ship/flathub/) for the review requirements.

The full example is available in the `examples/notes` directory of this guide's repository. Copy it, rename the app ID, and start replacing the placeholder logic.


## Sources

- [GTK 4 documentation](https://docs.gtk.org/gtk4/)
- [libadwaita 1.9](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/1.9/)
- [Flatpak documentation](https://docs.flatpak.org/)
- [AppStream documentation](https://www.freedesktop.org/software/appstream/docs/)
- [Desktop Entry specification](https://specifications.freedesktop.org/desktop-entry-spec/latest/)
- [Meson](https://mesonbuild.com/)

Next: [The Native Standard](/start/native-standard/) — the ten rules that separate a working app from one that belongs.
