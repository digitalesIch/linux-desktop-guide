# Tasks

## 1. Blocking factual corrections

- [ ] 1.1 Update `src/data/baseline.json` and `reference/baseline.mdx`: `snap_base` to `core26`, add .NET 10, OpenJDK 25, Zig 0.15.2, and the validated Flatpak/Snapd versions; replace "future documentation MCP server" with the current MCP server; run `npm run check:baseline`.
- [ ] 1.2 Fix `platform/ubuntu.md` toolchains: `dotnet10` (or the backports PPA/.NET snap), `openjdk-25-jdk`, archive `zig`; add the App Center snap/deb nuance, the Ubuntu 26.04 Wayland-only statement, and a note on the release-notes vs release-cycle support-date discrepancy.
- [ ] 1.3 Fix the Snap example in `platform/packaging.md`: `base: core26`, explicit Python for a Python app, Snapcraft 9.2+ for the GNOME extension, a manual `gsettings` plug when needed, remove `unity7`, and reduce `plugs` to what the example actually needs.
- [ ] 1.4 Replace the Flathub submission manifest in `ship/flathub.md` with a `git`/`archive` source; add a "local `type: dir` only" note to `start/first-app.md`, `platform/flatpak-portals.md`, `engineering/qt.md`, and `engineering/rust.md`.
- [ ] 1.5 Fix the deb example: `Standards-Version` to the current policy (4.7.4.0), `lintian` to `_all.changes` or `*.changes`, and the CI `build-dep` step to enable source repositories or use `mk-build-deps`.
- [ ] 1.6 Fix `platform/integration.md`: remove the `org.pipewire` D-Bus claim, correct the CUPS row to IPP/libcups, fix the user-unit `network-online.target` with `graphical-session.target`/`PartOf=`, add systemd hardening and `import-environment`, and replace `QRecentFiles` with `Gtk.RecentManager` or `KRecentFilesAction`.
- [ ] 1.7 Fix `start/why-linux.md` and the glossary to say the Ubuntu Desktop session is Wayland-only, update the release checklist's session row, and add `DBusActivatable=true` to the first-app desktop entry.
- [ ] 1.8 Fix `engineering/performance.md` to use Wayland-compatible input-latency tools instead of `xinput`.
- [ ] 1.9 Fix the CI workflow in `engineering/testing.md`: do not mix `setup-python` with apt PyGObject; install `flatpak-builder-lint` or use the Flatpak builder container.
- [ ] 1.10 Fix the packaging-channel table in `platform/flatpak-portals.md`: Snap uses a shared base snap, not one base per app; clarify that screenshots are expected for a good Flathub listing while metainfo is required.
- [ ] 1.11 Compile-check or validate the Blueprint, QML/C++, Rust, and Python examples where feasible; mark examples as illustrative when they cannot be compiled in CI.
- [ ] 1.12 Replace the legacy `canonical-snap.readthedocs-hosted.com` links with `https://snapcraft.io/docs/` and the current Snapcraft documentation; re-run the external link check.
- [ ] 1.13 Correct the portal semantics in `platform/flatpak-portals.md`: Secret portal returns a per-app master secret, `Usb` is the correct portal name, and Settings exposes color-scheme/accent/contrast/reduced-motion but not fonts.
- [ ] 1.14 Correct Flatpak examples: `fallback-x11` only applies when Wayland is unavailable, use `GDK_DEBUG=portals` for GTK4, and show the `apt install flatpak flatpak-builder` plus `flatpak remote-add` setup that Ubuntu 26.04 needs.
- [ ] 1.15 Add the GApplication `--gapplication-service` argument to the D-Bus service file, and document `XDG_ACTIVATION_TOKEN`/`xdg_activation_v1` for custom toolkits.
- [ ] 1.16 Fix `platform/xdg.md`: use `/usr/share/doc/<package>/copyright` on Ubuntu, treat `Hidden=true` as a user override, and test `StartupWMClass` against the actual `WM_CLASS`.
- [ ] 1.17 Fix `platform/packaging.md` Snap `command` to the installed path, remove `unity7`, add the `gsettings` plug when needed, remove `wl-info` from the Wayland tooling, and fix the CI sketch (Snap job, `deb-src`/`mk-build-deps`, `lintian`).
- [ ] 1.18 Decide the Ubuntu 26.04 support-date source of truth: release notes say April 2031, the release-cycle table says May 2031; use one in prose and footnote the discrepancy, then align `src/data/baseline.json`.

## 2. Ubuntu 26.04 coverage

