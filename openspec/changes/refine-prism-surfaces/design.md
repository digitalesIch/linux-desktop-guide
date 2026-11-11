# Design

## Context

See proposal.md for motivation. The existing Starlight CSS provides theme tokens, masked card borders, and pointer-position variables. Uncommitted changes already replace warm light tokens, remove the global overlay, and simplify SVG branding. LandingFX still rotates hero artwork. Offline CSS still contains page-wide color washes. The verification document requested by global instructions does not exist; package.json and AGENTS.md define the available gates.

## Goals / Non-Goals

**Goals:** Reuse existing component boundaries and CSS variables; keep GitHub Pages and PWA assets coherent; verify both themes rather than infer contrast.

**Non-Goals:** Content changes, typography overhaul, additional animation libraries, remote services, or new tilt behavior.

## Decisions

- Set light reading surfaces to white and secondary surfaces to neutral grays instead of recoloring a warm gradient. Remove offline light-mode background washes too.
- Remove the fixed overlay rather than conditionally hiding it. Keep local pseudo-elements inside component bounds; use overflow clipping where needed and keep text above decoration.
- Reuse local pointer handlers for cards and hero. Suppress pointer-tracking decoration under reduced motion and avoid adding tilt; remove legacy hero rotation to match the approved foil-only direction.
- Use neutral title colors in both normal and hover states. Generate favicon and PWA icons from the simplified SVG, retaining a small spectrum separator rather than a rainbow-filled tile.
- Bump the service-worker cache version after shell changes. Preserve base-aware routes and existing PWA behavior.
- Keep the target chips as the single target signal: remove the decorative ticker and fabricated quote panel, and add the same pointer-local glow to the agent panel.
- Reset Starlight's adjacent-sibling `margin-top` inside the grid, bar, and metric containers rather than counter-offsetting individual cards. Increase the desktop nav height so the search field clears the hairline, give step columns a left gutter, align step links with auto margins, and present agent access as a bordered panel with a spectrum edge and a primary CTA.

## Risks / Trade-offs

- White surfaces reduce visual card separation → retain subtle neutral borders and shadows.
- Header styles can lose to upstream specificity → verify computed colors, including hover.
- Concurrent content edits can enter a commit accidentally → stage only inspected design files and this change's artifacts.
- Local performance scores can be noisy under load → report actual results without weakening thresholds.

## Migration Plan

Complete and verify existing uncommitted design edits, capture light/dark desktop/mobile previews, and obtain visual review before publication. Rollback only this change's files through a dedicated revert; never discard concurrent work.
