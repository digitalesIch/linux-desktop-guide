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
