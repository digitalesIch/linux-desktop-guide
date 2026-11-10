---
title: How Targets Are Chosen
description: "The evidence-based method behind the guide's platform targets: adoption, momentum, developer environment, platform quality, longevity, and coverage."
---

A vendor-controlled platform can define one screen, one toolkit, one design language, one store, and one supported environment. Linux cannot. There is no platform owner who can make that decision for the whole ecosystem, and a guide that pretends otherwise produces the usual result: a list of every distribution and every toolkit, with no defensible default.

This guide takes the other road. It defines a **small set of development targets** and makes the choice for the reader. A target is not a distribution preference. It is a combination of:

- distribution and release;
- desktop and HIG;
- toolkit and language bindings;
- display server and accessibility stack;
- packaging and update channel;
- a reproducible development environment;
- quality gates and explicit non-goals.

The selection is evidence-based. Popularity shows where users are. Momentum shows where the ecosystem is going. Developer environment and platform quality show whether a target is actually good to build on. Longevity shows whether it will still be viable in two years.

## Criteria

| Criterion | Weight | Question | Evidence |
| --- | --- | --- | --- |
| **Adoption / popularity** | 25% | Where are the users? | Steam Hardware Survey, Fedora `countme`, Debian popcon, Arch `pkgstats`, DistroWatch only as a weak interest proxy |
| **Momentum** | 25% | Is the platform growing and maintained? | Releases, contributor and review activity, foundation or corporate backing, roadmap, upstream adoption, security response |
| **Developer environment** | 20% | Can a developer reproduce a good setup? | Official containers, VMs and CI images; toolchain and SDK freshness; documentation; reproducible builds |
| **Platform quality** | 20% | Does it meet the Native Standard? | Wayland, portals, Flatpak/AppStream, accessibility, HIG/toolkit maturity, sandboxing, security |
| **Longevity / support** | 10% | Will it still be viable in two years? | Support window, LTS/stable policy, upgrade path, governance and funding |

Coverage and role are **gates**, not weights. A high score does not automatically make a target a reference target.

## Evidence rules

- Every metric gets a primary-source URL, a check date, and a confidence note.
- Steam is opt-in, self-reported, gaming-skewed, and split across distribution versions. It is a proxy, not market share.
- Fedora `countme` is an opt-out, sampled repository-request signal. It includes containers, cloud images, and downstream editions. Raw hits are not users.
- Debian popcon and Arch `pkgstats` are opt-in and platform-specific. They measure package presence, not active sessions or distro share.
- DistroWatch counts page hits. DistroWatch itself says the numbers do not measure usage or quality. It is included only as a weak interest proxy.
- Missing data is written as **not verified**. It is not estimated.
- Scores are an editorial synthesis of the cited evidence, not a measurement. The rubric makes the judgment explicit; it does not turn it into physics.

## Scoring

Each criterion is scored from 0 to 3:

| Score | Meaning |
| --- | --- |
| 0 | Absent, contradicted, or unverified |
| 1 | Weak or ad hoc |
| 2 | Adequate and documented |
| 3 | Strong and independently verifiable |

The weighted score is a sorting aid. The final matrix also has to satisfy the coverage gates and assign a role.

## Stack scores

| Stack | Adoption | Momentum | Developer environment | Platform quality | Longevity | Weighted | Role |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| **GNOME + GTK 4 / libadwaita** | 3 | 3 | 3 | 3 | 3 | **3.00** | Reference |
| **KDE Plasma + Qt 6 / Kirigami** | 3 | 3 | 3 | 3 | 3 | **3.00** | Reference |
| COSMIC + libcosmic | 1 | 3 | 2 | 1 | 1 | 1.70 | Watch |
| Cinnamon + GTK 3 | 2 | 2 | 1 | 1 | 2 | 1.60 | Watch |
| Xfce + GTK 3 | 1 | 1 | 2 | 1 | 1 | 1.20 | Watch |

GNOME and KDE are the two reference stacks because they combine mature HIGs, Wayland, portals, accessibility, developer documentation, and a large enough app ecosystem. COSMIC is promising but its accessibility support is still marked experimental. Cinnamon and Xfce remain on GTK 3 and do not meet the Wayland-native reference standard.

## Distribution scores

| Distribution | Adoption | Momentum | Developer environment | Platform quality | Longevity | Weighted | Decision |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| **Ubuntu** | 3 | 2 | 3 | 3 | 3 | **2.75** | Reference: GNOME LTS |
| **Fedora** | 2 | 3 | 3 | 3 | 1 | **2.55** | Reference: KDE; Validation: GNOME |
| **Debian** | 2 | 2 | 2 | 2 | 3 | **2.10** | Compatibility |
| **Arch Linux** | 2 | 2 | 3 | 2 | 0 | **2.00** | Validation: rolling |
| Linux Mint | 3 | 2 | 1 | 1 | 3 | 1.95 | Watch |
| NixOS | 1 | 3 | 2 | 2 | 1 | 1.90 | Watch |
| Pop!_OS | 1 | 3 | 2 | 1 | 1 | 1.70 | Watch |
| openSUSE Tumbleweed | 1 | 2 | 2 | 2 | 1 | 1.65 | Watch |
| elementary OS | 1 | 2 | 1 | 2 | 1 | 1.45 | Watch |
| Manjaro | 1 | 1 | 1 | 2 | 0 | 1.10 | Watch |

