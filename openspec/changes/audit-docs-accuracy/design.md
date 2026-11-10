# Design

## Context

The guide targets Ubuntu 26.04 LTS and the GNOME 50 / GTK 4.22 / libadwaita 1.9 / Qt 6.10.2 / KDE Frameworks 6.24 stack. The audit used:

- the local Ubuntu 26.04.1 machine (`GNOME Shell 50.1`, GTK `4.22.4`, libadwaita `1.9.1`, Qt `6.10.2` candidate);
- the Ubuntu 26.04 release notes and release-cycle page;
- GNOME 50 developer notes and the libadwaita 1.9 API documentation;
- Qt 6.10 release and high-contrast notes;
- KDE Frameworks 6.24 and Plasma 6.6 announcements;
- Snapcraft `core26` documentation;
- Flathub requirements and submission documentation;
- local D-Bus/systemd inspection for `org.pipewire`, `network-online.target`, and user units.

The audit is deliberately about content, not site mechanics. The site build, search, links, and MCP server are out of scope unless a content change requires a metadata or baseline update.

## Goals / Non-Goals

**Goals:**

- Remove factual errors and outdated package/base names.
- Make every packaging example valid for the channel it claims to target.
- Replace nonexistent APIs and misleading service names with working alternatives.
- Add the Ubuntu 26.04 changes that materially affect desktop app developers.
- Add the modern toolkit features the guide's version claims imply.
- Remove editorial rule violations.
- Leave a sourced, repeatable review trail.

**Non-Goals:**

- Rewriting every page for style.
- Adding a hosted service, automated upstream scraping, or an expensive freshness pipeline.
- Turning the guide into a complete API reference for GTK, Qt, KDE, Snap, or Flatpak.
- Changing the site's design, routes, navigation, or MCP surface.
- Choosing a single winner among GTK, Qt, Rust, or web tech.

## Decisions

### 1. Correctness first, then depth

Blocking factual errors are fixed before adding new material. A shorter page that is right is better than a longer page that repeats a wrong package name or an invalid manifest.

### 2. One verified-facts table drives the edits

The audit records the claim, the verified value, and the primary source. Pages, baseline JSON, and resources all point back to the same facts. This prevents three different versions of the same version number.

### 3. Ubuntu 26.04.1 is the test machine; 26.04 LTS remains the baseline

The guide targets the LTS release, not a point release. Point-release package versions can be mentioned as "current archive" but should not silently replace the baseline. The baseline stays `26.04 LTS` and records the minor versions actually validated.

### 4. Local Flatpak builds and Flathub submissions are different artifacts

`type: dir` is valid for a local tutorial build. It is not a valid Flathub source. The guide must label local examples and show a `git` or `archive` source with a tag/commit for submission. This distinction is currently missing and is a submission blocker.

### 5. Snap examples move to `core26` and acknowledge the Python removal

`core26` is the recommended base for Ubuntu 26.04 snaps. It removes the bundled Python runtime, so the Python example must add Python explicitly. The GNOME extension supports `core26` from Snapcraft 9.2 onward and no longer adds the `gsettings` plug automatically; a settings-using app must declare it. The example also drops the broad legacy `unity7` plug and prefers portals/interfaces that match the app's features.

### 6. Add an Ubuntu 26.04 delta section instead of scattering facts

The guide already has a platform section, but the 26.04 changes are spread across release notes, App Center, Security Center, portals, and the desktop. A short "What changed in Ubuntu 26.04" section (or a callout on the Ubuntu page) gives readers one place to see the delta: Wayland-only, `core26`, App Center debs, permission prompting, Glycin, GStreamer 1.28, Sysprof, Ubuntu Insights, ARM64, NVIDIA Wayland, and fractional scaling.

### 7. Keep the guide opinionated, but source version claims

The guide may still recommend GTK/libadwaita for Ubuntu-first apps, Flatpak for upstream distribution, and minimal permissions. It must not present an unsourced version claim or a competitor comparison as fact.

### 8. Remove competitor comparisons; keep channel comparisons

The editorial rule forbids Apple/macOS/Windows and named competitor comparisons. This removes the Electron/Tauri/Flutter/Wails table and the Flutter AT-SPI claims. Comparisons of Flatpak, Snap, deb, and AppImage are packaging-channel comparisons and remain valid.

