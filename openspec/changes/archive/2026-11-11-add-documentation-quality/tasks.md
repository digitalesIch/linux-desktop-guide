# Tasks

## 1. Add the page

- [x] 1.1 Create `src/content/docs/ship/documentation.md` with frontmatter and a one-paragraph statement that documentation is part of the product; verify the page has no H1 in the body.
- [x] 1.2 Add sections for user needs, the four documentation kinds, the standards table, task-based writing, in-app text, accessible documentation, docs-as-code, review and testing, a documentation gate, and sources; verify every `##` heading answers one question.
- [x] 1.3 State that the guidance is aligned with the standards but is not a certification; verify the wording does not claim conformity.
- [x] 1.4 Use the current editions and canonical links for ISO/IEC/IEEE 26514:2022, ISO 24495-1:2023, ISO/IEC/IEEE 26513:2017, IEC/IEEE 82079-1:2019, ISO 9241-11:2018, WCAG 2.2, EN 301 549 V4.1.1, and Diátaxis; verify each link resolves.

## 2. Integrate with the guide

- [x] 2.1 Add `{ label: 'User Documentation', slug: 'ship/documentation' }` to the Ship sidebar in `astro.config.mjs`; verify the page appears in navigation.
- [x] 2.2 Add a `### Documentation` block to the quality gates in `ship/release-checklist.md` with task pages, tested steps, release notes, accessible format, links, and a review record; verify it links to the new page.
- [x] 2.3 Add a `## Documentation` section to `reference/checklists.md` with the condensed ten-item gate; verify it links to the canonical checklist.
- [x] 2.4 Add a `## Documentation quality` section to `reference/resources.md` with the standards and Diátaxis; verify the rows use primary sources.
- [x] 2.5 Tie documentation to dimension 7 in `ship/quality-bar.md` and link to the new page; verify the seven dimensions are unchanged.
- [x] 2.6 Add the documentation accessibility requirement to the legal checklist in `design/accessibility.md`; verify the link points to the new page.
- [x] 2.7 Add a release-notes note in `ship/appstream.md` that AppStream is a summary and the manual is separate; verify the link points to the new page.
- [x] 2.8 Update the Ship description in the `README.md` structure tree; verify no other README claims are stale.

## 3. Verify

- [x] 3.1 Run `npm run check:docs`; verify baseline, examples, targets, build, PWA, agent docs, MCP tests, and internal links pass.
- [x] 3.2 Check the generated `dist/ship/documentation.md` and `/llms.txt` entry; verify the page is indexed for agents.
- [x] 3.3 Read the new page and the cross-links once for voice, accuracy, and duplication; verify no competitor framing and no certification claim.
- [x] 3.4 Record the standards edition check date in the page sources; verify the date is today.

## 4. Add the style guide

- [x] 4.1 Create `src/content/docs/reference/style-guide.md` with voice, page shape, sentence rules, terminology, code, links, screenshots, accessibility, localization, agent-facing writing, a review checklist, and sources; verify every rule is actionable.
- [x] 4.2 Keep platform terms in `reference/glossary.md` and define only the guide's precise usage terms in the style guide; verify the two pages link to each other.
- [x] 4.3 Add `{ label: 'Style Guide', slug: 'reference/style-guide' }` to the Reference sidebar; verify it appears between Checklists and Glossary.
- [x] 4.4 Add a style-guide check to the documentation gate and the condensed checklist; verify both link to the canonical checklist.

## 5. Add feedback and ownership

- [x] 5.1 Add a `## Feedback and ownership` section to `ship/documentation.md` with page owner, section owner, docs maintainer, release manager, a review-trigger table, and the collect/triage/fix/verify/record loop; verify every trigger names an owner.
- [x] 5.2 Add an agent feedback protocol: report page slug, section, quote, expected/actual, version, target, and source; agents do not publish; the MCP server stays read-only.
- [x] 5.3 Link the style guide from `AGENTS.md` as the canonical house style for human and agent edits; verify the agent feedback rule is stated.
- [x] 5.4 Update `README.md` and the glossary See-also list; verify no duplicate glossary is introduced.

## 6. Verify the extension

- [x] 6.1 Run `npm run check:docs`; verify the style guide builds, is indexed, and all internal links and anchors pass.
- [x] 6.2 Run `npm run check:quality -- --no-build`; verify Lighthouse remains at the existing thresholds.
- [x] 6.3 Read the style guide, the feedback section, and the cross-links for voice and duplication; verify no competitor framing and no unsupported claims.
