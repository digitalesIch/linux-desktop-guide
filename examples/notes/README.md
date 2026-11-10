# Notes — reference app

A minimal but complete GTK 4 + libadwaita app used by the [Linux Desktop Guide](../../README.md). It demonstrates:

- an adaptive `Adw.OverlaySplitView` layout;
- XDG data storage with atomic writes;
- a keyboard shortcut and window actions;
- a desktop entry, AppStream metainfo, and an icon;
- a Meson build and a sandboxed Flatpak manifest with no host permissions.

## Run from source

```bash
sudo apt install python3-gi gir1.2-gtk-4.0 gir1.2-adw-1 \
  desktop-file-utils appstream meson ninja-build
python3 src/main.py
```

Data is written to `$XDG_DATA_HOME/notes/notes.json` (usually `~/.local/share/notes/notes.json`).

## Build and install with Meson

```bash
meson setup build --prefix=/tmp/notes-prefix
meson install -C build
/tmp/notes-prefix/bin/notes
```

## Build the Flatpak

```bash
flatpak install flathub org.gnome.Platform//50 org.gnome.Sdk//50
flatpak-builder --user --install --force-clean build-dir io.github.yourname.Notes.yml
flatpak run io.github.yourname.Notes
```

## Validate

```bash
desktop-file-validate data/io.github.yourname.Notes.desktop
appstreamcli validate --no-net data/io.github.yourname.Notes.metainfo.xml
```

## Rename it

The app ID `io.github.yourname.Notes` is a placeholder. Replace it everywhere:

- `src/main.py` (`APP_ID`);
- `data/*.desktop`, `data/*.metainfo.xml`, `data/*.svg`;
- `io.github.yourname.Notes.yml`;
- the `StartupWMClass` and `launchable` fields.

Use a domain you control, or a code-hosting ID such as `io.github.yourusername.Notes`.

## What is intentionally missing

This is a reference, not a product. A real release still needs tests, search, editing, settings, translations, screenshots, a privacy policy, and a Flathub review. The guide covers those steps.
