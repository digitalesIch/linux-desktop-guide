---
title: The Native Standard
description: Ten rules for building Linux desktop apps that are fast, accessible, well-integrated, and trustworthy — in any toolkit.
---

Platforms do not feel native because of a color palette. They feel native because the software keeps a set of promises consistently enough that users stop thinking about the software and start thinking about their task.

This is the standard this guide uses. It is toolkit-neutral: GTK, Qt, Rust, and even a web runtime can meet it. In practice, teams usually have three or four weak rules rather than all ten. Fixing those is often the difference between "a Linux build" and "a Linux app".

## 1. Respect the compositor

**Why.** Wayland is the security and performance boundary on Ubuntu 26.04. The compositor owns input, screen capture, window placement, and scaling. Apps that reach around it break under tiling, fractional scaling, screen sharing, and input methods.

**Do**

- Use GTK 4 or Qt 6, which speak Wayland natively.
- Use XDG Desktop Portals for screen capture, file access, notifications, and global shortcuts.
- Support fractional scaling and per-monitor DPI with vector assets and toolkit layouts.
- Let the compositor place windows; save size, not absolute position.

**Avoid**

- X11-only APIs, `xdotool`, `XGrabKey`, `XTest`, and `_NET_WM_*` assumptions.
- Forcing window positions, always-on-top, or global hotkeys without a portal.
- Capturing the screen by reading the framebuffer.

## 2. Start fast, stay responsive

**Why.** A desktop app is judged in the first second. If the window takes three seconds to appear or the UI freezes while loading, no amount of visual polish recovers the impression.

**Do**

- Show the first window as early as possible; defer non-critical work until after the first frame.
- Keep all UI work on the main thread and move I/O, parsing, and network work to workers.
- Use asynchronous APIs and cancellation (`Gio` async, Qt's thread pool, Rust's async runtime bridged to the GLib main loop).
- Cache expensive computations and invalidate deliberately.

**Avoid**

- Blocking the main loop with `sleep`, synchronous network calls, or large file reads.
- Loading every plugin, thumbnail, or database row at startup.
- Fake splash screens that hide a slow architecture.

**Budget.** A focused app should cold-start in under a second on the oldest hardware you support. A complex app should show a usable window in under two seconds. Input latency should stay under 50 ms; scrolling should hold 60 fps.

## 3. Use the platform's widgets before inventing your own

**Why.** Native widgets bring keyboard behavior, accessibility semantics, input methods, high-contrast support, and theme integration for free. Custom-drawn controls bring all of those responsibilities to you.

**Do**

- Use `Adw.HeaderBar`, `Adw.OverlaySplitView`, `Adw.ViewStack`, `Adw.PreferencesPage`, `Gtk.ListView`, `Gtk.FileDialog`, and the rest of the toolkit's vocabulary.
- Extend a widget with composition or a subclass when the behavior is genuinely new.
- Use the toolkit's spacing, typography, and icon conventions.

**Avoid**

- Reimplementing buttons, switches, tabs, or file pickers "for brand reasons".
- Drawing text with a canvas when a label would do.
- Mixing three icon styles in one window.

## 4. Follow the host's HIG where it matters

**Why.** GNOME, KDE, and elementary have different ideas about navigation, density, and dialogs. An app that looks GNOME-native on KDE is not automatically native there; it is a GNOME app running on KDE.

**Do**

- Pick a primary desktop and follow its HIG closely.
- On secondary desktops, use the toolkit's platform integration and avoid hardcoding one desktop's assets.
- Keep window controls, file dialogs, notifications, and menus consistent with the host.
- Put brand expression in the icon, accent, empty states, and content — not in the window frame.

**Avoid**

- Copying another platform's chrome.
- Forcing a dark theme when the user chose light.
- Custom titlebars that break tiling, gestures, or accessibility.

## 5. Make it keyboard-first

**Why.** Linux users expect to drive applications from the keyboard. Keyboard access is also the foundation of screen-reader support and power-user speed.

**Do**

- Support the standard shortcuts: `Ctrl+N`, `Ctrl+O`, `Ctrl+S`, `Ctrl+W`, `Ctrl+Q`, `Ctrl+Z`, `Ctrl+Shift+Z`, `Ctrl+F`, `F1`, `Esc`.
- Give every action a discoverable menu item and, where useful, a shortcut.
- Show focus clearly and keep a logical tab order.
- Make dialogs dismissible with `Esc` and confirm with `Enter` where appropriate.