- [ ] 2.1 Add a concise "What changed in Ubuntu 26.04" section or callout covering Wayland-only, `core26`, App Center deb support, permission prompting/Security Center, Glycin, GStreamer 1.28, Sysprof, Ubuntu Insights, ARM64, NVIDIA Wayland, and fractional scaling.
- [ ] 2.2 Explain Ubuntu 26.04 Snap portal integration and experimental permission prompting in `platform/flatpak-portals.md`, `platform/security.md`, and `platform/ubuntu.md`.
- [ ] 2.3 Add App Center snap/deb guidance and the "third-party debs are discouraged" caveat to `platform/ubuntu.md` and `platform/packaging.md`.
- [ ] 2.4 Add the `core26` Python-removal migration to the Snap section and the release checklist.
- [ ] 2.5 Add Ubuntu 26.04 accessibility changes (Orca improvements, Reduced Motion) to `design/accessibility.md`.
- [ ] 2.6 Add GStreamer 1.28 and the PipeWire multimedia path to the integration or performance guidance where relevant.
- [ ] 2.7 Add App Center, Security Center, permission prompting, and Ubuntu Insights source links to the Ubuntu, security, packaging, and resources pages.
- [ ] 2.8 Add Flatpak runtime lifecycle guidance (branch support windows, EOL, rebase, `flatpak update`, `flatpak uninstall --unused`) and portal-permission persistence (`flatpak permission-set`/`permission-reset`, `--persist=`).
- [ ] 2.9 Add MIME/URL handler and file-manager integration guidance (`xdg-mime default`, `update-desktop-database`, `%U`/`%F`, `x-scheme-handler/*`, `org.freedesktop.FileManager1.ShowItems`).
- [ ] 2.10 Expand printing, input methods, screen capture, and power guidance: Print portal/CUPS/IPP, IBus/Fcitx5 and the Wayland IM module rules, ScreenCast restore tokens, and logind `PrepareForSleep`.
- [ ] 2.11 Add the remaining Ubuntu 26.04 platform changes: NVIDIA/Wayland, GStreamer 1.28/VA-API, Glycin/gdk-pixbuf, Sysprof-by-default, and Ubuntu Insights separation from app telemetry.

## 3. Toolkit and engineering depth

- [ ] 3.1 Add GTK 4.22 `GtkSvg` and the trusted-vs-untrusted SVG boundary (Glycin) to `engineering/gtk.md` and `platform/security.md`.
- [ ] 3.2 Add libadwaita 1.9 coverage: `Adw.Sidebar`, `Adw.ViewSwitcherSidebar`, `Adw.ShortcutsDialog`, `Adw.WrapBox`, `Adw.Spinner`, `Adw.get_enable_animations`, and the `style-dark.css`/`style-hc.css` deprecation; replace the unsupported GTK CSS `prefers-reduced-motion` example.
- [ ] 3.3 Add Qt 6.10 coverage: high-contrast support, `SearchField`, `FlexboxLayout` (tech preview), `QRangeModel`, `Synchronizer`, `TreeModel`, `SortFilterProxyModel`, and the PipeWire multimedia backend.
- [ ] 3.4 Clarify Qt LTS licensing/maintenance: Qt 6.8 LTS is commercially maintained; open-source users should track their distro or the latest stable.
- [ ] 3.5 Add a note on KDE Frameworks 6.24 requiring Qt 6.8 and Kubuntu 26.04's Plasma 6.6/Frameworks 6.24/Gear 25.12 stack.
- [ ] 3.6 Expand `engineering/performance.md` with Wayland input-latency measurement and a note that Sysprof ships by default on Ubuntu 26.04.
- [ ] 3.7 Expand `engineering/testing.md` with a working PyGObject CI example and a packaging-linter step.
- [ ] 3.8 Fix the GSettings window-size binding examples: `default-width` is the initial size, not the persisted current size; show how to save the actual size on close or clarify the property.
- [ ] 3.9 Add `g_get_user_special_dir()` / `xdg-user-dir` guidance instead of reading `user-dirs.dirs` directly in `platform/xdg.md`.
- [ ] 3.10 Add the Flathub metainfo `<translation>` tags and `flatpak-builder-lint appstream` validation to `ship/appstream.md` and `design/localization.md`.
- [ ] 3.11 Add an `Adw.Breakpoint` to the first-app split view and correct `design/layout.md` so `Adw.OverlaySplitView`/`Adw.NavigationSplitView` are not described as adaptive without a breakpoint.
- [ ] 3.12 Fix the first-app example: app-ID-scoped data directory, `.document` for note text, accessible labels on icon-only buttons, consistent `Categories`, and license/website in `Adw.AboutDialog`.
- [ ] 3.13 Fix the Meson/gettext layout (`po/POTFILES.in`, `po/meson.build`, `subdir('po')`), add Python `bindtextdomain`/`textdomain` and Qt translation setup, and add input-method/RTL/bidi guidance.
- [ ] 3.14 Fix AppStream guidance: screenshot size for Flathub, native window shadow/decoration (do not tell readers to avoid it), screenshot `xml:lang` tags, app-name/summary length targets, light/dark branding colors, actual validator issue tags, `<launchable>` mapping, and `appstreamcli compose`/Flathub lint consistency.
- [ ] 3.15 Fix the Flathub Builder setup order and `--user` consistency, and add runtime EOL/update/retest guidance.
- [ ] 3.16 Replace the invalid `Gtk.FilterListModel.set_filter_func` example with `Gtk.CustomFilter` or the correct filter property.
- [ ] 3.17 Qualify the reduced-motion claim: libadwaita widgets honor it, but GTK 4.22 core widgets and custom animations must be verified.
- [ ] 3.18 Confirm the `GtkSvg` introduction version against the GTK docs, describe it as available in Ubuntu 26.04's GTK 4.22, and note that `GtkSvgWidget` is 4.24-only and therefore not in Ubuntu 26.04.
- [ ] 3.19 Fix the "ten dimensions" cross-reference to the Quality Bar's seven dimensions.
- [ ] 3.20 Replace "use D-Bus instead of `snap`" with "use D-Bus or the snapd REST API" in the checklists and Ubuntu page.
- [ ] 3.21 Fix the release checklist: string-freeze wording, Snap/core26/Snapcraft 9/Python staging, App Center listing, crash reporting, SBOM/provenance, and reproducible-build checks.

