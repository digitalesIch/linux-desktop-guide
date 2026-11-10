---
title: Glossary
description: The Linux desktop terms used in this guide — Wayland, XDG, portals, GTK, libadwaita, Flatpak, AppStream, and more — defined in plain language.
---

Terms are grouped by area. Links point to the canonical specification or documentation where one exists.

## Platform

| Term | Meaning |
| --- | --- |
| **AT-SPI** | Accessibility Technology Service Provider Interface. The D-Bus protocol that exposes the UI tree to screen readers such as Orca. |
| **Compositor** | The Wayland process that owns the display, input, window placement, and security boundary. Examples: Mutter (GNOME), KWin (KDE). |
| **D-Bus** | The standard inter-process communication bus on Linux desktops. Used for activation, notifications, settings, hardware services, and portals. |
| **PipeWire** | The modern Linux multimedia server for audio, video, and screen sharing. |
| **Portal** | An XDG Desktop Portal: a D-Bus interface that lets a sandboxed app ask the desktop to perform a privileged operation (open a file, capture the screen, send a notification). |
| **Wayland** | The display protocol where the compositor owns the screen and clients render their own buffers. Default on Ubuntu 26.04. |
| **X11** | The legacy display protocol. Still used via XWayland for compatibility, but not the native target on Ubuntu 26.04. |
| **XWayland** | A compatibility layer that runs X11 apps inside a Wayland session. |
| **XDG Base Directory** | The specification for `XDG_CONFIG_HOME`, `XDG_DATA_HOME`, `XDG_STATE_HOME`, `XDG_CACHE_HOME`, and `XDG_RUNTIME_DIR`. |
| **XDG user dirs** | The localized folders (Documents, Downloads, etc.) defined in `~/.config/user-dirs.dirs`. |
| **systemd user session** | A per-user systemd instance for background services, timers, and session management. |

## Toolkits

| Term | Meaning |
| --- | --- |
| **Adwaita** | GNOME's design system and default theme. |
| **Blueprint** | A declarative UI language for GTK that compiles to `.ui` files. |
| **GApplication** | GLib's application lifecycle, single-instance, and D-Bus activation class. |
| **GIO** | GLib's I/O, file, network, D-Bus, and settings library. |
| **GLib** | The C utility library underneath GTK: data structures, main loop, threads, I/O. |
| **GObject** | The object system used by GTK and GNOME libraries: properties, signals, reference counting. |
| **GSK** | GTK's scene graph and rendering library. |
| **GSettings** | The schema-based settings API backed by dconf. |
| **GTK** | The widget toolkit behind GNOME. GTK 4 is the current stable line. |
| **Kirigami** | KDE's adaptive UI framework built on Qt Quick. |
| **KDE Frameworks** | The libraries behind KDE apps: KConfig, KIO, KNotification, KWallet, and more. |
| **libadwaita** | The GNOME design-system library that extends GTK with headerbars, split views, preferences, dialogs, and toasts. |
| **QML** | Qt's declarative UI language, used with Qt Quick. |
| **Qt** | The cross-platform C++/QML application framework; Qt 6 is current. |

## Packaging and distribution

| Term | Meaning |
| --- | --- |
| **AppImage** | A single-file portable Linux application format. No sandbox or standard update mechanism. |
| **AppStream** | The metadata standard used by software centers for names, summaries, screenshots, releases, and licenses. |
| **Bubblewrap** | The sandboxing tool used by Flatpak to create namespaces and restrict access. |
| **deb** | The Debian/Ubuntu binary package format, installed with `dpkg`/`apt`. |
| **Desktop Entry** | The `.desktop` file that tells the desktop how to launch an app and where it appears. |
| **Flathub** | The largest Flatpak app store and build service. |
| **Flatpak** | A cross-distribution packaging and sandboxing system built on runtimes, OSTree, and portals. |
| **hicolor** | The fallback icon theme hierarchy where apps install their icons. |
| **MetaInfo** | The AppStream XML file, usually `<app-id>.metainfo.xml`, that describes an app to software centers. |
| **OSTree** | The content-addressed filesystem used by Flatpak for runtimes and delta updates. |
| **PPA** | Personal Package Archive on Launchpad for Ubuntu packages. |
| **Runtime** | A shared Flatpak base (GNOME, KDE, Freedesktop) containing the toolkit and common libraries. |
| **Sandbox** | An isolated execution environment that restricts filesystem, network, device, and D-Bus access. |
| **Snap** | Canonical's packaging and confinement system, used by the Ubuntu App Center. |
| **Snapcraft** | The build tool and recipe format for Snap packages. |
| **Verification** | Flathub's process for proving that a publisher controls the app's domain or repository. |

## Design and accessibility

| Term | Meaning |
| --- | --- |
| **Accent color** | The user-selected highlight color used for selection, focus, and primary actions. |
| **Adaptive layout** | A layout that changes structure (not just size) at different window widths. |
| **HIG** | Human Interface Guidelines. GNOME, KDE, and elementary each publish one. |
| **OARS** | Open Age Rating Service, the content rating embedded in AppStream metadata. |
| **Reduced motion** | A system preference that asks apps to minimize or disable animations. |
| **Symbolic icon** | A monochrome icon that inherits the text color and adapts to themes. |
| **WCAG 2.2 AA** | The widely used web/content accessibility standard; desktop apps often use it as a baseline. |

## Security

| Term | Meaning |
| --- | --- |
| **CVE** | Common Vulnerabilities and Exposures: a public identifier for a security flaw. |
| **Glycin** | A sandboxed image-loading library for untrusted images, used by GNOME apps. |
| **Least privilege** | The principle that an app should request only the access it needs for a feature. |
| **Seccomp** | Linux syscall filtering, used by sandboxes to reduce the kernel attack surface. |
| **Secret Service** | The D-Bus API for the user's keyring; libsecret is the common client library. |

## Performance

| Term | Meaning |
| --- | --- |
| **Cold start** | Launching the app when it is not already running or cached. |
| **Frame time** | The time to produce one frame; 16.7 ms for 60 fps. |
| **Sysprof** | The system-wide profiler shipped with GNOME and Ubuntu 26.04. |
| **Wakeup** | A CPU wake event from a timer or interrupt; excessive wakeups drain battery. |

## Media and desktop services

| Term | Meaning |
| --- | --- |
| **MPRIS** | The D-Bus interface for media players, used by desktop media controls and `playerctl`. |
| **StatusNotifierItem** | The D-Bus-based system tray protocol used by some desktops. Support varies; do not rely on it. |
| **UPower** | The D-Bus service for battery and power information. |
| **BlueZ** | The Linux Bluetooth stack and its D-Bus API. |
| **NetworkManager** | The Linux network management service and D-Bus API. |
| **UDisks2** | The D-Bus API for disks, partitions, and mounts. |

## See also

- [The XDG Contract](/platform/xdg/)
- [Flatpak & Portals](/platform/flatpak-portals/)
- [GTK & libadwaita](/engineering/gtk/)
- [Qt & Kirigami](/engineering/qt/)
- [Resources](/reference/resources/)
