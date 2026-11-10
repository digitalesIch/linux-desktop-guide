---
title: Flatpak & Portals
description: How the Flatpak sandbox works, which permissions are acceptable, and how XDG Desktop Portals let a sandboxed app use files, secrets, screen capture, and notifications without owning the system.
---

Flatpak is the upstream-friendly way to ship a Linux desktop app across distributions. It bundles a runtime, runs the app in a sandbox, and mediates access to the host through **XDG Desktop Portals**.

Ubuntu also ships Snap, and `.deb` packages remain the native system format. They are not mutually exclusive. A serious app can ship Flatpak for upstream users, a deb for the Ubuntu archive, and a Snap for the Ubuntu App Center. The important part is that the sandboxed build behaves like a first-class app, not a degraded one.

## The model

```text
┌─────────────────────────────────────────────────────────────┐
│ Flatpak app sandbox                                         │
│                                                             │
│  your app  ──  runtime (GTK/Qt, libraries)  ──  app data    │
│      │                                                      │
│      └──────────────┐                                       │
└─────────────────────┼───────────────────────────────────────┘
                      │ D-Bus / portal frontend
┌─────────────────────▼───────────────────────────────────────┐
│ xdg-desktop-portal                                          │
│  FileChooser · OpenURI · ScreenCast · Secret · Notification │
│  GlobalShortcuts · Background · Camera · Print · …          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│ Desktop services: compositor, file manager, keyring, …      │
└─────────────────────────────────────────────────────────────┘
```

- **Runtime:** a shared base (GNOME 50, KDE 6.10, Freedesktop) with the toolkit and common libraries. It is updated independently of your app.
- **Sandbox:** bubblewrap namespaces restrict filesystem, network, devices, and D-Bus.
- **Portals:** a D-Bus API that asks the desktop to perform a privileged operation on the app's behalf. The desktop shows the UI and enforces policy.
- **Permissions:** declared statically in the manifest (`finish-args`) or granted dynamically through portals.

The goal is simple: **the app should need almost no static permissions**.

## Portals you will actually use

| Portal | Interface | Use |
| --- | --- | --- |
| File chooser | `org.freedesktop.portal.FileChooser` | Open/save files chosen by the user |
| Open URI | `org.freedesktop.portal.OpenURI` | Open a file or URL in the default app |
| Notification | `org.freedesktop.portal.Notification` | Send desktop notifications |
| Secret | `org.freedesktop.portal.Secret` | Store secrets in the keyring |
| ScreenCast | `org.freedesktop.portal.ScreenCast` | Record/share the screen or a window |
| Screenshot | `org.freedesktop.portal.Screenshot` | Take a screenshot |
| GlobalShortcuts | `org.freedesktop.portal.GlobalShortcuts` | User-approved global hotkeys |
| Background | `org.freedesktop.portal.Background` | Autostart/background execution |
| Camera | `org.freedesktop.portal.Camera` | Camera access |
| Location | `org.freedesktop.portal.Location` | Geolocation |
| Print | `org.freedesktop.portal.Print` | Printing |
| USB | `org.freedesktop.portal.USB` | USB device access |
| Settings | `org.freedesktop.portal.Settings` | Read desktop color scheme, fonts, accent |

Most GTK apps do not call the portal directly. `Gtk.FileDialog`, `Gtk.PrintDialog`, `Gio.Notification`, and libsecret use the portal when the app is sandboxed. That is exactly what you want: the same code works inside and outside Flatpak.

:::tip[Test outside the sandbox too]
Portals are available on the host as well. Set `GTK_USE_PORTAL=1` to force GTK to use them while developing, so you catch permission and UI differences before packaging.
:::

## A minimal manifest

```yaml title="io.github.yourname.Notes.yml"
id: io.github.yourname.Notes
runtime: org.gnome.Platform
runtime-version: '50'
sdk: org.gnome.Sdk
command: notes

finish-args:
  # Display
  - --socket=wayland
  - --socket=fallback-x11
  - --share=ipc
  - --device=dri

  # No network, no home directory, no session bus.
  # File access goes through the FileChooser portal.

modules:
  - name: notes
    buildsystem: meson
    sources:
      - type: dir
        path: .
```

The `finish-args` above are a good starting point for a local-first document app. Every additional line should be justified by a feature that cannot use a portal.

### Permission cheat sheet

| Permission | Grants | Verdict |
| --- | --- | --- |
| `--socket=wayland` | Wayland display | Required |
| `--socket=fallback-x11` | X11 via XWayland | Acceptable for compatibility |
| `--share=ipc` | Shared memory with X11 | Usually needed with fallback X11 |
| `--device=dri` | GPU rendering | Needed for hardware acceleration |
| `--share=network` | Full network access | Only if the app needs it; no portal equivalent for arbitrary sockets |
| `--filesystem=xdg-documents` | All documents | Prefer the FileChooser portal |
| `--filesystem=home` | Entire home directory | Avoid |
| `--filesystem=host` | Entire host filesystem | Avoid |
| `--socket=session-bus` | Full session bus | Avoid; use `--talk-name=` for specific services |
| `--socket=system-bus` | Full system bus | Avoid; use a portal or a specific `--system-talk-name=` |
| `--device=all` | All devices | Avoid; use specific devices or portals |
| `--allow=devel` | Debugging ptrace etc. | Development only |

