# Proposal

## Why

The content is now consolidated and authoritative, but the visual system has not kept pace. Page titles lack a section context and a short description, several landing cards still use text glyphs instead of a consistent icon set, content headings are separated by heavy rules, and tables, asides, and search surfaces do not share the same material language. The result reads as a strong guide with a theme, rather than a designed developer portal.

## What Changes

- Add a custom page header that shows the section, the page title, and the frontmatter description as a lede.
- Replace the landing page's text-glyph icons with a small, consistent SVG icon set.
- Remove the full-width rule above every `h2`; use spacing, scale, and a small accent marker for hierarchy instead.
- Refine the hero with a compact platform-baseline row and stronger editorial spacing.
- Give cards, tables, asides, code frames, and the search dialog one consistent radius, border, and surface treatment.
- Tighten the sidebar, active item, TOC, and mobile header.
- Audit light, dark, and mobile states and keep Lighthouse at 1.0.

## Capabilities

### New Capabilities

None. This is a visual-only documentation change with no application behavior or public API changes. The change opts out of spec deltas with `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- `src/styles/custom.css`
- A new `src/components/PageTitle.astro` override
- `astro.config.mjs` component configuration
- `src/content/docs/index.mdx` hero and card markup
- No content meaning, routes, build system, or example-app behavior changes.
