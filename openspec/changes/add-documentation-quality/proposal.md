# Proposal

## Why

The guide explains how to build, test, package, and list a Linux desktop app, but not how to document it. User documentation is part of the shipped product: a user who cannot find out how to finish a task does not have that feature. In the EU, product documentation is also covered by accessibility requirements.

Today, documentation appears only as a line in the quality bar and a release-checklist item. Readers need a concrete structure, writing rules, and a review process they can cite, without turning the guide into a standards catalogue.

## What Changes

- Add `src/content/docs/ship/documentation.md`: task-based structure, plain language, in-app text, accessible formats, docs-as-code, review and testing, and a documentation release gate.
- Map the relevant standards to practical use: ISO/IEC/IEEE 26514, ISO 24495-1, ISO/IEC/IEEE 26513, IEC/IEEE 82079-1, ISO 9241-11, WCAG 2.2 AA, and EN 301 549 clause 12. Label Diátaxis as a structure model, not a standard.
- State clearly that the guidance aligns with the standards; it is not a certification.
- Add the page to the Ship sidebar.
- Link the page from the release checklist, the condensed checklists, the quality bar, the resources index, the accessibility legal checklist, and the AppStream release-notes section.
- Keep one canonical documentation checklist on the new page and link to it instead of duplicating it.
- Add `src/content/docs/reference/style-guide.md`: voice, page shape, sentence rules, terminology, code, links, screenshots, accessibility, localization, agent-facing writing, and a review checklist.
- Keep the platform glossary as the canonical terminology list; the style guide adds only the terms the guide uses precisely and links to the glossary.
- Add a feedback-and-ownership section to the documentation page: named roles, review triggers, the collect/triage/fix/verify loop, and an agent feedback protocol. The docs MCP server stays read-only.
- Add the style guide to the Reference sidebar and link it from the documentation page, the glossary, the condensed checklists, `AGENTS.md`, and `README.md`.

## Capabilities

### New Capabilities

None. This is a documentation-content change with no application behavior or public API changes. The change opts out of spec deltas with `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- `src/content/docs/ship/documentation.md`
- `src/content/docs/reference/style-guide.md`
- `astro.config.mjs`
- `src/content/docs/ship/release-checklist.md`
- `src/content/docs/ship/quality-bar.md`
- `src/content/docs/ship/appstream.md`
- `src/content/docs/design/accessibility.md`
- `src/content/docs/reference/checklists.md`
- `src/content/docs/reference/glossary.md`
- `src/content/docs/reference/resources.md`
- `AGENTS.md`
- `README.md`
- No runtime code, build system, package metadata, or example-app behavior changes.
