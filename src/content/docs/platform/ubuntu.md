---
title: Ubuntu Platform
description: "Release support, toolchains, packaging paths, system services, security, and Ubuntu Pro for desktop developers."
---

Ubuntu is the reference platform for this guide, but it is not a single SDK. It is an LTS release with a supported toolchain set, two first-class package formats, a set of privileged system services, and a security-maintenance model that extends beyond the standard support window.

This page is the map. It tells you which Ubuntu sources to trust, which packaging path fits which audience, and which system APIs an app should use instead of shelling out to a command-line tool. The other Platform pages go deeper on Wayland, XDG, integration, Flatpak, packaging, and security.

## Release and support

Target an LTS release unless you have a reason not to. LTS releases are what users and organizations run, and they are what Flatpak runtimes and Ubuntu archives are built around.

| Release | Type | Standard support | Ubuntu Pro | Legacy add-on |
| --- | --- | --- | --- | --- |
| **26.04 LTS** (Resolute Raccoon) | LTS | May 2031 | May 2036 | May 2041 |
| **24.04 LTS** (Noble Numbat) | LTS | May 2029 | May 2034 | May 2039 |
| **22.04 LTS** (Jammy Jellyfish) | LTS | May 2027 | May 2032 | May 2037 |
| **26.10** (Stonking Stingray) | Interim | Jul 2027 | — | — |

- **LTS** is the baseline for app development, CI, and support statements.
- **Interim releases** are for testing new kernels, toolchains, and desktop features. Do not make them your only supported target.
- **Ubuntu Pro** is optional. Apps must work on a stock Ubuntu installation without it.
- **Legacy add-on** is an extended-support option for organizations; it is not an app requirement.

