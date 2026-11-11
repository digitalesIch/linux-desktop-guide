# Design

## Context

See `proposal.md` for the motivation. The Native Standard already defines ten app-quality rules. The Quality Bar adds seven scored dimensions, but its score bands can be read as readiness labels even when an essential behavior fails. The README calls the GTK sample a complete reference implementation, while its own README identifies missing product functionality.

The Fedora profile calls the Qt chapter a complete starting project, while the chapter labels its project illustrative. This is an observed reason to strengthen completion claims, not evidence that Fedora is now verified. The existing `docs-content` requirements for runnable examples and complete stack chapters remain in force; the new requirements add an end-to-end teaching contract rather than replacing them.

The repository has no `docs/agents/verification.md`. Use the verification commands documented in `AGENTS.md`; do not create a verification subsystem in this content change. The active `harden-public-delivery` change belongs to the structure session and must remain separate.

## Goals / Non-Goals

**Goals:**

- Give readers and maintainers one stable statement of purpose in an existing public page.
- Distinguish desired outcomes, present coverage, and actual verification.
- Keep quality scoring useful without allowing it to override mandatory criteria.
- Preserve the current targets, navigation, and Fedora-first content priority.

**Non-Goals:**

- Completing the Fedora implementation, building an RPM, or adding a new tutorial or reference app in this change.
- Changing target roles, package versions, dependencies, metadata schemas, or site automation.
- Introducing a showcase, award system, business guide, or separate goal document.

## Decisions

### 1. Canonical purpose in the Native Standard

Add a short `Purpose of the guide` section before the ten existing rules, preserving their headings and anchors. Its intended wording is:

> This guide gives developers a curated, evidence-backed path to high-quality apps for a defined set of Linux desktop targets. It explains how the parts work together, from the first useful task to an installable, safely updatable release. Apps should be straightforward to use, accessible, responsive, protective of user data, and maintainable over time.

Explain that this is the standard the guide works toward, not a claim that every current path has passed it. Link the detailed mandatory criteria to the Quality Bar. A new goals page would duplicate an existing entry point and require navigation changes.

### 2. Detailed criteria in the Quality Bar

Add release criteria before the scoring guidance: data preservation and recovery, accessible core tasks, justified permissions with denial handling, and working supported installation and update paths. A failure or missing evidence prevents a release-ready claim; unrelated scores cannot compensate.

Keep numerical scores as diagnostic summaries, not certifications. Adjust the score-band and binary-native wording so neither bypasses the mandatory criteria. Optional media controls, background services, extra package formats, and other unrelated integrations do not become universal requirements.

### 3. Short maintainer pointers instead of another manifesto

Update the README introduction and link to the canonical purpose. Describe `examples/notes` as a minimal teaching example rather than a fully demonstrated production-quality app. Add a concise `AGENTS.md` pointer that triggers before adding content, claiming a path complete, or assessing release readiness; keep detailed rules in the public pages.

Preserve the developer-only, Linux-first scope: no business or market guidance, app competition, or unsupported target expansion. Record Fedora KDE as the current content priority in the change, not as a permanent platform policy in `AGENTS.md`.

### 4. Verification claims describe evidence, not a new schema

Use plain prose to identify whether something is illustrative, checked against upstream sources, build-tested, or runtime-tested, with the relevant target, date, and scope. Do not introduce another status registry. Website build, link, or Lighthouse results are evidence about the documentation site, not the documented apps.

## Risks / Trade-offs

- **Aspirations mistaken for completed work** → Explicitly separate the goal from present coverage and retain unverified labels until checks are performed.
- **Duplicated goals drift** → Native Standard owns the purpose; Quality Bar owns app readiness criteria; README and AGENTS use short summaries and pointers.
- **Another universal feature checklist** → Assess the core task and applicable integrations; a single well-maintained release channel is sufficient when that is the declared support scope.
- **New rules interpreted as website implementation work** → Keep deployment, tooling, and `harden-public-delivery` untouched. These are editorial acceptance rules, not new automated gates.

## Migration Plan

Apply the goal and readiness wording to the existing pages and maintainer entry points, then run the established documentation checks. No route or schema migration is needed. Review the rendered headings and cross-links; rollback, if required, is limited to these prose changes. Resume Fedora content work against the clarified criteria without declaring that work complete through this goals update.
