---
title: Fedora 45 KDE Plasma + Qt
description: "The guide's upstream-current KDE reference target: Fedora 45 KDE Plasma, Qt 6, KDE Frameworks 6, Kirigami, Wayland, Flatpak, and the quality gates for a KDE-native app."
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
| Last validated | 2026-11-10 |

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

## Golden path

1. [Qt & Kirigami](/engineering/qt/) — the complete C++/QML project, `QAbstractListModel`, `KDBusService`, KConfig, KNotification, KIO, CMake, tests, and accessibility.
2. [KDE Human Interface Guidelines](https://develop.kde.org/hig/) — the design language for a KDE-first app.
3. [AppStream & Metadata](/ship/appstream/) and [Flathub](/ship/flathub/) — the distribution path.
4. [Release Checklist](/ship/release-checklist/) — the final pass before users install.

The first-app tutorial is GTK/Python. For this target, the Qt chapter is the complete starting project; do not follow the GTK tutorial and then try to make it look like a KDE app.

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
- [Qt 6 documentation](https://doc.qt.io/qt-6/)
- [QAccessible](https://doc.qt.io/qt-6/qaccessible.html)
- [Flathub setup for Fedora](https://flathub.org/en/setup/Fedora)
- [Fedora countme totals](https://data-analysis.fedoraproject.org/csv-reports/countme/totals.csv)

Next: [Qt & Kirigami](/engineering/qt/) — build the complete C++/QML project for this target.