Sources: [Ubuntu Desktop for developers](https://ubuntu.com/desktop/developers), [Ubuntu release cycle](https://ubuntu.com/about/release-cycle), [Ubuntu 26.04 release notes](https://documentation.ubuntu.com/release-notes/26.04/).

## Toolchains

Ubuntu documents a supported toolchain set with installation guides, version availability, and first-program tutorials. Prefer the archive package when you need system integration and ABI stability. Prefer a snap when you need an isolated, cross-distribution tool. Use an upstream installer only when you need a version or feature that Ubuntu does not ship.

| Toolchain | Install path | Ubuntu documentation |
| --- | --- | --- |
| Python | `apt install python3` / `uv` for project environments | [Python on Ubuntu](https://documentation.ubuntu.com/ubuntu-for-developers/toolchains/python/) |
| Go | `apt install golang-go` or the official tarball | [Go on Ubuntu](https://documentation.ubuntu.com/ubuntu-for-developers/toolchains/go/) |
| Rust | `apt install rustc cargo` or `rustup` for current stable | [Rust on Ubuntu](https://documentation.ubuntu.com/ubuntu-for-developers/toolchains/rust/) |
| GCC | `apt install build-essential` | [GCC on Ubuntu](https://documentation.ubuntu.com/ubuntu-for-developers/toolchains/gcc/) |
| Clang/LLVM | `apt install clang lld` | [Clang on Ubuntu](https://documentation.ubuntu.com/ubuntu-for-developers/toolchains/clang/) |
| .NET | `apt install dotnet-sdk-8.0` or the Microsoft feed | [.NET on Ubuntu](https://documentation.ubuntu.com/ubuntu-for-developers/toolchains/dotnet/) |
| Java | `apt install openjdk-21-jdk` | [Java on Ubuntu](https://documentation.ubuntu.com/ubuntu-for-developers/toolchains/java/) |
| Zig | Snap or upstream tarball | [Zig on Ubuntu](https://documentation.ubuntu.com/ubuntu-for-developers/toolchains/zig/) |

Guidance:

- Use the archive toolchain for code that links against system libraries and ships as a deb.
- Use a snap or a project-local toolchain for compilers and language runtimes that must be newer than the archive.
- Pin the toolchain version in CI. "Whatever is installed on the runner" is not a version policy.
- Check the [toolchain availability reference](https://documentation.ubuntu.com/ubuntu-for-developers/reference/availability/) before promising support for an older release.
- IDE setup and installation commands are collected in the [IDE reference](https://documentation.ubuntu.com/ubuntu-for-developers/reference/ides/).

## Packaging paths

Ubuntu supports two first-class package formats: **deb** and **snap**. Flatpak remains the cross-distribution path covered by this guide. They solve different problems.

| Path | Best for | Updates | Sandbox | Trade-off |
| --- | --- | --- | --- | --- |
| **deb + PPA** | Ubuntu archive integration, system tools, libraries | apt, unattended-upgrades | No | Full system access; tied to release |
| **Snap** | Third-party desktop apps in the Ubuntu App Center | snapd, automatic refresh | Yes, AppArmor | Larger install; confinement interfaces |
| **Flatpak / Flathub** | Cross-distro upstream desktop apps | OSTree deltas | Yes, portals | Separate runtime model |
| **OCI / Rockcraft** | Services and cloud workloads | Container registry | Container | Not a desktop app format |

Ubuntu's own guidance recommends snaps for third-party apps in the App Center because they are sandboxed and updated independently of the release. A deb has full access to the user's resources, so it is the right choice only when you need system integration or are maintaining an archive package.

### deb and PPA

```bash
sudo add-apt-repository ppa:yourname/notes
sudo apt update
sudo apt install notes
```

- Follow the [Ubuntu packaging guide](https://packaging.ubuntu.com/html/) and the [new-package guide](https://documentation.ubuntu.com/project/contributors/new-package/create-a-new-package/).
- Build packages in a clean chroot; validate with `lintian`.
- Use a PPA for upstream deb distribution; use the Ubuntu archive only when you can maintain the package for the release lifecycle.
- See [Build packages in a PPA](https://documentation.ubuntu.com/project/contributors/bug-fix/build-packages-in-a-ppa/).

### Snap and Snapcraft

```bash
snapcraft init
snapcraft pack
sudo snap install --dangerous ./notes_0.1.0_amd64.snap
snap connections notes
```

- `confinement: strict` is the default for a new app. `classic` is for tools that genuinely need full system access and is reviewed manually.
- Declare the smallest set of [interfaces](https://canonical-snap.readthedocs-hosted.com/reference/interfaces/) you need.
- Use XDG Desktop Portals inside the snap where possible; the Snap documentation has a dedicated [XDG desktop portals](https://canonical-snap.readthedocs-hosted.com/explanation/snap-development/xdg-desktop-portals/) page.
- Build with [Snapcraft](https://documentation.ubuntu.com/snapcraft/stable/) and follow the [Craft a snap](https://documentation.ubuntu.com/snapcraft/stable/tutorials/craft-a-snap/) tutorial.
- For snapd automation, use the [REST API](https://snapcraft.io/docs/snapd-api), not the `snap` CLI from inside a confined app.

### Flatpak

Flatpak is covered in [Flatpak & Portals](/platform/flatpak-portals/) and [Flathub](/ship/flathub/). Keep the distinction clear:

- **Ubuntu App Center** recommends snaps for third-party desktop apps.
- **Flathub** is the vendor-neutral upstream store for Flatpak apps across distributions.
- Shipping both is legitimate if you can maintain both. Do not treat one as a drop-in replacement for the other.

### OCI images and Rockcraft

Use [Rockcraft](https://documentation.ubuntu.com/rockcraft/stable/) when the deliverable is a container image, not a desktop app. Rocks are Ubuntu-based, minimal OCI images with a supported build path. They are not a way to package a GUI application for the desktop.

## System services

Ubuntu's desktop services expose stable D-Bus APIs. Use the API, not the command-line tool, and use a portal when one exists. The table is intentionally opinionated: it tells you what an app should normally do, not everything the service can do.

| Service | API | App guidance | Primary documentation |
| --- | --- | --- | --- |
| **systemd / journald** | `org.freedesktop.systemd1`, journal fields | Use user units for background work; log to stderr/journald; never manage system units from an app | [systemd](https://systemd.io/), [journald](https://www.freedesktop.org/software/systemd/man/latest/systemd-journald.service.html) |
| **NetworkManager** | `org.freedesktop.NetworkManager`, libnm | Observe connectivity; do not reconfigure the network unless the app is a network manager | [NetworkManager developers](https://networkmanager.dev/docs/developers/) |
| **PipeWire** | PipeWire API, GStreamer | Play and record through PipeWire; do not open raw ALSA devices | [PipeWire docs](https://docs.pipewire.org/) |
| **WirePlumber** | WirePlumber library, `wpctl` | Let the session manager route devices; do not override policies | [WirePlumber docs](https://pipewire.pages.freedesktop.org/wireplumber/) |
| **UPower** | `org.freedesktop.UPower` | Read battery and power state; react to suspend/resume; do not poll | [UPower docs](https://upower.freedesktop.org/docs/) |
| **BlueZ** | `org.bluez` | Use BlueZ profiles and D-Bus; do not talk to raw HCI | [BlueZ D-Bus API](https://git.kernel.org/pub/scm/bluetooth/bluez.git/tree/doc) |
| **CUPS** | IPP, libcups | Use `Gtk.PrintDialog` or the Print portal; do not manage printers | [OpenPrinting CUPS](https://openprinting.github.io/cups/) |
| **UDisks2** | `org.freedesktop.UDisks2` | Use GIO/GVfs for files; only disk utilities should use UDisks directly | [UDisks2 API](https://storaged.org/udisks/docs/) |
| **AppArmor** | Kernel LSM, `aa-*` tools | Ship a profile for system services; desktop apps rely on the Flatpak/Snap sandbox | [AppArmor docs](https://apparmor.net/) |
| **Polkit** | `org.freedesktop.PolicyKit1` | Never run `sudo` from an app; define a Polkit action for privileged operations | [Polkit docs](https://www.freedesktop.org/software/polkit/docs/latest/) |
| **fwupd** | `org.freedesktop.fwupd` | Do not flash firmware yourself; integrate with fwupd/LVFS or link to the firmware updater | [fwupd / LVFS](https://fwupd.org/) |
| **PackageKit** | `org.freedesktop.PackageKit` | Do not install packages from an app; use the software center/PackageKit | [PackageKit](https://www.freedesktop.org/software/PackageKit/) |
| **snapd** | REST API on `/run/snapd.socket` | Do not manage snaps from inside a snap; let snapd/the store update them | [snapd REST API](https://snapcraft.io/docs/snapd-api) |
| **AT-SPI** | D-Bus accessibility interfaces | Use native widgets and `Gtk.Accessible`; do not draw inaccessible controls | [Ubuntu accessibility stack](https://documentation.ubuntu.com/desktop/en/latest/explanation/accessibility-stack/) |

Two rules cover most of the table:

1. **Use the highest-level API that fits.** A file dialog, print dialog, notification, or secret belongs in a portal or toolkit API, not in a direct service call.
2. **Do not shell out to system tools from a sandbox.** `nmcli`, `udisksctl`, `snap`, and `fwupdmgr` may be absent or restricted. Use the D-Bus API or a portal.

## Security and Ubuntu Pro

Ubuntu's security model combines AppArmor, Polkit, signed packages, and optional Ubuntu Pro services.

- **AppArmor** confines services and sandboxed apps with per-application profiles. If you ship a system service, provide a profile and test it with `aa-status` and `journalctl -k --grep=apparmor`.
- **Polkit** mediates privileged operations. Define a named action instead of asking users to run `sudo`; the desktop can then present a proper authentication dialog.
- **fwupd** handles firmware updates through the LVFS. Apps should link to the firmware updater or expose status, not write firmware directly.
- **Ubuntu Pro** adds ESM, Livepatch, FIPS, CIS hardening, and extended support. It is preinstalled as the `pro` client:

```bash
pro status
sudo pro attach <token>
sudo pro enable esm-apps
sudo pro enable livepatch
pro fix CVE-2025-12345
```

Apps must not require Pro. If your app exposes security status, detect whether a service is enabled and explain the benefit without blocking core functionality.

See [Ubuntu Pro Client](https://documentation.ubuntu.com/pro-client/en/latest/) and [Ubuntu Pro](https://ubuntu.com/pro).

## Accessibility on Ubuntu

Ubuntu Desktop's accessibility stack is built on AT-SPI over D-Bus. GTK 4 exposes semantics through `Gtk.Accessible`; GTK 3 uses ATK. Orca is the default screen reader, with BRLTTY for Braille and Speech Dispatcher/eSpeak for speech.

- Use GTK or Qt widgets that expose AT-SPI semantics.
- Test with Orca and the accessibility inspector, not only with an automated checker.
- Flutter has known AT-SPI compatibility limitations on Ubuntu; if you use it, test with Orca and budget for custom accessibility work.
- Follow [Accessibility](/design/accessibility/) for the product-level checklist.

Sources: [Ubuntu Desktop accessibility stack](https://documentation.ubuntu.com/desktop/en/latest/explanation/accessibility-stack/), [AT-SPI D-Bus interfaces](https://documentation.ubuntu.com/desktop/en/latest/reference/accessibility/dbus/).

## Where to get help

- [Ubuntu for Developers](https://documentation.ubuntu.com/ubuntu-for-developers/) — toolchains, IDEs, packaging.
- [Ubuntu Desktop documentation](https://documentation.ubuntu.com/desktop/en/latest/) — desktop behavior, accessibility, snap/deb policy.
- [Ubuntu Discourse](https://discourse.ubuntu.com/) — platform and desktop discussion.
- [Ubuntu Desktop Matrix](https://matrix.to/#/#desktop-dev:ubuntu.com) — desktop development chat.
- [Ask Ubuntu](https://askubuntu.com/) — user-facing questions.
- [Launchpad](https://launchpad.net/) — bugs, PPAs, and Ubuntu packages.

## Ubuntu platform checklist

- ☐ Target an LTS release and state the support window.
- ☐ Pin the toolchain version used in CI and packaging.
- ☐ Choose deb, snap, Flatpak, or OCI deliberately; do not ship all four by default.
- ☐ Use portals or toolkit APIs for files, printing, notifications, secrets, and screen capture.
- ☐ Use D-Bus APIs instead of shelling out to `nmcli`, `udisksctl`, `snap`, or `fwupdmgr`.
- ☐ Never require `sudo` at runtime; define a Polkit action if privileged work is unavoidable.
- ☐ Do not require Ubuntu Pro; detect optional services and degrade gracefully.
- ☐ Test with Orca and the Ubuntu accessibility stack.
- ☐ Validate the desktop file, AppStream metadata, and package with the Ubuntu tooling.
- ☐ Test on a stock Ubuntu installation, not only on your development machine.

## See also

- [Wayland & Display](/platform/wayland/)
- [The XDG Contract](/platform/xdg/)
- [System Integration](/platform/integration/)
- [Flatpak & Portals](/platform/flatpak-portals/)
- [Packaging & Distribution](/platform/packaging/)
- [Security & Privacy](/platform/security/)
