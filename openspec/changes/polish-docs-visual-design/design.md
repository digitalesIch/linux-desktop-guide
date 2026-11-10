# Design

## Context

See `proposal.md` for motivation. The site is built with Astro Starlight and a custom warm-paper/graphite theme: Space Grotesk display type, Inter body text, JetBrains Mono code, and an Ubuntu-adjacent orange accent. The landing page already has a strong editorial hero and card grid. Content pages inherit Starlight's default page title, which renders only the frontmatter title; the description is unused. Starlight's default `h2` treatment in this project adds a full-width rule above every section, which makes long pages feel segmented and bureaucratic.

Apple Developer and elementary Developer Docs were used as references for clarity and structure, not as visual templates. Apple's strength is editorial hierarchy and restraint. elementary's strength is friendly, approachable cards and clear paths. The result should remain recognizably this guide: warm, technical, calm, and direct.

## Audit

Captured at 1440px and 390px in light and dark mode:

- Page titles had no section context and ignored the frontmatter description.
- Every `h2` carried a full-width rule, segmenting long pages.
- Landing cards used text glyphs (`◎`, `◈`, `⬡`) instead of a consistent icon set.
- Note asides used the default blue surface, the only cool color in the system.
- Cards, code frames, and asides used three different radii.
- The search dialog used the default full-screen treatment and default Pagefind colors.
- The mobile baseline row wrapped with a leading separator dot.

## Goals / Non-Goals

**Goals:**

- Make every page open with a clear context, title, and one-sentence promise.
- Create one material language for cards, tables, asides, code, and search.
- Improve scanning through type scale, spacing, and contrast rather than rules and boxes.
- Keep the existing palette and fonts; refine, do not replace.
- Keep light, dark, and mobile states consistent.

**Non-Goals:**

- Copying Apple's or elementary's layout, colors, or components.
- Adding new navigation sections, illustrations, or stock imagery.
- Changing content meaning, routes, or the example app.
- Adding a heavy JavaScript animation layer.

## Decisions

### 1. Page header with section, title, and description

Override Starlight's `PageTitle` component. Read the section from `Astro.locals.starlightRoute.entry.slug`, map it to a human label (`Start Here`, `Platform`, `Design`, `Engineering`, `Ship`, `Reference`), and render:

- a small uppercase section eyebrow with an accent dot;
- the existing `h1` with the `_top` id;
- the frontmatter description as a muted lede (max 65ch).

This uses content that already exists, adds context on every page, and makes the title area feel authored rather than templated.

### 2. One icon family for landing cards

Replace the characters `◎`, `◈`, and `⬡` with inline SVGs: layered standards, a person/desktop, and a package. Keep them line-based, 20–24 px, `currentColor`, and inside the existing tinted square. Reuse the same visual weight across the four contract cards and link cards.

### 3. Hierarchy without rules

Remove the full-width `border-top` from `h2`. Use a larger top margin, a slightly smaller heading scale, and a short 2rem accent line (or a small accent dot) only where a section break needs emphasis. This reduces visual noise on long pages and matches the editorial feel of the landing page.

### 4. Consistent material language

Use the same tokens everywhere:

- radius: 12px for cards and dialogs, 8px for small controls, 6px for inline code;
- border: 1px hairline, accent border only on hover/active;
- surface: subtle vertical gradient from `--sl-color-gray-7` to background, not flat blocks;
- shadow: one soft elevation for popovers/search, none for content cards.

Tables get a rounded outer border, a quieter header, and no zebra striping unless it improves a dense comparison. Asides use the accent tint and the same radius as cards. Code frames keep their theme but adopt the shared radius and border.

### 5. Hero with a platform baseline

Add a compact row of metadata under the hero actions: `Ubuntu 26.04 LTS`, `GNOME 50`, `GTK 4.22`, `Wayland`, `Flatpak`. Use small mono labels separated by dots, not badges with heavy borders. This gives the page developer credibility without turning it into a marketing hero.

### 6. Sidebar and TOC refinement

- Keep the uppercase mono group labels but add a little more spacing above each group.
- Active item: accent left bar + tinted background; no heavy pill.
- Hover: subtle surface, no color jump.
- TOC: smaller labels, accent for the active section, a quiet vertical rule.
- Mobile header: keep the logo and search; ensure the menu button has a clear 44px target.

### 7. Test the system, not just the page

Check the landing, a long content page, the Ubuntu page, the checklist page, the 404, and the search dialog in light, dark, and at 390px width. Use Lighthouse for accessibility and best practices, and a visual diff for spacing regressions.

## Risks / Trade-offs

- **Description ledes add vertical space** → Cap them at two lines on mobile and keep them out of splash pages.
- **Removing h2 rules reduces separation** → Compensate with more whitespace and a clear type scale; verify on long pages.
- **SVG icons add markup** → Keep them inline and small; no icon package dependency.
- **Dark-mode contrast** → Test every new surface against both themes and high contrast.
- **Starlight updates** → The only override is `PageTitle`, which is intentionally small and easy to maintain.
- **Over-designing** → Keep the existing palette and type; the change is refinement, not a rebrand.

## Migration Plan

No migration. Visual-only change with a normal revert path.

## Open Questions

None.
