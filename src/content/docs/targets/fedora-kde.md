---
title: Fedora 45 KDE Plasma + Qt
description: "The guide's upstream-current KDE reference target: Fedora 45 KDE Plasma, Qt 6, KDE Frameworks 6, Kirigami, Wayland, Flatpak, RPM, SELinux, and the quality gates for a KDE-native app."
---

This is the guide's **upstream-current KDE reference target**. It is the right default when you want a Qt 6 + Kirigami app that follows the KDE HIG, uses Plasma's integration points, and ships through Flatpak without asking users to change distribution.

The target is deliberately current, not LTS. Fedora moves quickly, so the target assumes an annual upgrade cadence. The KDE 6.6 LTS series is supported longer by upstream, but this target follows the Fedora KDE edition and the current Plasma release.

## Target profile

| Field | Value |
| --- | --- |
| Distribution | Fedora 45 KDE Plasma Desktop |
| Desktop | KDE Plasma 6.7 or newer (check `plasmashell --version`; Fedora 45 may ship 6.7.x) |
| Toolkit | Qt 6.11 + KDE Frameworks 6.30 or newer + Kirigami |
| Languages | C++ and QML (primary). Python via PySide6 is possible, but the KDE HIG and examples target C++/QML. |
| Display | Wayland. Plasma 6.8 retires X11 sessions; check the session options on the exact Fedora package. |
| HIG | [KDE Human Interface Guidelines](https://develop.kde.org/hig/) |
| Accessibility | QAccessible and Orca |
| Primary packaging | Flatpak / Flathub (preconfigured on Fedora) |
| Secondary packaging | rpm |
| Flatpak runtime | `org.kde.Platform//6.10`, `org.kde.Sdk//6.10` (the project baseline; verify the current Flathub branch) |
| Support | Approximately 13 months |
| Last checked | 2026-11-10 |

The date is the evidence review date. Runtime validation on Fedora 45 is still pending; use `plasmashell --version`, the Fedora package, and the checks below on the exact release before you promise a version.

## Why this target

- **Fedora KDE is a flagship edition.** It is not a second-class spin; Fedora ships it as a first-class desktop alongside Workstation.
- **Flatpak and Flathub are ready.** Fedora Workstation, Silverblue, Kinoite, and the KDE edition ship Flatpak and configure Flathub through Third-Party Repositories. The target does not require a manual store setup.
- **Qt and KDE Frameworks are current.** Qt 6.11 and KDE Frameworks 6.30+ give you the modern Qt Quick, Kirigami, KIO, KNotification, and KDBusService stack.
- **The KDE stack has momentum.** Fedora KDE `countme` sample hits rose 25.8% between April and October 2026. Plasma 6.8 retires X11 sessions and adds accessibility and remote-desktop work. KDE e.V. and a public patron list back the project.
- **The HIG is explicit.** KDE publishes a HIG and Kirigami patterns; a KDE-first app should use them instead of importing GNOME conventions.

## Trade-offs

- **The support window is short.** Fedora releases are supported for about 13 months. Plan an annual upgrade and test the app on the next Fedora release before it lands.
- **The exact Plasma version can lag the upstream announcement.** Fedora 45 may package Plasma 6.7.x even though Plasma 6.8 is current upstream. Check `plasmashell --version` and the Fedora package before you promise a version in your own docs.
- **The Flatpak runtime can lag the distribution.** `org.kde.Platform//6.10` is the project baseline; the distro may have newer Qt. Pin the runtime in the manifest and test against it.
- **KDE accessibility is improving, not finished.** QAccessible and Orca work, but test the main flows rather than assuming parity with GNOME.
- **X11 is not the target.** Plasma 6.8 retires X11 sessions. Use Wayland and let XWayland handle legacy apps.

## Development environment

Use the Fedora 45 KDE edition, or a Fedora 45 container for build and test. The container is not the desktop target; it is the reproducible build environment. Install `toolbox` first if your Fedora edition does not include it.

```bash title="Terminal"
toolbox create --distro fedora --release 45
toolbox enter fedora-toolbox-45
```

Install the Qt/Kirigami development packages:

```bash title="Inside the toolbox"
sudo dnf5 install -y \
  cmake ninja-build extra-cmake-modules \
  qt6-qtbase-devel qt6-qtdeclarative-devel \
  kf6-kirigami-devel kf6-ki18n-devel kf6-kconfig-devel \
  kf6-kcoreaddons-devel kf6-kdbusaddons-devel
```

For a full KDE desktop inside a regular Fedora installation:

```bash title="Terminal"
sudo dnf5 install -y @kde-desktop-environment
```

For upstream KDE development, use `kdesrc-build` and the [KDE developer documentation](https://develop.kde.org/). For the app in this guide, the [Qt & Kirigami](/engineering/qt/) chapter has the complete CMake, C++ model, QML view, and test target.

Install the Flatpak runtime and SDK:

```bash title="Terminal"
flatpak remote-add --if-not-exists --user flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install --user flathub org.kde.Platform//6.10 org.kde.Sdk//6.10
```

## Fedora and KDE integration

### Portals and KIO

Plasma's portal backend is [`xdg-desktop-portal-kde`](https://invent.kde.org/plasma/xdg-desktop-portal-kde). It implements the file, settings, screenshot, and other interfaces used by Flatpak and sandboxed apps. Use `org.freedesktop.portal.*` through the toolkit or libportal; never bundle a portal or call the backend directly.

`KIO` is the native file and network abstraction for a non-sandboxed KDE app. In a Flatpak, a file dialog goes through the portal; do not assume a `KIO` worker can see the host filesystem.

### KDE frameworks

- **`KDBusService`** — single-instance behavior and activation. Use `KDBusService(KDBusService::Unique)`; do not add a second lock file or a private D-Bus name.
- **`KNotification`** — Plasma notifications. Keep actions and urgency honest, and degrade gracefully when notifications are unavailable.
- **`KIO`** — network and file access with KDE's worker model. Use it for non-sandboxed apps; use portals in a Flatpak.
- **KWallet** — use the KWallet framework for a non-sandboxed KDE app. In a Flatpak, prefer `org.freedesktop.portal.Secret` and the toolkit's secret-service integration; do not talk to `org.kde.kwalletd6` directly unless the manifest grants it.
- **`KConfig`** — application settings in the XDG config location. Do not write a private config format into `$HOME` directly.

The [Qt & Kirigami](/engineering/qt/) chapter has the code for these APIs; this section is the Fedora/KDE-specific checklist.

### Services and network

- **systemd user units** — use `systemctl --user` and `~/.config/systemd/user/`. `loginctl enable-linger` is only for a service that must run without an active login; it changes the resource and security model, so do not enable it for a normal desktop app.
- **firewalld** — only for a service that listens on the network. Open the smallest service or port, and prefer a loopback binding. A desktop app should not need an open port; if it does, document it and test the denial case.
- **SELinux** — read [SELinux](/platform/security/#selinux) before shipping a system service. Do not ask users to disable it.
- **Flatpak** — a sandboxed app should not install a system service. Use portals or a separate host service with an explicit interface.

### Fedora Atomic and Kinoite

Fedora Kinoite is the Plasma-based Atomic desktop. The app path is Flatpak first: users install from Flathub, not by layering an RPM onto the host. `rpm-ostree install` is an administrator action that changes the host image and needs a reboot; it is not an app distribution channel. Test the Flatpak on Kinoite and keep the host immutable.

Use [Toolbx](https://containertoolbx.org/) for the development environment; the target's `toolbox` commands above are the supported path. For the native package, see [RPM packages](/platform/packaging/#rpm-packages).

## Golden path

1. [Qt & Kirigami](/engineering/qt/) — the complete C++/QML project, `QAbstractListModel`, `KDBusService`, KConfig, KNotification, KIO, CMake, tests, and accessibility.
2. [KDE Human Interface Guidelines](https://develop.kde.org/hig/) — the design language for a KDE-first app.
3. [AppStream & Metadata](/ship/appstream/) and [Flathub](/ship/flathub/) — the distribution path.
4. [Release Checklist](/ship/release-checklist/) — the final pass before users install.

The first-app tutorial is GTK/Python. For this target, the Qt chapter is the complete starting project; do not follow the GTK tutorial and then try to make it look like a KDE app.

## Validation checklist

Run these on the exact Fedora 45 release before you call the target validated:

- `plasmashell --version` and `rpm -q qt6-qtbase kf6-kirigami` match the matrix; record the versions.
- `getenforce` reports `Enforcing`; do not validate on a permissive host.
- A clean Toolbx build passes `cmake`, `ctest`, `qmllint`, and `qmlcachegen`.
- The RPM builds in `mock -r fedora-45-x86_64` and passes `rpmlint`.
- The Flatpak builds and runs with the manifest; install it on Fedora Kinoite as well.
- Orca and Accerciser cover the main flows; the window works at 200% scaling and high contrast.
- The RPM and Flatpak installs both launch, show the correct desktop entry, and pass AppStream validation.

## Quality gates

Before you call the app ready on this target:

- builds from a clean checkout with CMake and the Fedora 45 Qt/KF6 packages;
- the `QAbstractListModel` and other C++ units pass under QtTest;
- `qmllint` passes and the QML is compiled with `qmlcachegen`;
- `desktop-file-validate` and `appstreamcli validate --no-net` pass;
- the Flatpak builds and runs with the permissions in the manifest;
- KDBusService provides single-instance behavior, and KNotification/KIO use the platform APIs;
- Orca reads the main flows and Accerciser shows the expected accessible roles;
- the window works at 200% scaling and with the high-contrast preference;
- startup, input latency, and memory stay within the [performance budgets](/engineering/performance/);
- the app follows the KDE HIG rather than a GNOME layout with KDE colors.

## Non-goals

- Qt 5 or KDE Frameworks 5.
- X11-only apps and X11-specific APIs.
- Assuming the distro's Qt version is the Flatpak runtime version.
- Promising an LTS support window that Fedora does not provide.
- Using GTK for a KDE-first app unless cross-platform is a hard requirement.

## Sources

- [Fedora Linux 45 announcement](https://fedoramagazine.org/announcing-fedora-linux-45/)
- [Fedora release lifecycle](https://docs.fedoraproject.org/en-US/releases/lifecycle/)
- [Fedora KDE wiki](https://fedoraproject.org/wiki/KDE)
- [KDE Plasma 6.8 announcement](https://kde.org/announcements/plasma/6/6.8.0/)
- [KDE Frameworks 6.31.0](https://kde.org/announcements/frameworks/6/6.31.0/)
- [KDE developer documentation](https://develop.kde.org/)
- [KDE Human Interface Guidelines](https://develop.kde.org/hig/)
- [KDE Frameworks API](https://api.kde.org/)
- [xdg-desktop-portal-kde](https://invent.kde.org/plasma/xdg-desktop-portal-kde)
- [Fedora SELinux Wiki](https://fedoraproject.org/wiki/SELinux)
- [audit2allow(1)](https://man7.org/linux/man-pages/man1/audit2allow.1.html)
- [firewalld documentation](https://firewalld.org/documentation/)
- [Fedora Kinoite](https://docs.fedoraproject.org/en-US/fedora-kinoite/)
- [Toolbx](https://containertoolbx.org/)
- [Qt 6 documentation](https://doc.qt.io/qt-6/)
- [QAccessible](https://doc.qt.io/qt-6/qaccessible.html)
- [Flathub setup for Fedora](https://flathub.org/en/setup/Fedora)
- [Fedora countme totals](https://data-analysis.fedoraproject.org/csv-reports/countme/totals.csv)

Next: [Qt & Kirigami](/engineering/qt/) — build the complete C++/QML project for this target.