**Avoid**

- Mouse-only interactions, hover-only controls, and hidden gestures.
- Overriding system shortcuts or grabbing keys globally.
- Keyboard traps in dialogs or custom widgets.

## 6. Integrate through standards

**Why.** The desktop already has a notification system, a file picker, a secrets store, a search index, a media controller, and a settings UI. Reimplementing them is wasted work and usually feels foreign.

**Do**

- Use `GNotification` / `KNotification` for background events, with actions.
- Use `Gtk.FileDialog` / the FileChooser portal, and `Gio.File` for file operations.
- Use the Secret Service (libsecret) for credentials.
- Provide MPRIS for media playback and a search provider only if the app has searchable content.
- Expose a single-instance D-Bus application and handle file-open requests.

**Avoid**

- Custom notification popups.
- Storing passwords in a JSON file.
- Opening a file by shelling out to `xdg-open` when a portal or `Gio.AppInfo` is available.
- Tray-only workflows.

## 7. Ask for the least privilege

**Why.** Sandboxing is only as good as the permissions an app requests. A note-taking app with home-directory access is a note-taking app that can read your SSH keys.

**Do**

- Start with no static permissions and add only what a feature requires.
- Use portals for files, screen capture, camera, location, USB, and printing.
- Explain permission requests in context, before the system dialog appears.
- Test the app with permissions denied and provide a useful fallback.

**Avoid**

- `--filesystem=host`, `--filesystem=home`, or `--socket=system-bus` by default.
- Running a root daemon for something a user service can do.
- Disabling the sandbox because packaging is easier.

## 8. Store data where it belongs

**Why.** Backups, resets, migrations, and sandboxes all depend on the XDG directory layout. An app that writes to `~/.myapp` or next to its binary is invisible to the system and hostile to multi-user setups.

**Do**

- Use `$XDG_CONFIG_HOME` for preferences, `$XDG_DATA_HOME` for user data, `$XDG_STATE_HOME` for logs and session state, `$XDG_CACHE_HOME` for regenerable data, and `$XDG_RUNTIME_DIR` for sockets and locks.
- Write atomically: temp file in the same directory, `fsync` if durability matters, then rename.
- Version your data and migrate forward.
- Respect `$XDG_DATA_DIRS` for system-wide assets.

**Avoid**

- Hardcoded `~/.config` or `~/.local/share` paths.
- Writing logs or caches into the data directory.
- Assuming the home directory is writable, or that the app is the only writer.

## 9. Ship reproducibly

**Why.** Users install software from many channels. Trust comes from being able to rebuild what they run, verify what changed, and update without surprises.

**Do**

- Build from source in a clean environment; pin dependencies and runtimes.
- Publish valid AppStream metadata, a desktop file, icons, screenshots, and release notes.
- Use Flatpak/Flathub for upstream distribution; add deb/Snap only when you can maintain them.
- Sign releases and document the update path.

**Avoid**

- Binary blobs in the manifest or repository.
- Self-updaters inside a sandbox.
- Version numbers that do not match the metadata.
- "Works on my machine" release builds.

## 10. Be a good citizen

**Why.** The desktop is shared. An app that spams notifications, holds a DBus name forever, ignores suspend, or leaves daemons behind makes every other app worse.

**Do**

- Use a single application instance and release resources when idle.
- Respect the user's reduced-motion, contrast, font-size, and power settings.
- Clean up temporary files, sockets, and locks.
- Provide a way to reset settings and export data.
- Write a `SECURITY.md` and respond to reports.

**Avoid**

- Polling in the background for no reason.
- Autostarting without an explicit user choice.
- Registering global shortcuts you do not need.
- Leaving a process running after the last window closes unless the app is genuinely a background service.

## The standard in one sentence

> A native Linux app renders through the compositor, integrates through standards, stores data in XDG locations, asks for the least privilege, starts fast, stays responsive, works from the keyboard, and ships reproducibly.

If you can defend that sentence in a code review, you are building native software.

## How to use this standard

- Use it as a design review checklist before the first release.
- Use it as a code review lens for porting work.
- Use it to push back on shortcuts that will cost more later.
- Use the [Quality Bar](/ship/quality-bar/) to score an app across its seven dimensions.

Next: [Design Principles](/design/principles/) — how the standard becomes an interface.