The scores do not select the matrix by themselves. Ubuntu is the GNOME reference because it pairs a long LTS window with a Wayland-only GNOME session and a reproducible developer environment. Fedora is the KDE reference because it is the strongest upstream-current KDE edition, with Flatpak and Flathub ready out of the box. Fedora also serves as the GNOME validation target: the same stack on a current, non-LTS base. Debian is the compatibility target because its value is longevity and stability, not the newest libraries. Arch is the rolling validation target because it carries the newest GTK and Qt packages and has an official container image, but it has no support promise.

## Coverage gates

The matrix must contain:

- at least one reference **GNOME/GTK** target;
- at least one reference **KDE/Qt** target;
- at least one **LTS or stable** target;
- at least one **current or rolling** target;
- at least one **deb-based** and one **rpm-based** distribution;
- no target that lacks Wayland, portals, Flatpak, AppStream, or a maintained accessibility stack.

These gates are enforced by `npm run check:targets`.

## Why not every distribution?

**Linux Mint + Cinnamon.** Mint has some of the strongest interest and Steam proxies in the set, and its move to yearly releases is a serious maintenance signal. But Cinnamon is still a GTK 3 desktop, the reviewed Mint 22.3 material does not declare Wayland the default, and no dedicated Cinnamon SDK or official container was verified. A GTK 3/X11-first target would contradict the guide's native standard. Mint becomes interesting when Cinnamon's Wayland session is the default and the project publishes a supported developer environment.

**Pop!_OS + COSMIC.** COSMIC has real momentum: Epoch 1 shipped in December 2025, it is Wayland-native, and it is available on many distributions. But libcosmic marks its accessibility feature as experimental, the toolkit is young, there is no official Pop!_OS container, and the support end is not verified. It is a watch-list candidate, not a reference target.

**NixOS.** NixOS has exceptional reproducibility and a strong contributor base. But its support window is short, its adoption proxies are weak, and Flatpak is optional. It is a promising future target for a reproducible-build workflow, not a mainstream reference.

**openSUSE Tumbleweed.** A healthy rolling KDE and GNOME base with OBS and openQA. But the reviewed adoption proxies did not show a distinct signal and the GTK/Qt versions were not verified. Fedora and Arch already cover the current/rolling roles.

**Manjaro and elementary OS.** Manjaro is Arch-based rolling with commercial backing, but it adds no coverage beyond Arch and has no verified official container or SDK. elementary OS has a distinct HIG and AppCenter, but niche adoption, no official container, and an unverified support end. Neither is a reference target for the general native standard.

**Xfce.** Xfce 4.20 still defaults to X11, its Wayland support is experimental, it is built on GTK 3, and its release cadence is irregular. It is outside the Wayland-native reference standard.

## What would change the decision

The matrix is not permanent. A target can move roles or leave the list when the evidence changes:

- Cinnamon makes Wayland the default and publishes a supported SDK/container → Mint becomes a compatibility candidate.
- COSMIC's accessibility feature becomes stable and Pop!_OS publishes a container → COSMIC becomes a validation candidate.
- NixOS extends its support window or becomes a first-class Flatpak host → NixOS becomes a reproducibility candidate.
- A reference distribution loses maintenance, drops Wayland, or fails the quality gates → it is removed or demoted.
- A new distribution shows stronger evidence across the criteria → it enters the evaluation.

## Review

- Evidence checked: **10 November 2026**
- Next review due: **10 May 2027**, or the next Ubuntu/Fedora release, whichever comes first.
- The machine-readable matrix is `src/data/targets.json`; `npm run check:targets` validates dates, scores, sources, roles, and coverage.

## Sources

- [Ubuntu release cycle](https://ubuntu.com/about/release-cycle)
- [Ubuntu 26.04 LTS release notes](https://documentation.ubuntu.com/release-notes/26.04/)
- [Fedora Linux 45 announcement](https://fedoramagazine.org/announcing-fedora-linux-45/)
- [Fedora release lifecycle](https://docs.fedoraproject.org/en-US/releases/lifecycle/)
- [Debian releases](https://www.debian.org/releases/)
- [Arch Linux about](https://archlinux.org/about/)
- [GNOME 51 release notes](https://release.gnome.org/51/)
- [KDE Plasma 6.8 announcement](https://kde.org/announcements/plasma/6/6.8.0/)
- [KDE Frameworks 6.31.0](https://kde.org/announcements/frameworks/6/6.31.0/)
- [Flathub setup](https://flathub.org/en/setup)
- [AppStream documentation](https://www.freedesktop.org/software/appstream/docs/)
- [Steam Hardware Survey, October 2026](https://store.steampowered.com/hwsurvey/)
- [Fedora countme totals](https://data-analysis.fedoraproject.org/csv-reports/countme/totals.csv)
- [Debian Popularity Contest](https://popcon.debian.org/)
- [Arch pkgstats: desktop environments](https://pkgstats.archlinux.de/fun/Desktop%20Environments/current)
- [DistroWatch page hit ranking](https://distrowatch.com/dwres.php?resource=popularity) — page-interest proxy only
- [Debian reproducible builds](https://tests.reproducible-builds.org/debian/)
- [NixOS reproducible builds](https://reproducible.nixos.org/)

Next: [Platform Targets](/targets/) — the matrix that this method selects, with roles and the default stack for each target.
