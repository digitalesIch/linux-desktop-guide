---
title: Resources
description: A curated, link-checked set of specifications, documentation, tooling, design assets, and communities for building native Linux desktop apps.
---

The Linux desktop has excellent documentation. It is also spread across a dozen projects. This page collects the sources worth bookmarking, with a bias toward primary documentation and maintained projects.

## Specifications

| Resource | Why it matters |
| --- | --- |
| [freedesktop.org specifications](https://specifications.freedesktop.org/) | The index of XDG, desktop entry, MIME, icon, trash, notification, and MPRIS specs |
| [XDG Base Directory](https://specifications.freedesktop.org/basedir-spec/latest/) | Where config, data, state, cache, and runtime files belong |
| [Desktop Entry](https://specifications.freedesktop.org/desktop-entry-spec/latest/) | The `.desktop` file format |
| [Shared MIME-info](https://specifications.freedesktop.org/shared-mime-info-spec/latest/) | File type detection and `MimeType=` |
| [Icon Theme](https://specifications.freedesktop.org/icon-theme-spec/latest/) | hicolor and icon naming |
| [Trash](https://specifications.freedesktop.org/trash/latest/) | Safe deletion |
| [Autostart](https://specifications.freedesktop.org/autostart-spec/latest/) | Login startup entries |
| [Notifications](https://specifications.freedesktop.org/notification-spec/latest/) | Desktop notification protocol |
| [MPRIS](https://specifications.freedesktop.org/mpris-spec/latest/) | Media player controls |
| [Secret Service](https://specifications.freedesktop.org/secret-service-spec/latest/) | Keyring access |
| [Wayland](https://wayland.freedesktop.org/) | Protocol documentation and compositor architecture |
| [XDG Desktop Portal](https://flatpak.github.io/xdg-desktop-portal/docs/) | Portal interfaces and usage |
| [AppStream](https://www.freedesktop.org/software/appstream/docs/) | Metadata for software centers |
| [systemd](https://systemd.io/) | User services, timers, journald, coredump |
| [systemd user units](https://www.freedesktop.org/software/systemd/man/latest/systemd.special.html) | Running background services per user |

## Project health

| Resource | Why it matters |
| --- | --- |
| [Quality Signals](/reference/quality-signals/) | The guide's repeatable maintenance and community-health check |
| [CHAOSS metrics](https://chaoss.community/metrics/) | Established community-health metrics |
| [OpenSSF Scorecard](https://scorecard.dev/) | Repository security practices |
| [OSV](https://osv.dev/) | Open-source vulnerability database |
| [Reproducible Builds](https://reproducible-builds.org/) | Build verification and reproducible-build guidance |

## Ubuntu

| Resource | Why it matters |
| --- | --- |
| [Ubuntu for Developers](https://documentation.ubuntu.com/ubuntu-for-developers/) | Toolchains, IDEs, packaging, and support |
| [Ubuntu Desktop documentation](https://documentation.ubuntu.com/desktop/en/latest/) | Desktop behavior, accessibility, and snap/deb policy |
| [Ubuntu 26.04 release notes](https://documentation.ubuntu.com/release-notes/26.04/) | The baseline for this guide |
| [Ubuntu Pro Client](https://documentation.ubuntu.com/pro-client/en/latest/) | `pro`, ESM, Livepatch, FIPS, CIS |
| [Snap documentation](https://snapcraft.io/docs/) | snapd, confinement, interfaces, updates |
| [Snapcraft](https://documentation.ubuntu.com/snapcraft/stable/) | Building snaps |
| [Rockcraft](https://documentation.ubuntu.com/rockcraft/stable/) | Ubuntu-based OCI images |
| [Ubuntu packaging guide](https://packaging.ubuntu.com/html/) | deb packaging |
| [New package guide](https://documentation.ubuntu.com/project/contributors/new-package/create-a-new-package/) | Ubuntu archive process |
| [Build packages in a PPA](https://documentation.ubuntu.com/project/contributors/bug-fix/build-packages-in-a-ppa/) | PPA upload and signing |
| [Ubuntu accessibility stack](https://documentation.ubuntu.com/desktop/en/latest/explanation/accessibility-stack/) | AT-SPI, GTK, Orca, BRLTTY |
| [AppArmor](https://apparmor.net/) | Confinement profiles and auditing |
| [Polkit](https://www.freedesktop.org/software/polkit/docs/latest/) | Privileged actions |
| [NetworkManager](https://networkmanager.dev/docs/developers/) | Connectivity and network state |
| [PipeWire](https://docs.pipewire.org/) | Audio/video graph |
| [WirePlumber](https://pipewire.pages.freedesktop.org/wireplumber/) | PipeWire session/policy manager |
| [UPower](https://upower.freedesktop.org/docs/) | Battery and power state |
| [BlueZ D-Bus API](https://git.kernel.org/pub/scm/bluetooth/bluez.git/tree/doc) | Bluetooth |
| [OpenPrinting CUPS](https://openprinting.github.io/cups/) | Printing |
| [UDisks2 API](https://storaged.org/udisks/docs/) | Disks and mounts |
| [fwupd / LVFS](https://fwupd.org/) | Firmware updates |
| [PackageKit](https://www.freedesktop.org/software/PackageKit/) | Package management |
| [snapd REST API](https://snapcraft.io/docs/snapd-api) | Snap automation |
| [Ubuntu Desktop snap/deb packages](https://ubuntu.com/desktop/docs/en/26.04/explanation/snap-and-deb-packages) | App Center package formats |
| [Permissions prompting](https://discourse.ubuntu.com/t/permissions-prompting-a-deep-dive/81785) | Security Center and Snap prompting |
| [Ubuntu Insights](https://github.com/ubuntu/ubuntu-insights) | Opt-in system telemetry |

## GNOME and GTK

| Resource | Why it matters |
| --- | --- |
| [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/) | The design language behind libadwaita |
| [GTK 4 documentation](https://docs.gtk.org/gtk4/) | Widgets, layout, actions, accessibility |
| [libadwaita documentation](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/) | Adaptive widgets and GNOME patterns |
| [Blueprint](https://gnome.pages.gitlab.gnome.org/blueprint-compiler/) | Declarative UI language for GTK |
| [GNOME Builder](https://apps.gnome.org/Builder/) | IDE with Flatpak and GNOME integration |
| [Workbench](https://apps.gnome.org/Workbench/) | Rapid GTK prototyping |
| [GNOME Icon Library](https://gitlab.gnome.org/Teams/Design/icon-library) | Consistent symbolic and full-color icons |
| [GNOME apps](https://apps.gnome.org/) | Reference implementations |
| [GNOME developer documentation](https://developer.gnome.org/documentation/) | Tutorials, guides, and API docs |
| [GTK Inspector](https://docs.gtk.org/gtk4/running.html) | Interactive debugging |
| [Sysprof](https://apps.gnome.org/Sysprof/) | System-wide profiling |
| [Accerciser](https://gitlab.gnome.org/GNOME/accerciser) | Accessibility tree inspector |
| [Orca](https://gitlab.gnome.org/GNOME/orca) | Screen reader |
| [Glycin](https://gitlab.gnome.org/GNOME/glycin) | Sandboxed image decoding for untrusted images |

## KDE and Qt

| Resource | Why it matters |
| --- | --- |
| [KDE Human Interface Guidelines](https://develop.kde.org/hig/) | Plasma design conventions |
| [Kirigami documentation](https://develop.kde.org/docs/getting-started/kirigami/) | Adaptive Qt Quick apps |
| [Qt 6 documentation](https://doc.qt.io/qt-6/) | Qt Widgets, Qt Quick, Qt Test |
| [Qt QML applications](https://doc.qt.io/qt-6/qmlapplications.html) | QML application structure |
| [KDE Frameworks API](https://api.kde.org/) | KConfig, KIO, KNotification, KWallet |
| [Qt Creator](https://doc.qt.io/qtcreator/) | IDE and profiler |
| [Breeze icons](https://invent.kde.org/plasma/breeze) | KDE icon theme |
| [GammaRay](https://github.com/KDAB/GammaRay) | Qt/QML runtime inspection |
| [KDE Discuss](https://discuss.kde.org/) | Community support |

## Rust

| Resource | Why it matters |
| --- | --- |
| [gtk-rs book](https://gtk-rs.org/gtk4-rs/stable/latest/book/) | GTK 4 bindings for Rust |
| [gtk-rs documentation](https://gtk-rs.org/gtk4-rs/) | API docs and version support |
| [Relm4 book](https://relm4.org/book/stable/) | Component architecture on gtk-rs |
| [Iced](https://iced.rs/) | Elm-inspired cross-platform GUI |
| [Slint](https://slint.dev/) | Declarative UI for embedded and desktop |
| [libcosmic](https://github.com/pop-os/libcosmic) | COSMIC toolkit |
| [COSMIC](https://system76.com/cosmic) | Rust-native desktop environment |

## Packaging and distribution

| Resource | Why it matters |
| --- | --- |
| [Flatpak documentation](https://docs.flatpak.org/) | Sandbox, manifests, runtimes, portals |
| [Flatpak runtimes](https://docs.flatpak.org/en/latest/available-runtimes.html) | Runtime branches and support windows |
| [Flatpak Builder](https://docs.flatpak.org/en/latest/flatpak-builder.html) | Manifest format and build workflow |
| [Flathub documentation](https://docs.flathub.org/) | Submission, maintenance, verification |
| [Flathub requirements](https://docs.flathub.org/docs/for-app-authors/requirements) | What gets accepted |
| [Flathub metainfo guidelines](https://docs.flathub.org/docs/for-app-authors/metainfo-guidelines) | Metadata, screenshots, branding, translations |
| [Flathub quality guidelines](https://docs.flathub.org/docs/for-app-authors/metainfo-guidelines/quality-guidelines) | Store-listing quality targets |
| [Flathub linter](https://docs.flathub.org/docs/for-app-authors/linter) | Manifest and metainfo validation |
| [Flathub submission](https://docs.flathub.org/docs/for-app-authors/submission) | The PR process |
| [AppStream documentation](https://www.freedesktop.org/software/appstream/docs/) | Metadata, validation, screenshots |
| [AppStream validator issue tags](https://github.com/ximion/appstream/blob/main/src/as-validator-issue-tag.h) | Exact `appstreamcli` issue names |
| [Debian Policy](https://www.debian.org/doc/debian-policy/) | The deb package contract |
| [Debian packaging tutorial](https://www.debian.org/doc/manuals/debmake-doc/) | Practical deb building |
| [Ubuntu packaging](https://packaging.ubuntu.com/html/) | Ubuntu-specific packaging |
| [Launchpad PPAs](https://help.launchpad.net/Packaging/PPA) | Personal package archives |
| [Snapcraft documentation](https://snapcraft.io/docs) | Snap packaging and confinement |
| [AppImage documentation](https://docs.appimage.org/) | Portable single-file apps |

## Tools

| Tool | Use |
| --- | --- |
| [Sysprof](https://apps.gnome.org/Sysprof/) | CPU, marks, and system profiling |
| [heaptrack](https://github.com/KDE/heaptrack) | Heap allocation profiling |
| [Valgrind](https://valgrind.org/) | Memory errors and callgrind |
| [perf](https://perf.wiki.kernel.org/) | Linux perf events |
| [dogtail](https://gitlab.com/dogtail/dogtail) | AT-SPI UI automation |
| [Accerciser](https://gitlab.gnome.org/GNOME/accerciser) | Accessibility inspection |
| [GammaRay](https://github.com/KDAB/GammaRay) | Qt/QML inspection |
| [GTK Inspector](https://docs.gtk.org/gtk4/running.html) | GTK layout, CSS, and accessibility |
| [Workbench](https://apps.gnome.org/Workbench/) | GTK prototyping |
| [Blueprint](https://gnome.pages.gitlab.gnome.org/blueprint-compiler/) | GTK UI language |
| [Meson i18n](https://mesonbuild.com/i18n-module.html) | gettext/POTFILES integration |
| [CMake documentation](https://cmake.org/documentation/) | Build configuration and GNUInstallDirs |
| [GStreamer documentation](https://gstreamer.freedesktop.org/documentation/) | Media pipelines and VA-API |

## Design assets

| Resource | Use |
| --- | --- |
| [GNOME HIG](https://developer.gnome.org/hig/) | Patterns, spacing, typography |
| [GNOME Icon Library](https://gitlab.gnome.org/Teams/Design/icon-library) | Symbolic and full-color icons |
| [libadwaita CSS variables](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/main/css-variables.html) | Semantic colors and spacing |
| [KDE HIG](https://develop.kde.org/hig/) | Plasma patterns |
| [Breeze icons](https://invent.kde.org/plasma/breeze) | KDE icon set |
| [elementary HIG](https://docs.elementary.io/hig/) | Minimal, structured design |
| [Inter](https://rsms.me/inter/) | UI font used by many Linux apps |
| [Cantarell](https://gitlab.gnome.org/GNOME/cantarell-fonts) | GNOME UI font |
| [JetBrains Mono](https://www.jetbrains.com/lp/mono/) | Monospace font for code |

## Community

| Community | Where |
| --- | --- |
| GNOME | [discourse.gnome.org](https://discourse.gnome.org/) |
| KDE | [discuss.kde.org](https://discuss.kde.org/) |
| Flathub | [Matrix](https://matrix.to/#/#flathub:matrix.org) |
| freedesktop | [Mailing lists](https://lists.freedesktop.org/) |
| GNOME development | [gitlab.gnome.org](https://gitlab.gnome.org/) |
| KDE development | [invent.kde.org](https://invent.kde.org/) |
| Linux App Summit | [linuxappsummit.org](https://linuxappsummit.org/) |
| GUADEC | [guadec.org](https://guadec.org/) |
| Akademy | [akademy.kde.org](https://akademy.kde.org/) |

## Agent access

The guide is published for human readers and agents from the same source. The agent-facing files are generated at build time, so they cannot drift from the HTML.

- [llms.txt](/llms.txt) — curated index grouped by section, with links to every Markdown page.
- [llms-full.txt](/llms-full.txt) — the complete guide in one Markdown file.
- **Per-page Markdown** — append `.md` to a route: `/start/why-linux.md`, `/platform/ubuntu.md`, `/reference/baseline.md`.
- **Discovery** — every HTML page advertises its Markdown sibling with `<link rel="alternate" type="text/markdown">` and points to `/llms.txt` with `rel="describedby"`.

Content negotiation (`Accept: text/markdown`) depends on host or CDN support and is not enabled by the static site. The `.md` endpoints work on any static host.

## How to keep this current

- Prefer primary documentation over blog posts.
- Check the release notes for the toolkit version you target.
- Re-test links and commands at least once per release cycle.
- If a tool is unmaintained, say so and point to the replacement.
- When in doubt, read the specification. It is shorter than the argument.

### Content review checklist

1. Check the Ubuntu release notes and release cycle; note any support-date discrepancy.
2. Check GNOME/GTK/libadwaita, Qt/KDE, Snapcraft, Flatpak, and Flathub release notes for the versions you target.
3. Update `src/data/baseline.json` and `reference/baseline.mdx` together.
4. Re-check the pages that cite the changed versions or channels.
5. Run `npm run check:baseline`, `npm run build`, `npm run check:agent-docs`, and `npm run test:docs-mcp`.
6. Re-run the external link check and the internal link/anchor check.
7. Review the diff for unsourced claims, vendor promotion, and Apple/macOS/Windows comparisons.
8. Record the review date and the sources you checked.

Back to [The Native Standard](/start/native-standard/) or [Checklists](/reference/checklists/).