### 9. Freshness stays manual and free

This change adds a review checklist and source links, not a crawler or a paid service. The next review can start from the checklist, the baseline JSON, and the resources page. Automated freshness remains deferred.

## Verified corrections

| Location | Current claim | Verified correction | Source |
| --- | --- | --- | --- |
| `platform/ubuntu.md` | `apt install dotnet-sdk-8.0` | Ubuntu 26.04 archive provides `dotnet10`; .NET 8 is available via the backports PPA or the .NET snap | Ubuntu 26.04 release notes, "Development features" |
| `platform/ubuntu.md` | `apt install openjdk-21-jdk` | OpenJDK 25 is the default; 21 remains available for compatibility | Ubuntu 26.04 release notes, "OpenJDK" |
| `platform/ubuntu.md` | Zig via snap or upstream tarball | Zig 0.15.2 is available in the archive | Ubuntu 26.04 release notes, "Toolchain upgrades" |
| `platform/packaging.md`, `src/data/baseline.json` | Snap `base: core24` | `core26` is the recommended base for Ubuntu 26.04; `core26` removes the bundled Python runtime; the GNOME extension needs Snapcraft 9.2+ and no longer adds `gsettings` automatically | Snapcraft "About bases", "Change from core24 to core26", and "GNOME extension" |
| `platform/packaging.md` | `lintian ../notes_0.1.0-1_amd64.changes` for `Architecture: all` | Use `_all.changes` or `*.changes`; the example package is architecture-independent | Debian package architecture rules |
| `platform/packaging.md` | `Standards-Version: 4.7.0` | Ubuntu 26.04 ships Debian policy 4.7.4.0; use the current policy version or state the minimum | `apt-cache policy debian-policy` |
| `platform/integration.md` | PipeWire / `org.pipewire` D-Bus interface | PipeWire has no general `org.pipewire` D-Bus API; use the PipeWire API/GStreamer, or `org.pipewire.Telephony` only for telephony | Local `busctl` inspection; PipeWire docs |
| `platform/integration.md` | CUPS / `org.cups.cupsd` | Use IPP/libcups for printing; the D-Bus name is not the primary API | Ubuntu platform guidance |
| `platform/integration.md` | `After=network-online.target` in `~/.config/systemd/user/...` | `network-online.target` is not available in the user manager; use a user-session target or retry logic | Local `systemctl --user` inspection |
| `platform/xdg.md` | `QRecentFiles` | Qt has no `QRecentFiles`; use `Gtk.RecentManager` on GTK or `KRecentFilesAction` on KDE | Qt/KDE API documentation |
| `design/visual-language.md` | GTK CSS `@media (prefers-reduced-motion)` example | GTK CSS supports color-scheme and contrast preferences; reduced motion is checked through `Adw.get_enable_animations()` or `Gtk.Settings`, not that media query | GTK/libadwaita documentation |
| `start/why-linux.md` | "Wayland is the default on Ubuntu 26.04" | The Ubuntu Desktop session is Wayland-only; XWayland still runs X11 apps | Ubuntu 26.04 release notes, "Wayland session" |
| `engineering/performance.md` | `xinput` for input latency | `xinput` is X11-only; use `wev`, `libinput debug-events`, or toolkit frame timings on Wayland | Wayland/GTK tooling |
| `engineering/testing.md` | `setup-python` plus apt `python3-gi` | The setup-python interpreter cannot see apt-installed PyGObject; use the system Python with `python3-pytest`, or a container that installs both | GitHub Actions and PyGObject packaging |
| `ship/flathub.md` | Flathub manifest with `type: dir` | Flathub submissions must not include source code; use a `git` source with a tag/commit, or an `archive` source with a checksum | Flathub requirements, "Required files" and "No network access" |
| `reference/baseline.mdx` | "the future documentation MCP server" | The MCP server exists and reads the same baseline data | `tools/docs-mcp` |
| `platform/ubuntu.md`, `platform/packaging.md`, `reference/resources.md` | `canonical-snap.readthedocs-hosted.com` links | The legacy Snap docs now redirect to a Read the Docs login; use `https://snapcraft.io/docs/` and the current Snapcraft documentation | HTTP link check, 2026-11-10 |
| `platform/flatpak-portals.md` | Secret portal "stores secrets in the keyring" | `org.freedesktop.portal.Secret` returns a per-app master secret for app-local encrypted storage; libsecret uses it transparently. Direct keyring access is `org.freedesktop.secrets` and is broader | xdg-desktop-portal Secret docs |
| `platform/flatpak-portals.md` | `org.freedesktop.portal.USB` | The portal is `org.freedesktop.portal.Usb`; D-Bus names are case-sensitive | xdg-desktop-portal Usb docs |
| `platform/flatpak-portals.md` | Settings portal exposes fonts | The Settings portal exposes `color-scheme`, `accent-color`, `contrast`, and `reduced-motion`; fonts come from GSettings/toolkit APIs | xdg-desktop-portal Settings docs |
| `platform/ubuntu.md` | "Flatpak runtimes ... built around Ubuntu LTS" | Flatpak runtimes follow Freedesktop/GNOME/KDE schedules, not Ubuntu LTS; document their own support windows | Flatpak runtime docs |
| `platform/xdg.md` | License at `$prefix/share/licenses/$app-id` | Debian/Ubuntu use `/usr/share/doc/<package>/copyright`; `/usr/share/licenses` is a Fedora convention | Debian Policy §12.5 |
| `platform/packaging.md` | Snap `command: bin/notes` with `--prefix=/usr` | The command must point to the installed path, for example `usr/bin/notes`, or use `command: notes` | Snapcraft `snapcraft.yaml` reference |
| `platform/flatpak-portals.md` | `--socket=fallback-x11` provides X11 via XWayland | `fallback-x11` only exposes X11 when Wayland is unavailable; use `--socket=x11` if the app must run under XWayland on a Wayland session | Flatpak sandbox permissions |
| `platform/flatpak-portals.md` | `GTK_USE_PORTAL=1` for GTK4 testing | GTK4 uses `GDK_DEBUG=portals`; `GTK_USE_PORTAL` is a GTK3-era compatibility switch | GTK4 running/debugging docs |
| `platform/flatpak-portals.md` | Flatpak commands assume an installed Flatpak/Flathub setup | Ubuntu 26.04 does not ship Flatpak by default; show `apt install flatpak flatpak-builder` and `flatpak remote-add` | Ubuntu Desktop/Flatpak docs |
| `platform/integration.md` | D-Bus service file `Exec=/usr/bin/notes` | A `GApplication` D-Bus activation service needs `Exec=/usr/bin/notes --gapplication-service` | GApplication docs |
| `platform/xdg.md` | Shipped autostart file with `Hidden=true` | `Hidden=true` is a user override; shipping it disables autostart for everyone | XDG Autostart spec |
| `platform/wayland.md` | `wl-info` | Use `wayland-info` from `wayland-utils`; `wl-info` is not a standard Ubuntu binary | Ubuntu Wayland tooling |
| `platform/packaging.md` | CI sketch promises Snap but has no Snap job; `build-dep` needs `deb-src` | Add a Snap job, enable `deb-src` or use `mk-build-deps`, and install `lintian` | GitHub Actions/Ubuntu packaging |
| `platform/packaging.md` | "strict is the only acceptable default" | Too absolute; classic confinement is legitimate for tools that need broad host access and pass review | Snapcraft confinement docs |
| `platform/ubuntu.md`, `src/data/baseline.json` | Ubuntu 26.04 support ends May 2031/2036/2041 | The 26.04 release notes say April 2031; the release-cycle table says May. Choose one as the primary source and footnote the discrepancy | Canonical release notes and release cycle |
| `platform/ubuntu.md`, `design/accessibility.md` | Flutter AT-SPI claim | Remove the named competitor claim; keep the general advice to test custom-rendered UI with Orca | Editorial rule |
| `start/choose-stack.md`, `engineering/rust.md` | Electron/Tauri/Flutter/Wails comparison | Replace with criteria for web-shaped products, without named competitor comparisons | Editorial rule |
| `platform/xdg.md`, `start/why-linux.md` | `~/Library/Application Support` reference | Remove the macOS comparison; describe XDG directly | Editorial rule |
| `platform/wayland.md`, `design/principles.md` | "fake traffic lights" | Replace with "fake window controls"; the term is a macOS reference | Editorial rule |

