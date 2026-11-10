# Tasks

## 1. Baseline data

- [x] 1.1 Create `src/data/baseline.json` with validated Ubuntu, desktop, Qt/KDE, packaging, site, and review fields; verify it parses with `node -e`.
- [x] 1.2 Add `scripts/check-baseline.mjs` and a `check:baseline` package script; verify it fails on a missing key and passes on the real file.

## 2. Baseline page

- [x] 2.1 Create `src/content/docs/reference/baseline.mdx` importing the JSON and rendering the validated table, support window, baseline-vs-minimum section, review date, sources, and update instructions; verify it renders at `/reference/baseline/`.
- [x] 2.2 Add the page to the Reference sidebar before Checklists and verify the built navigation.
- [x] 2.3 Verify the page uses one H1, the PageTitle section eyebrow reads “Reference”, and Pagefind indexes the page.

## 3. Consolidation

- [x] 3.1 Replace the “Versions to target in 2026” table in `start/choose-stack.md` with a short baseline link; verify no duplicate exact-version table remains there.
- [x] 3.2 Add baseline links to `platform/ubuntu.md`, `engineering/gtk.md`, and `engineering/qt.md`; verify the surrounding text still reads correctly.
- [x] 3.3 Update the README structure to include `src/data` and `scripts/`; verify the tree still matches the repository.

## 4. Verification and commit

- [x] 4.1 Run `npm run check:baseline`, `npm run build`, and verify all pages build and Pagefind indexes the new page.
- [x] 4.2 Run the internal link/anchor checker and verify zero errors.
- [x] 4.3 Run Lighthouse on `/reference/baseline/` and `/start/choose-stack/`; verify Accessibility, Best Practices, and SEO remain at 1.0.
- [x] 4.4 Review the diff for duplicate version tables outside `baseline.json` (feature-specific references such as “GTK 4.22 adds GtkSvg” are allowed if they link to Baseline), verify `git diff --check`, and commit on `workspace` with an English message.

## Workflow follow-up

- Archive the change after review.
- Implement the docs MCP server next, reading `src/data/baseline.json`.
