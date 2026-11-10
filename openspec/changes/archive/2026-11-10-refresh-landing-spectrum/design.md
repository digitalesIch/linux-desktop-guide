# Design

## Context

See `proposal.md`. The site uses Starlight with a custom warm-paper theme and a dark app mockup. The landing page is already editorial, but its palette is conservative and the page is static after load. The documentation pages should remain low-glare and readable; the expressive layer belongs on the landing page.

## Goals / Non-Goals

**Goals:**

- A fresh, distinctive palette that is not the default AI purple or the old warm paper.
- A hero that feels alive on first load and responds to the pointer on desktop.
- Motion that is motivated: hierarchy, feedback, and depth.
- A consistent system across hero, cards, ticker, quote, and documentation chrome.
- Full light/dark parity, reduced-motion support, and Lighthouse 1.0.

**Non-Goals:**

- Generated images or external media.
- Scroll hijacking, heavy WebGL, or a JavaScript animation library.
- Changing content, routes, or the docs page structure.
- Applying the full kinetic treatment to reference pages.

## Decisions

### 1. Spectrum palette

Dark mode:

- Ink base `#060b09`, elevated `#0d1712`
- Acid lime accent `#c6ff3d`
- Cyan secondary `#5eead4`
- Mint text `#eafff4`, muted `#a7c4b6`

Light mode:

- Cool ivory `#f6f9f2`, elevated `#eef4e9`
- Deep green accent `#3f7d20`, cyan used only in decorative gradients
- Ink `#101815`, muted `#4b6156`

Lime is the single interactive accent. Cyan is a gradient/secondary decoration, not a second button color. Amber/red remain semantic.

### 2. Dark hero stage on both themes

The hero is a rounded dark stage with a 28px radius, aurora blobs, a fine grid, and a pointer spotlight. It is intentionally darker than the page in light mode: a deliberate color block, not a theme inversion of the whole page.

### 3. Pointer-reactive layering

A small landing-only script sets CSS variables:

- `--mx`, `--my` on `.hero` for the spotlight and grid shift.
- `--card-x`, `--card-y` on cards for a soft radial highlight.
- A fixed, low-opacity cursor glow on fine pointers.
- A gentle 3D tilt on the hero mockup.

All effects are disabled under `prefers-reduced-motion` and on coarse pointers. They use `transform`, `opacity`, and CSS variables only.

### 4. Asymmetric bento instead of three equal cards

The three “Linux difference” cards become:

- a wide feature card spanning two rows, containing the standards copy plus a cluster of contract chips;
- two smaller tinted cards stacked beside it.

At narrow widths the grid collapses to one column; no empty cells.

### 5. Standards ticker

A single `aria-hidden` marquee of `WAYLAND · XDG · D-BUS · APPSTREAM · PORTALS · FLATPAK` sits below the hero. It pauses on hover and becomes a static wrapped row under reduced motion. One marquee per page.

### 6. Motion budget

- Hero aurora: slow 18s drift, disabled by reduced motion.
- Hero art: 7s float, disabled by reduced motion.
- Scroll reveal: 400ms opacity/translate, once per element.
- Card spotlight: pointer only, no infinite loop.
- No `window` scroll listeners; use IntersectionObserver.

### 7. Readability guardrails

- Documentation pages keep the same content width and spacing.
- The new palette must pass WCAG AA for body text and links in both themes.
- The hero stage uses its own light-on-dark tokens; it does not rely on theme variables for text.
- Lighthouse remains at 1.0 on the landing page and representative content pages.

## Risks / Trade-offs

- **Effects distract from reading** → Limit them to the landing page; keep content pages static.
- **Performance** → CSS gradients and transforms only; one small IntersectionObserver script; no canvas/WebGL.
- **Light-mode contrast** → Use deep green for links, not lime; test both themes.
- **Motion sickness** → Honor reduced motion and disable pointer tilt on coarse pointers.
- **SVG asset mismatch** → Update logo, favicon, and hero mockup in one pass; grep for old orange values.