## 4. Editorial corrections

- [ ] 4.1 Remove the Electron/Tauri/Flutter/Wails comparison table from `start/choose-stack.md` and the Tauri row from `engineering/rust.md`; replace with neutral criteria for web-shaped products.
- [ ] 4.2 Remove the Flutter AT-SPI claims from `platform/ubuntu.md` and `design/accessibility.md`.
- [ ] 4.3 Remove the `~/Library/Application Support` macOS comparison from `platform/xdg.md`, the "Application Support" reference from `start/why-linux.md`, and the "traffic lights" references from `platform/wayland.md` and `design/principles.md`.
- [ ] 4.4 Search all docs for Apple/macOS/Windows, "traffic lights", and named competitor comparisons; rewrite or remove every hit that violates the editorial rule.
- [ ] 4.5 Replace unsourced absolute claims with sourced statements or explicit recommendations, including "without asking a gatekeeper," "a decade-old laptop," "100–300 MB installs," "largest vendor-neutral app store," and "most apps fail on three or four rules."
- [ ] 4.6 Update the glossary entries for Wayland, Snap, and App Center to match the current platform, without adding competitor comparisons; qualify COSMIC's design documentation rather than calling it a published HIG.

## 5. Sources and baseline

- [ ] 5.1 Update `reference/resources.md` with: Ubuntu 26.04 release notes and release cycle, GNOME 50/GTK 4.22/libadwaita 1.9 release notes and NEWS, Qt 6.10 release/high-contrast notes, KDE Frameworks 6.24 and Plasma 6.6, current Snapcraft/Snap docs (`snapcraft.io/docs`), Snapcraft `core26` and Python migration, Flathub requirements/metainfo/linter/quality guidelines, AppStream validator docs, WCAG 2.2/EN 301 549/EAA, AT-SPI, Meson i18n, CMake, GStreamer, Security Center/permission prompting, App Center, Ubuntu Insights, Mutter Devkit, `xdg-activation`, XDG User Dirs, systemd user units, Flatpak runtimes/permissions, xdg-desktop-portal Secret/Usb/Settings docs, Debian Policy, GApplication D-Bus activation, GTK4 running/debugging and window docs, OverlaySplitView/Breakpoint docs, reproducible-builds/OSV/OpenSSF.
- [ ] 5.2 Add inline source links to every version, support, and platform claim that can change.
- [ ] 5.3 Add a short "content review" checklist covering sources, baseline fields, affected pages, and validation commands.
- [ ] 5.4 Update `README.md` and `AGENTS.md` if the review process or commands change.

## 6. Verification

- [ ] 6.1 Run `npm run build`.
- [ ] 6.2 Run `npm run check:baseline`.
- [ ] 6.3 Run `npm run check:agent-docs`.
- [ ] 6.4 Run `npm run test:docs-mcp` and verify search still returns the updated pages.
- [ ] 6.5 Re-run the internal link/anchor checker.
- [ ] 6.6 Validate the updated AppStream, desktop-entry, Snap, and Flatpak examples with the available tools.
- [ ] 6.7 Review the diff for factual claims and editorial-rule violations; run `git diff --check`.
- [ ] 6.8 Commit on `workspace` with an English message and merge to `main`.

## Workflow follow-up

- Archive the change after review.
