# Tasks

## 1. Evidence

- [x] 1.1 Collect release, support, developer-environment, platform-quality, adoption, and momentum evidence for the candidate distributions and desktops.
- [x] 1.2 Record a source URL, check date, confidence, and limitation for every metric.
- [x] 1.3 Mark missing data as unverified; do not estimate.

## 2. Selection

- [x] 2.1 Score the candidates against the published criteria.
- [x] 2.2 Apply the coverage constraints and assign reference, validation, or compatibility roles.
- [x] 2.3 Record the rationale and the evidence for every selected target.
- [x] 2.4 Decide the final matrix and review date.

## 3. Pages

- [x] 3.1 Add `targets/selection.md` with the criteria, weights, sources, and review process.
- [x] 3.2 Add `targets/index.md` with the matrix, roles, and rationale.
- [x] 3.3 Add one page per reference target with the development environment spec and quality gates.
- [x] 3.4 Reframe `start/choose-stack` as choose target first, then stack.
- [x] 3.5 Update `reference/baseline` and the sidebar.
- [x] 3.6 Add `src/data/targets.json` and `scripts/check-targets.mjs`; include the check in `check:docs`.
- [x] 3.7 Include the targets section in the docs MCP and generated agent docs.

## 4. Integration

- [x] 4.1 Update the homepage, README, and AGENTS to the target model.
- [x] 4.2 Add cross-links from the platform, design, engineering, and ship chapters.
- [x] 4.3 Decide whether target data belongs in `baseline.json` or a separate data file.

## 5. Verification

- [x] 5.1 Run `npm run check:docs`.
- [x] 5.2 Run `npm run check:quality`.
- [x] 5.3 Validate every source link and target claim.
- [x] 5.4 Commit, merge to `main`, and archive the change.
