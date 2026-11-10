# Design

## Context

See `proposal.md` for motivation. The project is an Astro Starlight documentation site with 30 content pages, a custom visual system, and an existing Platform section covering Wayland, XDG, integration, Flatpak, packaging, and security. The guide already uses Ubuntu 26.04 LTS as its baseline and references freedesktop specifications and GNOME/KDE documentation. It does not yet have a single place for Ubuntu-specific developer guidance or a map of Ubuntu system services and their supported APIs.

The upstream material is spread across:

- `documentation.ubuntu.com/ubuntu-for-developers/` for toolchains, IDEs, packaging, and support.
- `documentation.ubuntu.com/desktop/` for Ubuntu Desktop behavior, accessibility, and snap/deb policy.
- `documentation.ubuntu.com/pro-client/` for Ubuntu Pro.
- `canonical-snap.readthedocs-hosted.com` and `documentation.ubuntu.com/snapcraft/` for snaps.
- Upstream component docs for NetworkManager, PipeWire/WirePlumber, UPower, BlueZ, CUPS, UDisks2, AppArmor, Polkit, fwupd, and PackageKit.

## Source inventory

Affected content and the gaps this change fills:

| Area | Existing file(s) | Missing from the guide |
| --- | --- | --- |
| Ubuntu overview | `start/why-linux.md`, `start/choose-stack.md` | Release/support model, Ubuntu-specific toolchain sources |
| Packaging | `platform/packaging.md`, `ship/flathub.md` | deb/PPA, Snapcraft, App Center policy, Rockcraft, Pro relationship |
| Integration | `platform/integration.md` | Ubuntu service defaults and primary API docs |
| Security | `platform/security.md` | AppArmor, Polkit, fwupd, Ubuntu Pro/ESM/Livepatch |
| Accessibility | `design/accessibility.md` | Ubuntu accessibility stack, Orca/BRLTTY, Flutter caveat |
| Rust | `engineering/rust.md` | Ubuntu Rust setup/version references |
| Reference | `reference/resources.md`, `reference/glossary.md`, `reference/checklists.md` | Ubuntu docs, service portals, terminology, checklist |

Primary source set: `documentation.ubuntu.com/ubuntu-for-developers/`, `documentation.ubuntu.com/desktop/`, `documentation.ubuntu.com/pro-client/`, `documentation.ubuntu.com/snapcraft/`, `canonical-snap.readthedocs-hosted.com`, the component project docs, and the Ubuntu 26.04 release notes.

## Goals / Non-Goals

**Goals:**

- Give Ubuntu-targeting developers one authoritative entry point for platform-specific decisions.
- Add current Ubuntu guidance on toolchains, packaging, accessibility, security, and system services.
- Preserve the guide's toolkit-neutral, standards-first framing while making Ubuntu's supported path explicit.
- Keep the existing page structure intact; add cross-links instead of duplicating large sections.
- Make every new external link point to a primary source that is publicly reachable.

**Non-Goals:**

- Documenting Ubuntu Server, cloud, Ubuntu Core, or kernel development.
- Turning the guide into a Canonical product manual.
- Replacing the existing freedesktop/Wayland/Flatpak pages.
- Changing the example app, build system, or site architecture.

## Decisions

### 1. Add one Ubuntu hub page instead of scattering facts

Create `platform/ubuntu.md` as the canonical map of Ubuntu-specific developer resources and system services. Existing pages link to it for the full service table and Ubuntu-specific details. This avoids duplicating the same service descriptions in integration, security, and packaging.

Alternative considered: extend `platform/integration.md` only. Rejected because the material spans toolchains, release support, packaging, and security, not just D-Bus integration.

### 2. Put the page first in the Platform sidebar

The guide is Ubuntu-first, so the Ubuntu platform page becomes the entry point for the Platform section, followed by Wayland, XDG, integration, Flatpak, packaging, and security. The page itself links forward to those pages for depth.

### 3. Treat Ubuntu docs as the first source, component docs as the second

For each topic, prefer the official Ubuntu documentation. When Ubuntu delegates to an upstream project (for example, PipeWire or NetworkManager), link to that project's primary documentation. Freedesktop specifications remain the contract reference for app-facing APIs. Do not use third-party tutorials when a primary source exists.

### 4. Separate “use this API” from “this is how the system works”

The service map distinguishes:

- **App-facing**: APIs an app should normally use (portals, GSettings, libsecret, MPRIS, AT-SPI).
- **Integration-facing**: services an app may query or control with care (UPower, NetworkManager, BlueZ, UDisks2, CUPS, fwupd).
- **System-owned**: services apps should not bypass (systemd, AppArmor, Polkit, snapd).

This prevents the common mistake of shelling out to `nmcli`, `udisksctl`, or `snap` from a sandboxed app.

### 5. Make Ubuntu packaging paths explicit

Document that Ubuntu officially supports deb and snap packages, with PPA as the upstream deb channel; snaps are the recommended path for third-party desktop apps in the Ubuntu App Center because they are sandboxed and updated independently. Flatpak remains the cross-distro upstream path already covered by the guide. OCI images/Rockcraft are mentioned for containerized delivery, not as desktop app packaging.

### 6. Mention Ubuntu Pro as optional infrastructure, not a requirement

Explain ESM, Livepatch, FIPS/CIS, and `pro` commands for developers who need extended security coverage. Explicitly state that apps must work on a stock Ubuntu installation without Pro and must not assume Pro-only services are enabled.

### 7. Use stable public URLs

Prefer `documentation.ubuntu.com` and project home pages over readthedocs-hosted URLs that may require login. Where only an upstream repository or API reference is stable, link to that. Add a link-check task to the implementation.

## Risks / Trade-offs

- **Documentation drift** → Link to canonical docs and avoid exact minor-version claims that are not verified; review version tables at release time.
- **Duplication with existing pages** → Keep the new page as the hub; integration/security/packaging pages link to it and retain only topic-specific detail.
- **Scope creep into server/cloud** → Explicit non-goal; only desktop runtime and app-development topics.
- **Snap vs Flatpak confusion** → Explain that Ubuntu recommends snaps for its App Center while Flatpak remains the guide's cross-distro upstream path; they solve overlapping but not identical problems.
- **Ubuntu Pro assumptions** → State clearly that Pro is optional and apps must degrade gracefully without it.
- **Link rot** → Add an external-link check to the verification checklist and keep a curated resources section.
- **Accessibility claims** → Source the AT-SPI/GTK/Flutter caveats from Ubuntu's accessibility-stack page, not from assumptions.

## Migration Plan

No migration. Additive documentation change with no runtime behavior. Rollback is a normal revert of the Markdown and sidebar changes.

## Open Questions

None. The scope is documentation-only and the source hierarchy is settled.
