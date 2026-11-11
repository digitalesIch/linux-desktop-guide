---
title: Platform Targets
description: "The curated targets this guide supports, the default stack for each, and the evidence behind the choice."
---

A **target** is the environment the guide makes decisions for: a distribution release, a desktop, a toolkit, a HIG, a display server, a packaging path, and a quality gate. It is not a list of every distribution that can run Linux software.

The guide supports a small matrix on purpose. A developer who picks a target gets a default stack, a design language, a supported environment, and a test path instead of a menu of mutually incompatible options. The choice is derived from evidence; the [selection method](/targets/selection/) explains the criteria, weights, and sources.

## The matrix

| Target | Role | Stack | Release model | Support | Evidence | Why |
| --- | --- | --- | --- | --- | ---: | --- |
| **[Ubuntu 26.04 LTS + GNOME](/targets/ubuntu-gnome/)** | Reference | GTK 4.22 + libadwaita 1.9 | LTS | 5 years standard; 10 with Pro; 15 with Legacy | 2.75 | Stable GNOME reference with the longest support window and a Wayland-only session |
| **[Fedora 45 KDE Plasma + Qt](/targets/fedora-kde/)** | Reference | Qt 6.11 + KDE Frameworks 6.30+ + Kirigami | Current | ~13 months | 2.55 | Upstream-current KDE reference with Flatpak and Flathub ready out of the box |
| **Fedora 45 Workstation + GNOME** | Validation | GTK 4.24 + libadwaita 1.10 | Current | ~13 months | 2.55 | Catches GTK, libadwaita, and GNOME drift before the next Ubuntu LTS |
| **Arch Linux (rolling)** | Validation | GTK 4.24 / Qt 6.12 | Rolling | No EOL; no support promise | 2.00 | Newest upstream packages and an official container; catches breakage early |
| **Debian 13 (trixie)** | Compatibility | GTK 4.18 + libadwaita 1.7; Qt 6.8 | Stable | EOL 2028; LTS 2030; ELTS 2035 | 2.10 | Conservative base with long support; use Flatpak when you need a newer stack |

Scores are an editorial synthesis of the evidence, not a measurement. The role and the coverage gates decide the final matrix; see [How Targets Are Chosen](/targets/selection/).

## The reference targets

### Ubuntu 26.04 LTS + GNOME

The stable GNOME target. Ubuntu 26.04 is an LTS with a Wayland-only GNOME session, GTK 4.22, libadwaita 1.9, AT-SPI/Orca, and a long support window. It is the right default when you want a predictable GNOME app that will still be supported in five years.

The trade-off is deliberate: Ubuntu is not the fastest-moving GNOME distribution. If you need the newest GTK or libadwaita, build and test on the Fedora validation target and ship the app through Flatpak with a runtime that carries the newer stack.

[Read the full Ubuntu + GNOME target profile →](/targets/ubuntu-gnome/)

### Fedora 45 KDE Plasma + Qt

The upstream-current KDE target. Fedora KDE is a flagship edition, the target uses Wayland (Plasma 6.8 removes the X11 session, so check the exact Fedora package), Qt 6 and KDE Frameworks are current, and Flatpak plus Flathub are configured out of the box. It is the right default when you want a KDE-native app with Kirigami and the Plasma HIG.

The trade-off is support duration: Fedora releases are supported for roughly 13 months, so the target assumes an annual upgrade cadence. The KDE stack is also less mature than GNOME on some accessibility edges, but Plasma 6.8 and KDE Frameworks 6.30+ are a serious, actively maintained baseline.

[Read the full Fedora + KDE target profile →](/targets/fedora-kde/)

## Validation targets

**Fedora 45 Workstation + GNOME 51.** The next GNOME stack after Ubuntu: GNOME 51 with GTK 4.24 and libadwaita 1.10, against Ubuntu's GNOME 50, GTK 4.22, and libadwaita 1.9. It tells you whether a GTK or libadwaita change breaks before the next Ubuntu LTS. It is not a second full documentation path; it is the place to run the test suite and the packaging smoke test.

**Arch Linux (rolling).** The newest GTK and Qt packages, an official container image, and a large package ecosystem. It is the early-warning system for upstream breakage. It has no support promise, so never present it as your app's supported baseline.

## Compatibility target

**Debian 13 (trixie).** A stable base with long support, reproducible-build infrastructure, and older GTK/Qt libraries. It is the target for conservative users and for apps that must run on a stable distribution without Flatpak. When you need a newer GTK or Qt than Debian ships, use a Flatpak runtime instead of requiring a backport.

## The default stack

