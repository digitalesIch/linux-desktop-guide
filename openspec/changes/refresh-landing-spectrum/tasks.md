# Tasks

## 1. Palette and assets

- [x] 1.1 Replace the dark/light color tokens in `src/styles/custom.css` with the Spectrum palette; verify body text, links, and table contrast in both themes.
- [x] 1.2 Update `src/assets/mark.svg`, `public/favicon.svg`, and `public/hero-window.svg` to lime/cyan accents; verify no old orange accent remains.
- [x] 1.3 Update the hero stage, buttons, links, focus rings, and selection color; verify light/dark/mobile.

## 2. Hero and landing structure

- [x] 2.1 Shorten the hero tagline and rebuild the hero as a rounded dark stage with aurora blobs, grid, spotlight, floating mockup, and compact baseline chips; verify 390px, 768px, and 1440px.
- [x] 2.2 Replace the three equal feature cards with the asymmetric bento (wide standards card + two tinted cards) and verify no empty grid cells at any breakpoint.
- [x] 2.3 Add the standards ticker below the hero and verify it pauses on hover, is hidden from assistive tech, and becomes static under reduced motion.
- [x] 2.4 Turn the quote section into a distinct gradient panel; verify contrast and mobile layout.

## 3. Motion and pointer interaction

- [x] 3.1 Add `src/components/LandingFX.astro` with pointer spotlight, hero tilt, card spotlight, cursor glow, and IntersectionObserver reveals; verify no scroll listeners and no layout thrash.
- [x] 3.2 Add CSS keyframes for aurora drift, floating mockup, ticker, and reveal; verify all are disabled under `prefers-reduced-motion`.
- [x] 3.3 Verify pointer effects only run on fine pointers and do not fire on touch devices.

## 4. Verification

- [x] 4.1 Run `npm run build` and verify all pages, agent docs, and Pagefind build.
- [x] 4.2 Run Lighthouse on `/`, `/start/why-linux/`, and `/engineering/gtk/`; verify Accessibility, Best Practices, and SEO remain at 1.0.
- [x] 4.3 Run the internal link/anchor checker and verify zero errors.
- [x] 4.4 Check light/dark, 390/768/1440, reduced motion, 200% text, and keyboard focus; verify no horizontal overflow or clipped CTAs.
- [x] 4.5 Review the diff, remove dead CSS, verify `git diff --check`, and commit on `workspace` with an English message.

## Workflow follow-up

- Archive the change after review.
