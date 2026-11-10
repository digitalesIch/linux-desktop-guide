# Tasks

## 1. Audit

- [x] 1.1 Capture the current landing page, a long content page, the Ubuntu page, the checklist page, the 404, and the search dialog in light and dark at 1440px and 390px; record the inconsistencies in the change notes.
- [x] 1.2 List every visual token in `src/styles/custom.css` that differs between cards, tables, asides, code, and search; decide the shared radius, border, surface, and shadow values.

## 2. Page header

- [x] 2.1 Create `src/components/PageTitle.astro` with a section eyebrow, the existing `h1` (`id="_top"`), and the frontmatter description as a lede; verify it renders on a content page and the title anchor still works.
- [x] 2.2 Add the component override to `astro.config.mjs` and verify the landing page (splash template) is unaffected.
- [x] 2.3 Map the six content sections to human labels and verify every content page shows the correct eyebrow; verify the 404 and pagefind pages do not render an incorrect label.

## 3. Landing page

- [x] 3.1 Add the platform-baseline row under the hero actions and verify it wraps cleanly at 390px, 768px, and 1440px.
- [x] 3.2 Replace the three text-glyph icons with inline SVG icons (standards, desktop/user, package) and verify they inherit light/dark colors and align with the card headings.
- [x] 3.3 Refine card spacing, borders, and hover states so the three feature cards, four contract cards, and four link cards share one material language; verify the landing page at 1440px and 390px.

## 4. Content surfaces

- [x] 4.1 Remove the full-width `h2` rule and introduce the shared section-spacing/accent treatment; verify long pages (`start/why-linux`, `platform/ubuntu`, `engineering/gtk`) remain easy to scan.
- [x] 4.2 Refine table, aside, blockquote, inline-code, and code-frame styling to the shared radius/border/surface tokens; verify light and dark mode.
- [x] 4.3 Style the search dialog and Pagefind results to match the palette (radius, borders, result hover, input focus); verify a search query renders readable results in both themes.
- [x] 4.4 Refine the sidebar active/hover states and table-of-contents spacing; verify keyboard focus remains visible and the active item is announced correctly.

## 5. Responsive and theme audit

- [x] 5.1 Check the landing, a content page, the Ubuntu page, the checklist page, the 404, and the search dialog at 390px, 768px, and 1440px; verify no horizontal overflow and no clipped ledes.
- [x] 5.2 Check the same pages in light and dark mode; verify contrast, border visibility, and icon tinting.
- [x] 5.3 Check reduced-motion, high-contrast, and zoom/text scaling at 200%; verify no layout breakage.

## 6. Verification and commit

- [x] 6.1 Run `npm run build` and verify all pages build and Pagefind indexes the site.
- [x] 6.2 Run Lighthouse on the landing page, a content page, and the checklist page; verify Accessibility, Best Practices, and SEO remain at 1.0 with no failures.
- [x] 6.3 Run the internal link/anchor checker and verify zero missing pages or anchors.
- [x] 6.4 Review the final diff for visual consistency, remove unused CSS, and verify `git diff --check` passes.
- [x] 6.5 Commit the design change on the `workspace` branch with an English commit message and verify `git status` is clean.

## Workflow follow-up

- Archive the change after review.
- Re-check the visual system at the next Starlight upgrade.