| Target | Default toolkit | HIG | Primary packaging | Do not |
| --- | --- | --- | --- | --- |
| Ubuntu + GNOME | GTK 4 + libadwaita | GNOME HIG | Flatpak/Flathub; deb and Snap secondary | Start a Qt app for a GNOME-first product unless cross-platform is a hard requirement |
| Fedora + KDE | Qt 6 + Kirigami | KDE HIG | Flatpak/Flathub; rpm secondary | Start a GTK app for a KDE-first product unless cross-platform is a hard requirement |
| Debian | The target stack, usually through Flatpak | GNOME or KDE HIG | Flatpak/Flathub; deb | Assume Debian's GTK/Qt versions are the app runtime |
| Arch | Either stack, for validation | The chosen desktop's HIG | Flatpak/Flathub; pacman | Promise Arch as a supported baseline |

The point is not that one toolkit is universally better. The point is that a GNOME-first app should feel like a GNOME app, and a KDE-first app should feel like a KDE app. A cross-platform product can use one toolkit and accept that it will be a guest on the other desktop; that is a deliberate trade-off, not a default.

## Evaluated but not selected

These are real candidates with real strengths. They are not in the matrix because they do not yet add the coverage or meet the gates.

| Candidate | Why it is not a reference target |
| --- | --- |
| **Linux Mint + Cinnamon** | Strong interest and Steam proxies, but Cinnamon is GTK 3, the reviewed release materials do not declare Wayland the default, and no dedicated SDK or official container was verified. Re-evaluate when the Wayland session and developer tooling mature. |
| **Pop!_OS + COSMIC** | Wayland-native and shipping widely, but libcosmic marks accessibility as experimental, the toolkit is young, there is no official Pop!_OS container, and the support end is unverified. |
| **NixOS** | Exceptional reproducibility and contributor activity, but a short support window, weak adoption proxies, and optional Flatpak. A future reproducibility target. |
| **openSUSE Tumbleweed** | A healthy rolling KDE/GNOME base with OBS and openQA, but no distinct adoption signal in the reviewed proxies and unverified toolkit versions. Fedora and Arch cover the current/rolling roles. |
| **Manjaro** | Arch-based and commercially backed, but no verified official container or SDK and no coverage beyond Arch. |
| **elementary OS** | A distinct HIG and AppCenter, but niche adoption, no official container verified, and an unverified support end. |
| **Xfce** | X11 by default, experimental Wayland, GTK 3, and an irregular cadence. Outside the Wayland-native reference standard. |

## What this means for your app

1. **Pick one target first.** Choose the target whose users and design language match your product. Do not start with a toolkit and then look for a desktop.
2. **Use the target's HIG.** GTK apps should follow the GNOME HIG; Qt apps should follow the KDE HIG. A cross-desktop app can share code, but it still needs to respect the host.
3. **Ship Flatpak as the common channel.** It gives Debian, Arch, and Fedora users a current runtime without forcing them to upgrade their distribution.
4. **Test on the validation targets.** Fedora GNOME catches upstream GNOME drift; Arch catches upstream GTK/Qt drift. Neither is a support promise.
5. **Do not promise every distribution.** State the supported targets and the compatibility target. A clear support matrix is more trustworthy than a vague "works on Linux".

## Review

- Matrix checked: **10 November 2026**
- Next review due: **10 May 2027**, or the next Ubuntu/Fedora release, whichever comes first.
- The date is the evidence check date. Runtime validation: **Ubuntu 26.04.1 only**; Fedora, Debian, and Arch were checked through release notes, lifecycle pages, and package indexes.
- The machine-readable matrix is `src/data/targets.json`; `npm run check:targets` validates roles, scores, sources, and coverage.

## Sources

- [How Targets Are Chosen](/targets/selection/) — criteria, weights, and the full evidence discussion
- [Ubuntu release cycle](https://ubuntu.com/about/release-cycle)
- [Ubuntu 26.04 LTS release notes](https://documentation.ubuntu.com/release-notes/26.04/)
- [Fedora Linux 45 announcement](https://fedoramagazine.org/announcing-fedora-linux-45/)
- [Fedora release lifecycle](https://docs.fedoraproject.org/en-US/releases/lifecycle/)
- [Debian releases](https://www.debian.org/releases/)
- [Arch Linux about](https://archlinux.org/about/)
- [GNOME 51 release notes](https://release.gnome.org/51/)
- [KDE Plasma 6.8 announcement](https://kde.org/announcements/plasma/6/6.8.0/)
- [Flathub setup](https://flathub.org/en/setup)

Next: [Ubuntu 26.04 LTS + GNOME](/targets/ubuntu-gnome/) — the stable GNOME reference target, its development environment, and its quality gates.
