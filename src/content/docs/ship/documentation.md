---
title: User Documentation
description: "How to structure, write, test, and ship user documentation for a Linux desktop app — task-based pages, plain language, accessible formats, and review against ISO/IEC/IEEE 26514, ISO 24495-1, ISO/IEC/IEEE 26513, and WCAG 2.2 AA."
---

A user who cannot find out how to finish a task does not have that feature. Documentation is part of the product, not a wiki someone updates when there is time.

Most app documentation fails for a predictable reason: it is organized around features instead of tasks. A page called "Sync" explains settings. A page called "Keep two machines in sync" gets someone to a result. The standards below are useful because they push you toward the second shape and give you evidence that the result works.

## What users need

| Need | Where it belongs | Example |
| --- | --- | --- |
| Install and first run | README, software-center listing, in-app welcome | "Install from Flathub, then choose a folder" |
| Core tasks | How-to pages, in-app help | "Create, rename, and delete a note" |
| Reference | Settings, shortcuts, file formats | "Keyboard shortcuts" |
| Troubleshooting | FAQ or recovery page | "The app cannot open my file" |
| Changes | Release notes | "What changed in 2.4" |
| Immediate feedback | In-app labels, errors, empty states | "This folder is read-only" |

The README is not the manual. Keep it short enough to read in two minutes, and link to the task pages from the app and the store listing.

## Four kinds of documentation

Diátaxis is a useful structure model, not a standard. It separates documentation by what the reader is trying to do:

| Kind | Reader's question | Example | Test |
| --- | --- | --- | --- |
| Tutorial | "Teach me the basics" | "Your first note in five minutes" | A new user can finish it without help |
| How-to | "How do I …?" | "Import Markdown files" | A user with a goal can complete it |
| Reference | "What does this setting do?" | "Command-line options" | Every option is accurate and complete |
| Explanation | "Why does it work this way?" | "How sync resolves conflicts" | It answers the question without becoming a procedure |

A small app does not need four sections. Start with a README, one tutorial, and one page per core task. Add reference and explanation when users ask for them, not because the model has four boxes.

## Standards worth using

