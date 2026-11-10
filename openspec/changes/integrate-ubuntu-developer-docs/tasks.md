# Tasks

## 1. Baseline and source verification

- [x] 1.1 Inventory Ubuntu-specific gaps in `start/`, `platform/`, `design/`, `engineering/`, and `reference/`; record the affected files and missing topics in the change notes, verified by a written list covering toolchains, packaging, accessibility, security, and system services.
- [x] 1.2 Verify the canonical URLs for Ubuntu developer docs, Ubuntu Desktop docs, Ubuntu Pro Client, Snap/Snapcraft, Rockcraft, and each system-service portal; only keep URLs that return HTTP 200 or are reachable from a normal browser, verified by the link-check output.
- [x] 1.3 Confirm the Ubuntu 26.04 facts used on the new page (LTS support dates, GNOME 50/GTK 4.22/libadwaita 1.9, Qt 6.10, snap/deb policy) against the Ubuntu Desktop and release-notes pages, verified by cited links in the draft.

## 2. New Ubuntu platform page

- [x] 2.1 Create `src/content/docs/platform/ubuntu.md` with the release/support table, toolchain table, packaging decision table, system-service map, Ubuntu Pro section, support links, and a checklist; verify the page renders at `/platform/ubuntu/` with one H1 and no broken internal links.
- [x] 2.2 Write the system-service map with columns for service, supported API, app-facing guidance, and primary documentation; verify every row has a working external link and a clear “use this / avoid that” instruction.
- [x] 2.3 Add the Ubuntu-specific security section (AppArmor, Polkit, fwupd, Ubuntu Pro/ESM/Livepatch) and the accessibility stack summary (AT-SPI, Gtk.Accessible, Orca, Flutter caveat); verify the claims match the linked Ubuntu pages.
- [x] 2.4 Add the packaging section covering deb/PPA, snaps/Snapcraft, OCI/Rockcraft, Ubuntu App Center behavior, and the relationship to Flatpak; verify the commands and package names are valid for Ubuntu 26.04.

## 3. Cross-page integration

- [x] 3.1 Update `start/choose-stack.md` with a short “Ubuntu toolchains” subsection and links to Ubuntu setup/version-availability docs; verify the page builds and the new links resolve.
- [x] 3.2 Update `platform/integration.md` to link to the new Ubuntu service map and add the Ubuntu defaults for systemd, NetworkManager, PipeWire/WirePlumber, UPower, BlueZ, CUPS, UDisks2, and Polkit; verify the existing integration table still renders correctly.
- [x] 3.3 Update `platform/packaging.md` with Ubuntu packaging-guide, PPA, Snapcraft tutorial, Snap confinement, and Rockcraft links; verify the deb/Snap/Flatpak decision matrix remains consistent with the new Ubuntu page.
- [x] 3.4 Update `platform/security.md` with AppArmor, Polkit, fwupd, and Ubuntu Pro guidance; verify the security checklist includes the new items.
- [x] 3.5 Update `design/accessibility.md` with the Ubuntu accessibility-stack references (AT-SPI, GTK4/GTK3, Orca, BRLTTY, Flutter caveat); verify the page’s recommended tooling matches the linked Ubuntu docs.
- [x] 3.6 Update `engineering/rust.md` with the Ubuntu Rust toolchain setup and version-availability links; verify the existing gtk-rs guidance still reads coherently.

## 4. Reference and navigation

- [x] 4.1 Add the Ubuntu platform page to the Platform sidebar in `astro.config.mjs` before Wayland; verify it appears in the built navigation and Pagefind index.
- [x] 4.2 Extend `reference/resources.md` with an Ubuntu section and primary links for Ubuntu developer docs, Ubuntu Desktop docs, Pro Client, Snap/Snapcraft, Rockcraft, AppArmor, Polkit, NetworkManager, PipeWire/WirePlumber, UPower, BlueZ, CUPS, UDisks2, fwupd, and PackageKit; verify all links resolve.
- [x] 4.3 Extend `reference/glossary.md` with AppArmor, Polkit, snapd, Snapcraft, Ubuntu Pro, ESM, Livepatch, fwupd, PackageKit, WirePlumber, Rockcraft, and PPA; verify each definition is accurate and internally linked where useful.
- [x] 4.4 Extend `reference/checklists.md` with an “Ubuntu platform” checklist covering supported release, packaging choice, service APIs, AppArmor/Polkit, Pro optionality, accessibility stack, and snap/deb behavior; verify the checklist renders as static markers and passes the accessibility audit.

## 5. Verification and release

- [x] 5.1 Run `npm run build` and verify all pages build, Pagefind indexes the new page, and the sidebar link works.
- [x] 5.2 Run the internal link/anchor checker over `dist/` and verify zero missing pages or anchors.
- [x] 5.3 Run the external link checker over all Markdown URLs and verify no new 4xx/5xx failures remain; document any bot-blocked but browser-valid URLs.
- [x] 5.4 Run Lighthouse on `/platform/ubuntu/`, `/platform/integration/`, and `/reference/checklists/`; verify Accessibility, Best Practices, and SEO scores remain at 1.0 with no failures.
- [x] 5.5 Review the diff for English consistency, Ubuntu-specific accuracy, and duplication; verify the new page links forward to the existing Wayland/XDG/integration/packaging/security pages instead of restating them.
- [x] 5.6 Commit the change on the `workspace` branch with an English commit message and verify `git status` is clean.

## Workflow follow-up

- Archive the change after review, using the OpenSpec archive workflow.
- Re-check Ubuntu documentation links at the next release or after a major Ubuntu point release.
