# Proposal

## Why

The guide names the right quality attributes, but topic coverage and illustrative snippets can still be mistaken for a complete development path. Its goals need to make the promised outcome explicit: developers can follow a coherent, evidence-backed route to an accessible, responsive, reliable, deeply integrated app that preserves user data through installation, use, failure, and updates.

## What Changes

- Make `start/native-standard.md` the canonical public statement of the guide's purpose and success criteria; link to it from `README.md` and contributor instructions.
- Define success by demonstrated user tasks, not page counts, API lists, or the number of packaging channels.
- Require each reference path to connect project setup, a useful core task, persistence and recovery, desktop integration, packaging, installation, and updates. Distinguish this goal from what has actually been verified today.
- Make compatible examples, manifests, dependencies, and app identifiers part of that path; mark illustrative, source-reviewed, build-tested, and runtime-tested material honestly.
- Separate mandatory release criteria from quality scores: data loss, inaccessible core tasks, unsafe permissions, or broken installation and updates cannot be compensated by unrelated strengths.
- Keep optional capabilities conditional on the app's purpose. Shared Linux standards do not imply identical GNOME and KDE interfaces or support for every derivative.
- Preserve the selected target matrix and developer-only scope. Finish the Fedora KDE path before broadening content; this goal update does not implement the remaining Fedora examples or validation.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `docs-content`: establish outcome-based guide goals, explicit verification claims, and non-compensable release criteria alongside the existing target and example requirements.

## Impact

- `src/content/docs/start/native-standard.md`
- `src/content/docs/ship/quality-bar.md`
- `README.md`
- `AGENTS.md`
- `openspec/specs/docs-content/spec.md` through the change delta

No new route, target, showcase, business guidance, implementation example, website component, workflow, deployment setting, or automated gate is introduced. Content owns the teaching contract; the structure session continues to own site infrastructure and automation.
