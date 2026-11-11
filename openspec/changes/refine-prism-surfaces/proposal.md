# Proposal

## Why

The light theme still reads as yellow paper, while the global cursor glow and rainbow-filled logo compete with documentation. The user requests pure white, localized effects, and quieter branding.

## What Changes

- Use white light-theme backgrounds and neutral gray secondary surfaces.
- Clip pointer-following effects to the hero and cards; remove the global overlay.
- Keep the logo predominantly monochrome with only a small spectrum detail, and render the site title in the theme's neutral text color.
- Align the landing rhythm: more header breathing room, matched card edges, shared metric baselines, bottom-aligned step links, and a distinct agent panel.
- Align PWA assets and metadata with the white theme while retaining dark mode.

## Capabilities

### New Capabilities

- `site-appearance`: Neutral theme surfaces, restrained branding, and localized decorative pointer effects.

### Modified Capabilities

None.

## Impact

Styles, LandingFX, logo/favicon/generated icons, theme metadata, manifest, offline page, cache version, and README tokens. No content edits, new dependencies, or hosting changes. Existing uncommitted work is partially implementing this request and needs verification; concurrent content-session changes are out of scope.
