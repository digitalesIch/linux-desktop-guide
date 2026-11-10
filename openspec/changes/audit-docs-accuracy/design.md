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
| `platform/ubuntu.md`, `design/accessibility.md` | Flutter AT-SPI claim | Remove the named competitor claim; keep the general advice to test custom-rendered UI with Orca | Editorial rule |
| `start/choose-stack.md`, `engineering/rust.md` | Electron/Tauri/Flutter/Wails comparison | Replace with criteria for web-shaped products, without named competitor comparisons | Editorial rule |
| `platform/xdg.md`, `start/why-linux.md` | `~/Library/Application Support` reference | Remove the macOS comparison; describe XDG directly | Editorial rule |
| `platform/wayland.md`, `design/principles.md` | "fake traffic lights" | Replace with "fake window controls"; the term is a macOS reference | Editorial rule |

## Risks / Trade-offs

- **Large diff across many pages** → Split the work into the four task groups: blockers, Ubuntu 26.04 coverage, toolkit depth, editorial/sources.
- **Version drift** → Every version claim links to a primary source and the baseline JSON; review dates are explicit.
- **Flathub policy changes** → Link to the live requirements page rather than copying the entire policy.
- **Opinionated advice becomes bland** → Keep the recommendations, but label them as recommendations and source the factual claims.
- **Adding too much Ubuntu 26.04 detail** → Put the platform delta on one page/callout and link from the affected pages.
- **Source rot** → Add the review checklist and prefer stable primary documentation URLs over blog posts.

## Migration

No routes or anchors need to move. New sections should be added inside existing pages unless the Ubuntu 26.04 delta proves large enough to justify a new page. If a new page is added, update the sidebar, agent docs, baseline links, and MCP tests.