| Standard | What it covers | How to use it | What it does not give you |
| --- | --- | --- | --- |
| [ISO/IEC/IEEE 26514:2022](https://www.iso.org/standard/77451.html) | Design and development of information for users | The backbone of the documentation process: audience, structure, content, review, maintenance | A writing style, a toolchain, or a page template |
| [ISO 24495-1:2023](https://www.iso.org/standard/78907.html) | Plain-language principles | Make text relevant, findable, understandable, and usable | Accessibility guidance or software-specific examples |
| [ISO/IEC/IEEE 26513:2017](https://www.iso.org/standard/67417.html) | Testing and reviewing information for users | Plan editorial, technical, usability, and accessibility reviews | A test script you can run unchanged |
| [IEC/IEEE 82079-1:2019](https://webstore.iec.ch/en/publication/29075) | Information for use of products | A broader product-information baseline when hardware, contracts, or regulation require it | Software-specific process detail |
| [ISO 9241-11:2018](https://www.iso.org/standard/63500.html) | Usability: definitions and concepts | Frame task-based evaluation around effectiveness, efficiency, and satisfaction | Methods or documentation requirements |
| [WCAG 2.2 AA](https://www.w3.org/TR/WCAG22/) | Accessible web content | The target for HTML documentation and in-app help | Product-documentation obligations |
| [EN 301 549 V4.1.1, clause 12](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/04.01.01_60/en_301549v040101p.pdf) | Documentation and support services | Accessible product documentation and accessibility-feature disclosure in the EU | A statement that your product is in scope |

A second edition of ISO/IEC/IEEE 26513 was in publication at the time of writing; check [ISO](https://www.iso.org/standard/89070.html) for the current edition.

These standards overlap. You do not need to apply all of them to a small app. Use 26514 as the process backbone, 24495-1 for the language, 26513 for the review, and WCAG 2.2 AA for the published format. Add 82079-1 when a product-specific standard, a customer, or a regulated market requires it.

**Aligning with a standard is not certification.** Say "structured after ISO/IEC/IEEE 26514" or "reviewed against ISO 24495-1" unless an auditor has checked you against the purchased standard text. Do not put a standard logo on a page that has not been assessed.

## Write the task, not the feature

A procedure has five parts, in this order:

1. **Title** that starts with a verb: "Restore a deleted note".
2. **Prerequisites**: what the user needs before starting.
3. **Steps**: one action per numbered item.
4. **Result**: what the user should see when it worked.
5. **Recovery**: what to do when the likely failure happens.

```text title="A task page"
Restore a deleted note

You need a note that was deleted in the last 30 days.

1. Open Settings > Trash.
2. Select the note.
3. Press Restore.

The note returns to its notebook. If Trash is empty, the note was
deleted more than 30 days ago or removed permanently.
```

Rules that prevent most support requests:

- Keep one procedure per page. Split a page when the title needs "and".
- Put prerequisites before the first step, not in a note at the bottom.
- Use the exact UI label the user sees. If the label changes, update the page in the same change as the code.
- Show a command and its expected output together, not a command without context.
- State the result. "The note returns to its notebook" tells the user the action worked; "You have restored the note" does not.
- Cover the failure the user is most likely to hit. A recovery sentence is worth more than a troubleshooting chapter.
- Link to reference instead of pasting an option table into every procedure.
- Do not write "simply", "just", or "obviously". They tell the user that their difficulty is their fault.
- Test the steps on the target in [Platform Targets](/targets/), not on the machine where you wrote them.

Plain language is not childish language. ISO 24495-1 asks four things of a document: readers get what they need (relevant), can find it (findable), can understand it (understandable), and can use it (usable). In practice:

| Before | After |
| --- | --- |
| "Utilize the synchronization facility to reconcile local state" | "Sync your notes" |
| "An error occurred while saving" | "The file is read-only. Save a copy in another folder." |
| "Notes may be optionally configured to be stored remotely" | "You can store notes on a server" |

Use second person, active voice, and present tense. Define a term once, then use the same term everywhere. Prefer a concrete example over an abstract description. The full house rules are in the [Style Guide](/reference/style-guide/).

## In-app text

In-app text is documentation at the moment of failure. An error message should answer four questions:

1. What happened?
2. Why?
3. What can the user do now?
4. Is their data safe?

```text title="Error message"
Could not save the note. The folder is read-only.
Choose another folder, or make this one writable.
Your changes are still open in this window.
```

- Name the object and the action. "Could not save the note" is better than "Operation failed".
- Give the next action. If the user can fix it, say how. Do not send them to support for a permission problem.
- Include a stable error code for support, but never show the code alone.
- Do not blame the user or the system. Describe the state and the way out.
- Empty states should say what will appear and offer the first action: "No notes yet. Create your first note."
- Release notes are user-facing. List visible changes, migration steps, and known issues; do not paste the git log.

Documentation is not a fix for confusing UI. If every user needs a paragraph to find a button, change the button.

## Accessible documentation

Documentation that only exists as a scanned PDF is not documentation for everyone. Publish HTML and make it work with the same standards as the app:

- Use one page title, semantic headings, lists, and tables with header cells.
- Make every link and control keyboard reachable; keep a visible focus indicator.
- Meet WCAG 2.2 AA contrast and support 200% zoom without horizontal scrolling.
- Write alt text for screenshots. Caption or transcribe video.
- Never put the only copy of an instruction in an image.
- Document the app's accessibility features and how to use them. EN 301 549 clause 12 requires this for in-scope products.
- Offer a support channel that works for people who cannot use a phone.
- State known limitations instead of implying full conformance.

If you sell to the EU public sector, or your product falls under the European Accessibility Act, clause 12 is the relevant baseline. Scope and exemptions depend on the product and the market; confirm applicability with counsel. The technical baseline and testing practice are in [Accessibility](/design/accessibility/).

## Keep documentation in the repository

Treat documentation as source code. Keep it in the same repository, review it in the same change as the behavior it describes, and build it with the same pipeline.

```text title="A small documentation layout"
docs/
├── index.md              # what the app is, install, first run
├── create-a-note.md      # one core task
├── import-markdown.md    # another core task
├── shortcuts.md          # reference
└── troubleshooting.md    # recovery
README.md                 # two-minute overview and links
CHANGELOG.md              # developer-facing history
```

- Keep one source of truth. Do not maintain a wiki and a repository copy that disagree.
- Review docs in the same merge request as the code. A follow-up documentation ticket is a promise to ship stale instructions.
- Run a link checker, a spelling checker, and a Markdown structure check in CI. Automate the mechanical checks; keep human review for meaning.
- Generate screenshots from the shipped build, and retake them when the UI changes. A screenshot from an old release is worse than no screenshot.
- Version the docs with the release. If users stay on an older major version, keep its docs available.
- Translate task pages before reference pages, and freeze strings before a release.

The guide's own build follows this model: Markdown in `src/content/docs/`, internal link and anchor checks in `npm run check:docs`, and generated Markdown for agents. See [Documentation for agents](/reference/resources/#agent-access) for that side of the pipeline.

## Review and test

ISO/IEC/IEEE 26513 treats documentation as something to review and test, not just proofread. Four passes catch different defects:

| Pass | Who | Question | Evidence |
| --- | --- | --- | --- |
| Editorial | Writer or reviewer | Is it clear, consistent, and complete? | Comments resolved |
| Technical | Engineer or QA | Are commands, labels, and versions correct? | Steps run on the reference target |
| Usability | Three to five users | Can they finish the task without help? | Notes and pass/fail per task |
| Accessibility | Accessibility tester | Does it work with keyboard, screen reader, zoom, and contrast? | Issues filed and fixed |

Record the result. A review without a date and a version is a rumor.

| Field | Example |
| --- | --- |
| Page | `create-a-note` |
| Version | 2.4.0 |
| Target | Ubuntu 26.04 LTS + GNOME |
| Reviewed | 2026-11-10 |
| Reviewer | Documentation reviewer |
| Result | Pass; one screenshot updated |

- Watch users attempt the task. Do not explain the page to them; that tests your explanation, not the documentation.
- File documentation bugs like code bugs, with the page, the version, and the observed result.
- Re-review when the UI, a command, or a supported target changes.
- Automate link checks, spelling, heading structure, and screenshot diffs. Keep meaning, accuracy, and task success human.

## Feedback and ownership

Documentation decays without an owner and a trigger. Name four roles, even if one person holds several:

- **Page owner** — accountable for accuracy and the review record.
- **Section owner** — keeps structure, cross-links, and terminology consistent across pages.
- **Docs maintainer** — owns the build, link checks, screenshots, and agent output.
- **Release manager** — confirms the documentation gate before a release.

A named person beats a team name. Write the owner down where the team can see it, not only in someone's head.

### Review triggers

| Trigger | What gets reviewed | Owner |
| --- | --- | --- |
| UI label or flow change | Task pages, screenshots, in-app text | Page owner |
| Release | Release notes, install and upgrade, known issues | Release manager |
| Target or version change | Commands, versions, baseline links | Section owner |
| Support cluster | Troubleshooting, error messages, prerequisites | Page owner |
| Security or privacy change | Permissions, data handling, telemetry | Security reviewer |
| Link or style check failure | Affected pages and anchors | Docs maintainer |
| Agent miss or wrong answer | Page description, headings, related links | Page owner and docs maintainer |
| Translation update | Source strings, screenshots, RTL layout | Localization owner |

### The loop

1. **Collect** — support tickets, search logs, helpful votes, docs issues, usability tests, link and style checks, MCP search misses, and agent reports.
2. **Triage** — tag the page and the cause: missing, wrong, unclear, stale, or unfindable.
3. **Fix** — update the source of truth. If the defect is repeatable, add a check.
4. **Verify** — run the task on the target, check the links, and re-read the page.
5. **Record** — date, version, reviewer, and result.
6. **Close the loop** — tell the reporter, and mention user-visible corrections in the release notes.

### Agent feedback

Agents are readers and reviewers, not publishers.

- An agent report includes the page slug, section, quote, expected and actual result, version, target, and the source that contradicts the page.
- A human owner decides whether to change the page. Agents do not silently rewrite content or publish generated pages.
- Treat a failed MCP search, an unknown slug, or a dead-end related link as a findability bug, not just a model failure.
- Keep the docs MCP server read-only. Do not add write tools just to collect feedback.
- Review agent-generated patches like any other patch, including the [style guide](/reference/style-guide/) checklist.

Report a defect through [Feedback](/reference/feedback/) or the [structured issue form](https://github.com/digitalesIch/linux-desktop-guide/issues/new?template=docs-feedback.yml). The repository is public; readers need a GitHub account to open an issue.

## Documentation gate

Use this as the release gate. The condensed version is in [Checklists](/reference/checklists/).

- ☐ Every core task has a task-based page.
- ☐ Install and first run are covered.
- ☐ Each procedure has prerequisites, steps, a result, and a recovery path.
- ☐ Commands and UI labels were run on the reference target.
- ☐ Error messages say what happened, why, and what to do next.
- ☐ Release notes describe user-visible changes, migration steps, and known issues.
- ☐ Documentation is HTML, keyboard accessible, and passes WCAG 2.2 AA.
- ☐ Screenshots are current and have alt text.
- ☐ Internal links and anchors pass; no page describes a removed feature.
- ☐ The page passes the [style guide](/reference/style-guide/) checklist.
- ☐ The review date, version, and reviewer are recorded.
- ☐ Documentation ships in the same release as the app.

## Sources

Standards editions and links checked 2026-11-10.

- [ISO/IEC/IEEE 26514:2022 — Design and development of information for users](https://www.iso.org/standard/77451.html)
- [ISO 24495-1:2023 — Plain language: governing principles and guidelines](https://www.iso.org/standard/78907.html)
- [ISO/IEC/IEEE 26513:2017 — Requirements for testers and reviewers of information for users](https://www.iso.org/standard/67417.html)
- [ISO/IEC/IEEE 26513 — second edition status](https://www.iso.org/standard/89070.html)
- [IEC/IEEE 82079-1:2019 — Preparation of information for use of products](https://webstore.iec.ch/en/publication/29075)
- [ISO 9241-11:2018 — Usability: definitions and concepts](https://www.iso.org/standard/63500.html)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [EN 301 549 V4.1.1](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/04.01.01_60/en_301549v040101p.pdf)
- [Diátaxis](https://diataxis.fr/)

Next: [Release Checklist](/ship/release-checklist/) — put documentation into the release gate.
