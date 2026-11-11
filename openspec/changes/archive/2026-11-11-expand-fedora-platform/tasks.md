# Tasks

## 1. RPM packaging

- [x] 1.1 Add `## RPM packages` to `platform/packaging.md` after the deb section: when RPM is the right secondary channel, when Flatpak is better, and how Fedora's package model differs from a vendor repository.
- [x] 1.2 Add an illustrative Qt/Kirigami spec-file skeleton using Fedora macros, the target's build requirements, AppStream/desktop/icon paths, and a changelog.
- [x] 1.3 Document `rpmdev-setuptree`, `rpmbuild`, `mock`, `rpmlint`, `fedpkg lint`, and COPR; mark the spec as illustrative and `mock` as the clean-build proof.
- [x] 1.4 Add the Fedora Packaging Guidelines, RPM Packaging Guide, Fedora Developer RPM page, and COPR documentation to the page sources and `reference/resources.md`.

## 2. SELinux

- [x] 2.1 Add `### SELinux` to `platform/security.md` next to AppArmor: targeted policy, `getenforce`, `sestatus`, and why disabling SELinux is not a fix.
- [x] 2.2 Explain the three scopes: a desktop user app (often unconfined), a system service (needs a domain and file contexts), and a Flatpak (sandboxed by Flatpak and portals, not by a custom SELinux policy).
- [x] 2.3 Document `ausearch -m AVC,USER_AVC -ts recent`, `audit2allow` as a diagnostic, `semanage fcontext`, `restorecon`, and the rule that generated policy needs review before shipping.
- [x] 2.4 Add the Fedora SELinux Wiki, Fedora SELinux troubleshooting, and `audit2allow(1)` to the page sources and resources.

## 3. Fedora and KDE integration

- [x] 3.1 Add `## Fedora and KDE integration notes` to `targets/fedora-kde.md`: `xdg-desktop-portal-kde`, KWallet, KIO, KNotification, and `KDBusService`.
- [x] 3.2 Add the service and network model: systemd user units, `loginctl enable-linger` only when required, firewalld only for network-listening services, and no open ports for a desktop app.
- [x] 3.3 Add the Fedora Atomic/Kinoite model: Flatpak first, `rpm-ostree` layering as an admin action, Toolbx for development, and a Kinoite smoke test.
- [x] 3.4 Link the RPM and SELinux sections from the target profile; avoid duplicating the Qt chapter.
- [x] 3.5 Add KDE API, portal, firewalld, Kinoite, and Toolbx sources.

## 4. Verification

- [x] 4.1 Run `npm run check:docs`; verify headings, code blocks, links, anchors, and the base path.
- [x] 4.2 Run `npm run check:quality -- --no-build`; verify the Lighthouse budgets.
- [x] 4.3 Run `npm run check:links:external`; triage new Fedora/KDE sources and record any unreachable host.
- [x] 4.4 Review the rendered RPM, SELinux, and Fedora integration sections at desktop and narrow widths.
- [x] 4.5 Commit and push; verify the Pages deployment and the live pages.
