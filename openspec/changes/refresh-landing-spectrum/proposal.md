# Proposal

## Why

The current warm-paper/graphite palette is competent but reads as a conventional documentation theme. The landing page should feel like a modern developer platform: fresh, kinetic, and memorable. The brief is explicitly visual, but without generated imagery or paid services.

## What Changes

- Replace the warm paper/orange palette with a **Spectrum** system: deep ink-green surfaces, acid lime, and cyan. Light mode uses a cool ivory/green palette.
- Turn the landing hero into a dark stage with animated aurora gradients, a faint grid, a pointer-following spotlight, and a floating app mockup.
- Add a restrained standards ticker below the hero.
- Rebuild the three feature cards as an asymmetric bento with a wide “Standards” feature and two tinted supporting cards.
- Add pointer-reactive spotlight surfaces to cards and links, plus scroll-reveal for landing sections.
- Refresh the logo, favicon, and app mockup accents to the new palette.
- Keep documentation pages readable, calm, and accessible; the effects are limited to the landing page.

## Capabilities

### New Capabilities

None. This is a visual-only documentation change with no application behavior changes. The change opts out of spec deltas with `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- `src/styles/custom.css`
- `src/content/docs/index.mdx`
- `src/components/LandingFX.astro` (new)
- `src/assets/mark.svg`, `public/favicon.svg`, `public/hero-window.svg`
- No routes, content meaning, dependencies, or example-app changes.
