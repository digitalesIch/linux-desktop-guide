# Proposal

## Why

The guide currently treats Ubuntu mostly as the default desktop environment and links to a handful of freedesktop standards. Ubuntu's official developer documentation and the upstream portals for its system components contain current, authoritative guidance on toolchains, packaging, accessibility, security, and service APIs that the guide does not yet integrate. Adding these sources makes the guide materially more useful for developers targeting Ubuntu 26.04 LTS and reduces the risk of recommending generic Linux practices that conflict with Ubuntu's supported paths.

## What Changes

- Add a new `platform/ubuntu` page covering:
  - Ubuntu release cadence and support windows (LTS, interim, Ubuntu Pro, ESM, Livepatch).
  - Supported developer toolchains and where Ubuntu documents install/version availability.
  - Ubuntu-native packaging paths: deb/PPA, snaps/Snapcraft, and OCI images/Rockcraft.
  - A map of Ubuntu system services and the APIs apps should use: systemd/journald, NetworkManager, PipeWire/WirePlumber, UPower, BlueZ, CUPS, UDisks2, AppArmor, Polkit, fwupd, PackageKit, snapd, AT-SPI.
  - When to use a service API directly, when to use a portal, and when to stay out of the system's way.
  - Ubuntu Pro for developers: ESM, Livepatch, FIPS/CIS, and how to degrade gracefully when Pro is absent.
  - Community and support entry points.
- Update existing pages with Ubuntu-specific links and guidance:
  - `start/choose-stack`: toolchain/source links and apt vs snap vs upstream guidance.
  - `platform/integration`: service map links and Ubuntu defaults.
  - `platform/packaging`: Ubuntu packaging guide, PPA, Snapcraft, Rockcraft, and App Center behavior.
  - `platform/security`: AppArmor, Polkit, fwupd, and Ubuntu Pro.
  - `design/accessibility`: Ubuntu accessibility stack and Orca/AT-SPI references.
  - `engineering/rust`: Ubuntu Rust toolchain documentation.
  - `reference/resources`, `reference/glossary`, and `reference/checklists`: Ubuntu docs and terminology.
- Add the new page to the Starlight sidebar.
- Keep the page English and consistent with the existing four-contract model.

## Capabilities

### New Capabilities

None. This is a documentation-content change; no application behavior or public API changes. The change opts out of spec deltas with `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- Markdown content under `src/content/docs/`.
- Sidebar configuration in `astro.config.mjs`.
- Pagefind search index and generated static site.
- No runtime code, build system, package metadata, or example-app behavior changes.
- External links add Ubuntu documentation and component-project domains; they must be checked for availability.
