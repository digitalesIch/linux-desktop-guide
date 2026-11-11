---
title: Ubuntu 26.04 LTS + GNOME
description: "The guide's stable GNOME reference target: Ubuntu 26.04 LTS, GNOME 50, GTK 4.22, libadwaita 1.9, Wayland, Flatpak, and the quality gates that keep the app native."
---

This is the guide's **stable GNOME reference target**. It is the right default when you want a GTK 4 + libadwaita app that feels at home on Ubuntu, follows the GNOME HIG, and remains supportable for years.

The target is deliberately conservative. Ubuntu 26.04 is an LTS, not the fastest-moving GNOME distribution. If you need the newest GTK or libadwaita before the next LTS, build on the Fedora validation target and ship the app through a Flatpak runtime with the newer stack.

## Target profile

| Field | Value |
| --- | --- |
| Distribution | Ubuntu 26.04 LTS "Resolute Raccoon" |
| Desktop | GNOME 50 |
| Toolkit | GTK 4.22 + libadwaita 1.9 |
| Languages | C, Vala, Python (PyGObject), Rust (gtk-rs) |
| Display | Wayland. GNOME on Xorg was removed in Ubuntu 25.10; XWayland remains for legacy X11 apps. |
| HIG | [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/) |
| Accessibility | AT-SPI and Orca |
| Primary packaging | Flatpak / Flathub |
| Secondary packaging | deb, Snap (`core26`) |
| Flatpak runtime | `org.gnome.Platform//50`, `org.gnome.Sdk//50` |
| Support | 5 years standard; 10 with Ubuntu Pro; 15 with the Legacy add-on |
| Last validated | 2026-11-10 (Ubuntu 26.04.1) |

## Why this target

