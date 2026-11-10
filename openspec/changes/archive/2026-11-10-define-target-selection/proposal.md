# Proposal

## Why

The guide currently assumes Ubuntu 26.04 and GNOME. That is a useful reference, but it is not a target-selection method. A list of distro/desktop combinations chosen by preference would repeat the problem the guide is supposed to solve: Linux gives developers too many undifferentiated choices and no defensible default.

The target set must be derived from evidence. Popularity shows where users are; momentum shows where the ecosystem is going; developer experience and platform quality show whether a target is actually good to build on. A matrix that is not backed by those signals is arbitrary.

## What Changes

- Add a **How Targets Are Chosen** page:
  - selection criteria and weights;
  - evidence sources and confidence levels;
  - roles for targets (reference, validation, compatibility);
  - coverage constraints;
  - review cadence and removal rules.
- Add a **Platform Targets** page with the resulting matrix. Each target records:
  - distribution, release, support window, desktop, toolkit, HIG;
  - Wayland, portals, Flatpak/AppStream, accessibility;
  - primary and secondary distribution channels;
  - a reproducible development environment;
  - quality gates and non-goals;
  - last validated date and sources.
- Add per-target pages for the selected reference targets.
- Add `src/data/targets.json` and `check:targets` so the matrix is structured, source-backed, and validated by the documentation gate.
- Reframe `start/choose-stack` as **choose a target first, then a stack**.
- Update the homepage, README, AGENTS, sidebar, and `reference/baseline` to the target model.
- Keep Ubuntu/GNOME as the first validated target, not as the whole guide.

## Capabilities

### Modified Capabilities

- `docs-content`: target selection becomes evidence-based, dated, and explicit about confidence and coverage.

## Impact

- New `targets/` content section.
- New target data or an extended baseline.
- Sidebar, homepage, README, AGENTS, `start/choose-stack`, `reference/baseline`.
- No change to the existing platform, design, engineering, or ship chapters beyond cross-links.
- The final matrix is deliberately not fixed in this proposal; it is an output of the evidence and scoring work.