## Second-pass findings

- **Tutorial adaptivity:** `Adw.OverlaySplitView` does not collapse by itself. The first-app example needs an `Adw.Breakpoint` that sets `collapsed` at a narrow width; `design/layout.md` must stop calling the split views "adaptive by design."
- **Window-size persistence:** binding `default-width`/`default-height` only sets the initial size. Save the actual `width`/`height` on close (or observe `notify::width`) and restore with `set_default_size`.
- **Meson/gettext layout:** `i18n.gettext()` must live in the directory that contains `POTFILES.in` and `LINGUAS` (usually `po/meson.build` with `subdir('po')` from the root), not at the root while the files sit in `po/`.
- **Flathub screenshots:** Flathub's quality guidelines favor a window capture around 1000×700 (2000×1400 for HiDPI), not "1600×900 or larger." They also require the native window shadow/decoration and language-tagged screenshots; the guide's "avoid drop shadows" advice directly conflicts with the store it recommends.
- **Branding colors:** the light-scheme brand color is darker than the dark-scheme color. Flathub expects the dark variant to be the darker/muted counterpart and to contrast with the icon; swap or validate the pair.
- **AppStream validator output:** the "common validation errors" table uses approximate names (`icon-missing`, `id-mismatch`) instead of the actual `appstreamcli` issue tags. Use real validator output and add `appstreamcli compose`/Flathub lint for desktop-file consistency.
- **Accessible labels:** the first-app icon-only buttons have tooltips but no accessible names, contradicting the accessibility page. Add `Gtk.AccessibleProperty.LABEL` for both buttons.
- **Category consistency:** the desktop file uses `Categories=Office;` while the AppStream page uses `Office;Utility;`. Pick one and keep them in sync.
- **snapd is not D-Bus:** the checklist and Ubuntu page say "use D-Bus instead of `snap`"; snapd exposes a REST API on `/run/snapd.socket`. Say "use D-Bus or the snapd REST API" and keep the command-line warning.
- **Reduced motion:** libadwaita widgets honor the setting, but GTK 4.22 core widgets and custom animations need verification; do not claim every GTK widget handles it automatically.
- **`<launchable>` mapping:** `<launchable type="desktop-id">` points at the installed desktop-file ID, not at `Exec`. Fix the AppStream/desktop consistency table.
- **Flathub Builder setup:** add the Flathub remote before installing `org.flatpak.Builder`, and use `--user` consistently to match the Flathub docs.
- **GtkSvg timing:** the GTK 4.22 docs mark `GtkSvg` as available in 4.22, while `GtkSvgWidget` is 4.24-only. Verify the exact introduction version before making a stronger historical claim; describe what Ubuntu 26.04 actually ships.
- **Dimension count:** the native standard has ten rules, but the Quality Bar has seven dimensions; fix the cross-reference.
- **First-app data path:** use an app-ID-scoped directory under `GLib.get_user_data_dir()` so the app does not collide with another app called "notes" outside Flatpak.
- **Long-form text:** `.body` is for UI descriptions; use `.document` for note content.
- **About dialog completeness:** include the license, website, and issue URL that the metadata checklist promises.
- **Filter API:** `Gtk.FilterListModel` has no `set_filter_func`; show `Gtk.CustomFilter` or set the filter on the model correctly.
- **Localization setup:** add `po/POTFILES.in`, `po/meson.build`, Python `gettext.bindtextdomain`/`textdomain`, Qt `qt_add_translations`/`QTranslator`, input methods (IBus/Fcitx5), bidi isolates, and a realistic RTL locale test.
- **Release checklist wording:** "string freeze is over" should say the freeze is in effect until release; add Snap (`core26`, Snapcraft 9, Python staging, `snapcraft lint`, refresh/rollback), App Center listing, crash reporting, SBOM/provenance, and reproducible-build checks.
- **Unsourced absolutes:** qualify "without asking a gatekeeper" (stores still review), "a decade-old laptop," "100–300 MB installs," "largest vendor-neutral app store," and "most apps fail on three or four rules."

