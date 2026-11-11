# Tasks

## 1. Neutral surfaces and branding

- [x] 1.1 Replace remaining warm light-theme color values with white and neutral gray tokens, and verify computed page, navigation, sidebar, and inline-code backgrounds are neutral in light mode
- [x] 1.2 Remove page-wide color washes from the offline page's light appearance and verify its computed background is white
- [x] 1.3 Confirm the simplified logo, favicon, and site-title colors are monochrome-led, and verify the title resolves to neutral theme text in light and dark mode, including hover

## 2. Localized pointer decoration

- [x] 2.1 Keep pointer-following glow only inside the hero, cards, link cards, and contract links, and verify no fixed page-level glow element or effect remains
- [x] 2.2 Remove hero artwork tilt so decoration is limited to color and foil, and verify the hero still responds to pointer position without moving content
- [x] 2.3 Verify reduced-motion mode disables pointer tracking, shimmer, ticker, and reveal transitions while keeping all content visible

## 3. PWA and asset coherence

- [x] 3.1 Regenerate favicon and PWA icons from the simplified logo and verify the generated files exist at the expected sizes
- [x] 3.2 Align theme-color, manifest colors, and offline theme metadata with the white light theme, then verify `npm run check:pwa` passes
- [x] 3.3 Bump the service-worker cache version and verify the offline shell and updated assets are served by `npm run build`

## 4. Integration verification

- [x] 4.1 Build the site and verify `npm run check:docs` passes without editing generated output
- [x] 4.2 Capture light and dark screenshots at desktop and mobile widths and verify hero, cards, articles, and header in a local production preview
- [x] 4.3 Run `npm run check:quality -- --no-build` and record observed Lighthouse scores without weakening thresholds
- [x] 4.4 Stage only the design, asset, and OpenSpec files for this change, leaving concurrent content edits unstaged, and verify the staged diff before committing

## 5. Landing layout polish

- [x] 5.1 Increase the desktop nav height and padding, then verify the search control keeps a 17 px gap above the header hairline at a 2816 px viewport
- [x] 5.2 Reset inherited top margins on the ticker sets and verify both marquee copies start on the same line
- [x] 5.3 Reset inherited top margins on grid children and verify both feature-card grids align the paired cards with the feature card's top and bottom edges
- [x] 5.4 Reset inherited top margins on metric items and verify both metric headings share a row baseline
- [x] 5.5 Push step links to the bottom of their columns with auto margins and verify all three links share the same top edge
- [x] 5.6 Present the agent section as a bordered panel with a spectrum edge and primary CTA, and verify it in light, dark, and mobile screenshots
- [x] 5.7 Run `npm run check:docs`, `npm run check:pwa`, and `npm run check:quality -- --no-build`, and verify the deployed page after the Pages workflow completes

## 6. Landing noise and spacing follow-up

- [x] 6.1 Raise the desktop nav height and padding to leave a 20 px gap between the search control and the header hairline, then verify at a 2816 px viewport
- [x] 6.2 Remove the standards ticker markup, styles, and pause behavior, and verify the target chips remain as the only target list
- [x] 6.3 Add a left gutter to step columns after the first and verify text clears the divider line while mobile stacking still works
- [x] 6.4 Add the pointer-local glow to the agent panel and verify it tracks the pointer without covering text
- [x] 6.5 Remove the fabricated quote section and its unused styles, including the stale 404 section class
- [x] 6.6 Bump the service-worker cache version so updated layout styles and removed sections replace cached copies, and verify `dist/sw.js`
- [x] 6.7 Run `npm run check:docs`, `npm run check:pwa`, and `npm run check:quality -- --no-build`, then verify the deployed page after the Pages workflow completes


## 7. Search spacing and hero shadow

- [x] 7.1 Raise the desktop nav to 5.5rem with 1.5rem vertical padding and verify a 24 px gap below the search control at 800 px and 2816 px viewports
- [x] 7.2 Remove the CSS drop shadow and the SVG window shadow and green backdrop glow, then verify the hero illustration in light and dark
- [x] 7.3 Bump the service-worker cache version so the updated header spacing and hero artwork replace cached copies
- [x] 7.4 Run `npm run check:docs`, `npm run check:pwa`, and `npm run check:quality -- --no-build`, then verify the deployed page after the Pages workflow completes