`--talk-name=org.freedesktop.secrets` is sometimes used for direct keyring access. Prefer the Secret portal/libsecret path; it is designed for sandboxes.

## Building and running

```bash title="Terminal"
# Install the runtime and SDK
flatpak install flathub org.gnome.Platform//50 org.gnome.Sdk//50

# Build and install for the current user
flatpak-builder --user --install --force-clean build-dir io.github.yourname.Notes.yml

# Run
flatpak run io.github.yourname.Notes

# Inspect permissions
flatpak info --show-permissions io.github.yourname.Notes
flatpak permissions
```

### Debugging inside the sandbox

```bash title="Terminal"
# Shell inside the app sandbox
flatpak run --command=sh io.github.yourname.Notes

# Run a one-off command in the build environment
flatpak-builder --run build-dir io.github.yourname.Notes.yml sh

# Temporary overrides for debugging only
flatpak override --user --filesystem=/tmp io.github.yourname.Notes
flatpak override --user --share=network io.github.yourname.Notes

# Remove overrides again
flatpak override --user --reset io.github.yourname.Notes
```

Do not ship a manifest that relies on user overrides. If a feature only works after `flatpak override`, the app is not sandbox-compatible yet.

## What "sandbox-compatible" actually requires

1. **No hardcoded host paths.** Use `Gtk.FileDialog` and `Gio.File`; the path you receive may be a portal document ID.
2. **No writing outside XDG dirs.** The app's data directory is writable; everything else is not.
3. **No shelling out to host binaries.** A sandbox may not have `xdg-open`, `nmcli`, or `pactl`. Use D-Bus/portals.
4. **No assuming a session bus name exists.** Check, handle failure, and explain.
5. **No self-updater.** Let Flatpak update the app.
6. **No bundling system libraries.** Use the runtime; add modules only when necessary.
7. **No silent network access.** If the app needs the network, declare it and tell the user why.

## Flatpak vs Snap vs deb

| Dimension | Flatpak | Snap | deb |
| --- | --- | --- | --- |
| Cross-distro | Excellent | Good (snapd on many distros) | Debian/Ubuntu family |
| Sandbox | bubblewrap + portals | AppArmor + interfaces | Traditional, optional hardening |
| Runtime | Shared runtime, frequent updates | Base snap per app | System libraries |
| Store | Flathub | Snap Store | Ubuntu archive/PPA |
| System integration | Portals; some host limits | Interfaces; good Ubuntu integration | Full host access |
| Best for | Upstream apps, Flathub | Ubuntu App Center, server tools | Distro packages, system components |
| Review burden | Flathub review + lint | Store review | Archive review |

For a new upstream desktop app, **Flatpak/Flathub is the default**. Add a deb when you want to be in the Ubuntu archive or need tight system integration. Add a Snap when the Ubuntu App Center is a priority.

## Common mistakes

| Mistake | Consequence | Fix |
| --- | --- | --- |
| `--filesystem=home` | App can read SSH keys, browser data, everything | Use FileChooser portal |
| Writing to `/usr` or next to the binary | Read-only sandbox; update wipes it | Use XDG data dirs |
| Calling `xdg-open` | Binary may not exist in the sandbox | `Gtk.FileLauncher` / OpenURI portal |
| Bundling GTK inside the app | Huge, stale, conflicts with runtime | Use `org.gnome.Platform` |
| No `app-id` match | Desktop file, icon, D-Bus name diverge | One ID everywhere |
| Network permission by default | Unnecessary attack surface | Add only when needed |
| Self-updater | Breaks sandbox and store updates | Remove it |
| Missing metainfo | App invisible or rejected in Flathub | Add AppStream metadata |

## Flathub requirements worth knowing early

Flathub is curated. Before you submit:

- The app must be functional, have a meaningful development history, and provide real user value.
- The application ID must be reverse-DNS and match the metainfo and desktop file.
- The app must build entirely from source with no network access during the build.
- Static permissions must be minimal; portals are mandatory where a suitable portal exists.
- English localization is required for the UI, metadata, and desktop entry.
- The manifest must pass `flatpak-builder-lint`.
- The license must be declared and installed.
- Screenshots, release notes, and a valid AppStream file are required.

The full process is covered in [Flathub](/ship/flathub/).

## Key takeaways

- Flatpak's value is the combination of a shared runtime, a sandbox, and portals.
- A good manifest starts with almost no permissions.
- Portals are not a workaround; they are the supported integration path.
- Test the sandboxed build, not just the host build.
- Flatpak, Snap, and deb solve different problems; choose deliberately.

Next: [Packaging & Distribution](/platform/packaging/) — how the formats differ, and how to ship each one without losing your sanity.
