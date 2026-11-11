# Tasks

## 1. Public purpose and development-path goals

- [x] 1.1 Add the canonical purpose and success criteria to `src/content/docs/start/native-standard.md`, preserving the ten rule headings and anchors; verify the text connects setup, a useful core task, data preservation, integration, packaging, installation, and updates without claiming every current path is verified.
- [x] 1.2 Explain outcome-based teaching and verification limits in the same page, including applicable integrations, distinct host/SDK/runtime scopes, and primary-HIG versus fallback behavior; verify it links to the existing target matrix and Quality Bar and introduces no new target or required optional feature.

## 2. App readiness versus quality scores

- [x] 2.1 Add mandatory release criteria to `src/content/docs/ship/quality-bar.md` for data preservation, accessible core tasks, justified permissions with denial handling, and supported installation/update paths; verify a high-scoring app that loses user data is explicitly not release-ready.
- [x] 2.2 Reconcile the score-band, distribution-level, and binary-native wording with those criteria; verify scores remain advisory, missing evidence is visible, and a single well-maintained supported channel is not penalized merely for lacking additional formats.

## 3. Maintainer entry points

- [x] 3.1 Update the README purpose and link to the canonical goal section, replacing the unqualified complete-reference-implementation claim with the teaching example's actual scope; verify the summary agrees with the Native Standard and the sample README without changing deployment instructions.
- [x] 3.2 Add concise pointers in `AGENTS.md` for content additions, completeness claims, and release-readiness reviews; verify they reach the canonical public rules, preserve developer-only/Linux-first scope, and do not duplicate the detailed goals or alter structure-session responsibilities.

## 4. Integrated content verification

- [x] 4.1 Run `npm run check:docs` and `npm run check:quality -- --no-build`; verify the existing gates pass and describe their results as website checks, not app-validation evidence.
- [x] 4.2 Review the rendered Native Standard and Quality Bar and the README/AGENTS pointers; verify mission versus current status, non-compensable failures, stable anchors, and target boundaries are clear, with no claim that Fedora is complete through this change.
- [x] 4.3 Run `openspec validate define-verified-development-goals --strict` and review the diff; verify only the planned prose, contributor instructions, and change artifacts are touched and `harden-public-delivery` remains separate.

## Workflow follow-up

- Apply this change only after the planning artifacts are reviewed and the user requests application.
- Archive after implementation and verification, synchronizing the `docs-content` delta through the established archive workflow.
- Resume the existing Fedora KDE work against the clarified goals; keep the remaining examples and runtime checks open until their own evidence exists.
