# Design

## Context

Fedora 45 KDE is a reference target. Its profile covers the toolchain, Flatpak runtime, and quality gates, but the platform chapters still assume Ubuntu:

- packaging ends at deb/Snap/Flatpak/AppImage;
- security ends at AppArmor;
- integration is generic and does not name the Plasma portal backend, KWallet, KIO, or Fedora's service and firewall model.

The result is a target that is selectable but not fully buildable outside Flatpak. This change fills that gap without adding a new route or changing the target matrix.

## Goals / Non-Goals

**Goals**

- Give a Fedora KDE developer a native RPM path that is honest about when RPM is the wrong channel.
- Explain SELinux well enough to diagnose a denial and avoid the "disable SELinux" advice.
- Name the Fedora/KDE integration points that differ from the Ubuntu/GNOME target.
- Link every changeable claim to a primary Fedora, KDE, or upstream source.

**Non-Goals**

- A complete RPM packaging tutorial or Fedora package-review/sponsorship guide.
- Writing or shipping a custom SELinux policy.
- A Fedora remix, a new target page, or a new sidebar entry.
- Repeating the Qt/Kirigami API chapter; the target page links to it.
- Covering RHEL, CentOS Stream, or openSUSE packaging differences.

## Decisions

### 1. RPM is a secondary channel on the Fedora KDE target

Flatpak remains the primary distribution path because it carries a current runtime and works across distributions. RPM is the native Fedora path for apps that need archive integration, system services, or a Fedora-only audience. The section explains the trade-off instead of presenting RPM as the default.

### 2. The spec example is illustrative, not a claimed build

The spec skeleton uses Fedora macros (`%cmake`, `%cmake_build`, `%cmake_install`, `%autochangelog`) and the Qt/Kirigami build requirements from the target profile. It is marked illustrative because the guide does not run a Fedora RPM build in this environment. `mock` is the clean-build check; `rpmlint` and `fedpkg lint` are the metadata checks.

### 3. SELinux is explained by scope, not by a single switch

Fedora's targeted policy confines selected system services; ordinary desktop user apps often run unconfined. Flatpak is the app sandbox, not an SELinux domain. The guide must not tell readers to disable SELinux, and `audit2allow` output is a diagnostic input, not a shippable policy.

### 4. Fedora integration stays in the target profile

The portal backend, KWallet/KIO/KNotification, systemd user services, firewalld, and Atomic/Kinoite are Fedora/KDE-specific. They belong in `targets/fedora-kde.md`, with links to the generic packaging and security sections. This avoids scattering Fedora conditionals through the cross-distro chapters.

### 5. Source hierarchy

Fedora documentation and KDE API documentation are the primary sources. The RPM Packaging Guide is the upstream tutorial; the Fedora Packaging Guidelines are the normative rules. For SELinux, the Fedora Wiki and the `audit2allow` man page are the references. Firewalld, Kinoite, Toolbx, and the KDE portal repository provide the integration details.

## Risks / Trade-offs

- **Fedora version drift.** Package names and defaults change between releases. The section names Fedora 45 and links the package index; the freshness workflow is the long-term guard.
- **SELinux oversimplification.** Targeted policy is nuanced. The text keeps the scope narrow: user app, system service, Flatpak.
- **RPM example not built here.** It is explicitly illustrative; `mock` is the command a Fedora packager must run.
- **Duplication with the Qt chapter.** The target page links to the Qt chapter for API details and only names the integration points.
- **Atomic/Kinoite edge cases.** The section states the Flatpak-first rule and does not promise that every app can be layered.

## Verification

- Build the site and check the new headings, code blocks, links, and anchors.
- Run the external link check for the new Fedora and KDE sources.
- Check the new sections at desktop and narrow widths.
- Verify the live Pages deployment after merge.