- **It is an LTS.** Five years of standard support, ten with Ubuntu Pro, and a predictable upgrade path. That is the longest support window in the guide's matrix.
- **It is Wayland-only.** The Ubuntu GNOME session dropped GNOME on Xorg in 25.10. There is no X11 fallback to design around; XWayland is for legacy apps, not for your app's architecture.
- **The stack is coherent.** GTK 4.22 and libadwaita 1.9 are the toolkit and design system the desktop itself uses. AT-SPI, Orca, portals, and AppStream are part of the platform, not add-ons.
- **The developer environment is reproducible.** Ubuntu publishes an official OCI image and cloud images, and the toolchain is documented in the [Ubuntu for Developers](https://ubuntu.com/developers/docs/) docs.
- **The adoption evidence is strong enough.** Ubuntu is the LTS reference for the GNOME stack, with a long support policy and a large install base. The Steam proxy is version-split and gaming-skewed; it is not treated as market share.

## Trade-offs

- **Flatpak is not preinstalled.** The guide recommends Flatpak/Flathub as the primary channel, but Ubuntu ships Snap and deb first. Install Flatpak explicitly and document the channel in your release notes.
- **GTK 4.22 is not the newest GTK.** Upstream moves faster. Test against the Fedora validation target when you use a newer API, and pin the Flatpak runtime that carries it.
- **Ubuntu Pro is optional.** The baseline records the Pro window because it affects support planning; your app must not require Pro.
- **Snap and deb are secondary, not forbidden.** If you ship them, validate the desktop entry, AppStream metadata, and permissions on the same target.

## Design contract: GNOME

The [GNOME HIG](https://developer.gnome.org/hig/) is the exhaustive reference. This contract is the decision layer for an Ubuntu/GNOME app; use it with the [GTK & libadwaita](/engineering/gtk/) chapter. Checked against the HIG on 2026-11-11.

| Decision | Contract |
| --- | --- |
| **Navigation** | Prefer one window. Use `Adw.ViewStack` with `Adw.ViewSwitcher` for a few equivalent views, and a sidebar when there are too many. Keep hierarchies to one level of depth; avoid stacking windows for core content. |
| **Window chrome** | Use `Adw.ApplicationWindow` and `Adw.HeaderBar`; let the compositor draw the window controls. Do not draw a custom titlebar or custom window buttons. |
| **Dialogs** | Use `Adw.AlertDialog` for alerts and confirmations, and `Adw.Dialog` for actions. Parent them to the window, focus the first control, place Cancel before the affirmative button, and bind `Esc` to cancel. Prefer undo over confirmation for reversible destruction. |
| **Feedback** | Use `Adw.Toast` for non-critical confirmation and undo, `Adw.Banner` for persistent problems, and `Adw.StatusPage` for empty states. Use notifications only for events that happen while the app is in the background. |
| **Spacing and type** | Use libadwaita/GTK spacing, style classes, and the system font; do not hardcode colors, pixel spacing, or a private theme. Respect the system accent, light/dark preference, and text scale. |
| **Icons** | Use symbolic icons for controls and a full-color app icon; install icons in hicolor and follow the icon naming specification. |
| **Keyboard and focus** | Bind shortcuts to `Gio.Action` accelerators, support the standard shortcuts, show focus clearly, and keep a logical tab order. Dialogs trap focus and restore it to the trigger when closed. |
| **Scale and settings** | Test 100–200% scaling, light/dark/high contrast, reduced motion, and large text. Layouts adapt; they do not assume a fixed window size. |
| **On KDE** | A libadwaita app remains a GNOME app on Plasma. Use the KDE portal backend and file dialogs, but do not claim that it follows the Plasma HIG; state the primary desktop and the fallback in the app's support notes. |

This is a decision summary, not a replacement for the HIG. For a pattern not listed here, use the HIG's navigation, container, feedback, and reference sections rather than inventing a convention.

## Development environment

Use the Ubuntu 26.04 OCI image or a 26.04 cloud image. The container is for building and testing; the desktop target is Ubuntu 26.04 with GNOME 50. Do not substitute a newer Ubuntu release and call it the LTS target.

```bash title="Terminal"
podman run --rm -it -v "$PWD:/src:Z" -w /src ubuntu:26.04 bash
```

Install the toolkit, build tools, and packaging validators:

```bash title="Inside the container"
apt update
apt install -y \
  build-essential git pkg-config meson ninja-build \
  python3-gi gir1.2-gtk-4.0 gir1.2-adw-1 \
  libgtk-4-dev libadwaita-1-dev \
  flatpak flatpak-builder desktop-file-utils appstream
```

Install the Flatpak runtime and SDK that match the target:

```bash title="Terminal"
flatpak remote-add --if-not-exists --user flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install --user flathub org.gnome.Platform//50 org.gnome.Sdk//50
```

The runtime branch is part of the target. If you move to a newer GNOME runtime, record it as a target change and re-run the quality gates.

## Golden path

1. [Build Your First App](/start/first-app/) — the complete GTK 4 + libadwaita tutorial with XDG storage, AppStream, Meson, and Flatpak.
2. [GTK & libadwaita](/engineering/gtk/) — application structure, Blueprint, actions, models, settings, async work, testing, and accessibility.
3. [Ubuntu Platform](/platform/ubuntu/) — release support, Snap, deb, Ubuntu Pro, and the Ubuntu-specific services.
4. [AppStream & Metadata](/ship/appstream/) and [Flathub](/ship/flathub/) — the distribution path.
5. [Release Checklist](/ship/release-checklist/) — the final pass before users install.

## Quality gates

Before you call the app ready on this target:

- builds from a clean checkout with the target toolchain;
- the model and storage tests pass without a display;
- `desktop-file-validate` and `appstreamcli validate --no-net` pass;
- the Flatpak builds and runs with the permissions in the manifest;
- Orca reads the main flows and Accerciser shows the expected accessible roles;
- the window works at 200% text scaling and in high-contrast mode;
- startup, input latency, and memory stay within the [performance budgets](/engineering/performance/);
- the app has empty, loading, and error states, and a keyboard path for every action.

## Non-goals

- X11-only apps and X11-specific APIs. XWayland is for legacy software, not a target architecture.
- GTK 3. The reference stack is GTK 4 + libadwaita.
- Ubuntu releases older than 26.04 LTS.
- Requiring Ubuntu Pro or a Snap-only distribution path.
- Treating the Steam or DistroWatch proxies as a user count.

## Sources

- [Ubuntu release cycle](https://ubuntu.com/about/release-cycle)
- [Ubuntu 26.04 LTS release notes](https://documentation.ubuntu.com/release-notes/26.04/)
- [Ubuntu Desktop documentation](https://documentation.ubuntu.com/desktop/en/latest/)
- [Ubuntu for Developers](https://ubuntu.com/developers/docs/)
- [GNOME 50 release notes](https://release.gnome.org/50/)
- [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/)
- [GTK 4 documentation](https://docs.gtk.org/gtk4/)
- [libadwaita documentation](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/)
- [Flathub setup for Ubuntu](https://flathub.org/en/setup/Ubuntu)
- [AT-SPI](https://gitlab.gnome.org/GNOME/at-spi2-core) and [Orca](https://gitlab.gnome.org/GNOME/orca)
- [Ubuntu 25.10 drops GNOME on Xorg](https://discourse.ubuntu.com/t/ubuntu-25-10-drops-support-for-gnome-on-xorg/62538)

Next: [Fedora 45 KDE + Qt](/targets/fedora-kde/) — the other reference target, and the place to see what a KDE-first stack looks like.