## Toolkit findings

- **Qt CMake is build-breaking:** the KNotifications component/target is `Notifications`/`KF6::Notifications`, not `Notification`/`KF6::Notification`. The example also uses `CMAKE_INSTALL_BINDIR` without `include(GNUInstallDirs)`, and links too few KF6 components for the features the page recommends.
- **Qt single-instance:** `QApplication` does not register a D-Bus name. Use `KDBusService(KDBusService::Unique)` for KDE/Qt, or `QLockFile`/a custom D-Bus name for non-KDE Qt.
- **GTK Inspector:** there is no "Visual" tab. Use **Recorder** for render nodes/clip regions and **Objects** for properties, actions, CSS nodes, and accessibility.
- **OOM and compositor restart:** Linux OOM kills with `SIGKILL`, which the app cannot catch; use `GMemoryMonitor` warnings to drop caches. A Wayland compositor restart normally kills client connections; persist state continuously and restore on the next launch rather than promising reconnect.
- **Actions and shortcuts:** actions do not automatically appear in a shortcuts dialog. Provide an `Adw.ShortcutsDialog` or the `shortcuts_dialog` resource that `Adw.Application` loads.
- **Runtime API guards:** C/C++ APIs are compile-time, not runtime. Use `GTK_CHECK_VERSION`, `QT_VERSION_CHECK`, and Rust feature flags; target GTK 4.22/Qt 6.10 on Ubuntu 26.04 and only guard if older distros are genuinely supported.
- **GTK snippet gaps:** `Gtk.SignalListItemFactory` needs `setup`/`bind` handlers; the async snippet is missing `GLib`; the CSS snippet is missing `Gdk`; the `Adw.SwitchRow` is inert; the Blueprint menu references an undefined action.
- **Rust feature mismatch:** `gtk4` with `v4_10` and `libadwaita` with `v1_5` exclude `GtkSvg` and `AdwSidebar`/`AdwViewSwitcherSidebar`. Use `gnome_50`/`v4_22` and `v1_9`, and add the Rust SDK extension + Cargo environment to the Flatpak module.
- **Rust/CMake details:** the Flatpak cache key uses `github.sha`, so it never hits; use `hashFiles(...)`. `Arc<Mutex<>>` needs a type parameter. Atomic writes need a directory `fsync` after `rename()` for durability.
- **Thin sections:** GTK needs the `GtkSvg`/Glycin trust boundary, libadwaita navigation, accessibility/input/scaling, rendering, and Meson/Flatpak depth. Qt needs 6.10 high-contrast/vector/model/QML-performance/KDE/Wayland coverage. Rust needs a version/feature matrix, Iced/Slint/libcosmic practice, cancellation, and supply-chain guidance. Performance/testing/architecture/reliability need startup tracing, headless Wayland, sanitizers, systemd hardening, and crash-reporting depth.
- **Editorial absolutes:** the Tauri row is a named competitor comparison; “mature, fast,” “first-class,” “stable,” “shortest path,” and “worth more than a hundred guesses” are unsourced; “Sentry, Backtrace, and self-hosted endpoints are all viable” is a vendor endorsement. Replace with criteria or measurements.

## Risks / Trade-offs

- **Large diff across many pages** → Split the work into the four task groups: blockers, Ubuntu 26.04 coverage, toolkit depth, editorial/sources.
- **Version drift** → Every version claim links to a primary source and the baseline JSON; review dates are explicit.
- **Flathub policy changes** → Link to the live requirements page rather than copying the entire policy.
- **Opinionated advice becomes bland** → Keep the recommendations, but label them as recommendations and source the factual claims.
- **Adding too much Ubuntu 26.04 detail** → Put the platform delta on one page/callout and link from the affected pages.
- **Source rot** → Add the review checklist and prefer stable primary documentation URLs over blog posts.

## Migration

No routes or anchors need to move. New sections should be added inside existing pages unless the Ubuntu 26.04 delta proves large enough to justify a new page. If a new page is added, update the sidebar, agent docs, baseline links, and MCP tests.
