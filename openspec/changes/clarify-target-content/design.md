# Design

## Context

The target matrix is public and the site is deployed at the GitHub Pages project path. The matrix has one reference target per stack:

- Ubuntu 26.04 LTS + GNOME 50, GTK 4.22 + libadwaita 1.9, Qt 6.10.2/KF 6.24 as the Ubuntu-packaged stack;
- Fedora 45 KDE Plasma, Qt 6.11/KF 6.30+, Kirigami;
- Fedora 45 Workstation + GNOME 51, GTK 4.24 + libadwaita 1.10 (validation);
- Arch Linux rolling, GTK 4.24/Qt 6.12 (validation);
- Debian 13, GTK 4.18 + libadwaita 1.7, Qt 6.8 (compatibility).

Only Ubuntu 26.04.1 was available as a local runtime. Fedora, Debian, and Arch were checked through release notes, lifecycle pages, and package indexes. The target pages must say that plainly.

## Goals / Non-Goals

**Goals**

- Make each version and support claim match the matrix and the source register.
- Distinguish evidence review from runtime validation.
- Keep the Qt example valid on both reference stacks.
- Remove a promise the project does not yet keep (the freshness pipeline).

**Non-Goals**

- Re-scoring or changing the target matrix.
- Adding Fedora/Debian/Arch profile pages.
- Adding rpm, pacman, or SELinux sections.
- Implementing the freshness pipeline; that is `harden-public-delivery`.
- Changing the site base path or deployment.

## Decisions

### 1. "Last checked" is not "last validated"

The target index will state that the date is the evidence review date. Ubuntu's profile may keep "Last validated" because the local machine is Ubuntu 26.04.1. Fedora KDE changes to "Last checked" with a sentence that runtime validation is pending. The machine-readable `last_validated` field remains a structural cleanup for `harden-public-delivery`; this change does not rename it.

### 2. Plasma 6.8 is the Wayland-only boundary

The guide targets Wayland on Fedora KDE, but it must not claim every Plasma 6 release is Wayland-only. The text says that Plasma 6.8 removes the X11 session and that the target uses Wayland; the exact Fedora package version is checked with `plasmashell --version`.

### 3. Fedora GNOME is the next stack, not the same version

The validation target is GNOME 51/GTK 4.24. It catches drift from Ubuntu's GNOME 50/GTK 4.22. The wording must say "next GNOME stack" or name both versions; "same GNOME stack" is false.

### 4. The Qt chapter targets the lower baseline

The example uses Qt 6.10 APIs and KF 6.24 APIs, which are available on Ubuntu 26.04. Fedora 45 supplies newer packages. The chapter says the lower baseline is the compatibility floor and the Fedora target is the upstream-current reference; it does not claim the example requires 6.11/6.30.

### 5. The baseline review is manual until the freshness workflow exists

The baseline page describes the six-month review trigger and the commands to run. It does not promise an automatic issue until `harden-public-delivery` implements it.

## Risks / Trade-offs

- **Over-correcting the target story.** The matrix stays unchanged; only the prose is corrected.
- **Version drift.** The version claims remain dated and linked; the freshness workflow will take over later.
- **Duplication with the evidence page.** The target index keeps the short note; the evidence page remains the detailed register once integrated.
