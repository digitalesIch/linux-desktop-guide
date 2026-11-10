# Tasks

## 1. Quality script

- [x] 1.1 Add `scripts/check-quality.mjs` with a loopback static server for `dist/`.
- [x] 1.2 Launch Chrome and run Lighthouse on five representative pages.
- [x] 1.3 Enforce accessibility, best practices, and SEO at 100 and performance at 90.
- [x] 1.4 Print a score table and actionable failing audits; close Chrome and the server in `finally`.

## 2. Integration

- [x] 2.1 Add `lighthouse` and `chrome-launcher` as dev dependencies.
- [x] 2.2 Add the `check:quality` npm script.
- [x] 2.3 Add explicit dimensions to the hero image.
- [x] 2.4 Document the gate and `--no-build` in `README.md` and `AGENTS.md`.

## 3. Verification

- [x] 3.1 Run `npm run check:quality` and confirm all five pages pass.
- [x] 3.2 Run `npm run check:quality -- --no-build` and confirm reuse works.
- [x] 3.3 Run `npm run check:docs` and confirm the offline gate is unaffected.
- [x] 3.4 Run `git diff --check`, commit on `workspace`, and merge to `main`.

## Workflow follow-up

- Archive the change after review.
