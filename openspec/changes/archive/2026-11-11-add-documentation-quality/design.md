# Design

## Context

The guide is a target-based field guide for building native Linux desktop apps. Its Ship section already covers store metadata, distribution, release gates, and the quality bar. User documentation is the missing product artifact between metadata and support: AppStream describes the app, but it does not teach anyone how to use it.

The standards landscape is fragmented. ISO/IEC/IEEE 26514 is the software-documentation process standard. ISO 24495-1 covers plain language. ISO/IEC/IEEE 26513 covers review and testing. IEC/IEEE 82079-1 is a horizontal product-information standard. ISO 9241-11 defines usability. WCAG 2.2 and EN 301 549 cover accessible documentation. Diátaxis is a widely used structure model but not a standard.

## Goals / Non-Goals

**Goals:**

- Give readers one practical page they can use to plan, write, review, and ship user documentation.
- Make the standards useful without requiring the reader to buy or read all of them.
- Integrate documentation into the existing release and quality gates.
- Keep the guide's voice: direct, opinionated, and evidence-based.

**Non-Goals:**

- Reproducing the standards or claiming certification against them.
- Covering developer API documentation in depth.
- Adding a new quality dimension or changing the seven-dimension scorecard.
- Replacing AppStream metadata guidance or the release checklist.
- Adding build tooling or automated prose linting.

## Decisions

### 1. Place the page in Ship

Documentation ships with the release and is read by the same audience as the release checklist and the quality bar. Engineering pages explain how to build the app; Ship pages explain what the user receives. The page goes after AppStream in the sidebar.

### 2. Use ISO/IEC/IEEE 26514 as the backbone

26514 covers the process and product requirements for information for users. It is the closest fit for software documentation. The other standards fill specific gaps:

| Standard | Role on the page |
| --- | --- |
| ISO/IEC/IEEE 26514:2022 | Documentation process, structure, and content |
| ISO 24495-1:2023 | Plain-language principles |
| ISO/IEC/IEEE 26513:2017 | Review and usability testing of documentation |
| IEC/IEEE 82079-1:2019 | Broader product-information principles, when hardware or contracts require them |
| ISO 9241-11:2018 | Usability vocabulary for task-based evaluation |
| WCAG 2.2 AA | Accessible HTML documentation |
| EN 301 549 clause 12 | Accessible product documentation and support in the EU |
| Diátaxis | Structure model for tutorials, how-to, reference, and explanation |

### 3. Align, do not certify

The page says the guidance is structured after these standards. It does not claim conformity. Readers who need a formal claim must commission an audit against the purchased standard text.

### 4. One canonical checklist

The full documentation gate lives on the new page. The release checklist gets release-specific items and a link. The condensed checklists page gets a short version and a link. The quality bar gets one sentence tying documentation to the maintainability dimension.

### 5. Practical examples over standard summaries

Each standard is described by what it changes in the reader's work, not by its table of contents. Procedures, error messages, and review records use concrete examples from a notes app, matching the rest of the guide.

## Risks / Trade-offs

- **Standards go stale.** Editions and links change. The page names editions and will need review with the rest of the reference material.
- **Too much process for a small app.** The page explicitly says a small app starts with a README, one tutorial, and one page per core task.
- **Legal overreach.** EN 301 549 applicability depends on the market and product. The page says to confirm with counsel and does not give legal advice.
- **Duplication with accessibility.** The page links to the accessibility chapter for WCAG technique and only covers documentation-specific requirements.

### 6. House style lives in Reference, not in the documentation page

The documentation page explains the process; the style guide explains how to write. Splitting them keeps the process page readable and gives writers and agents one stable page to cite. The guide already has a platform glossary, so the style guide owns only usage rules and the terms that need a precise definition. Platform terms stay in `reference/glossary.md` to avoid two competing dictionaries.

### 7. Feedback is a loop with named triggers, and agents are readers

A feedback link without an owner and a review trigger becomes a suggestion box. The documentation page names four roles (page owner, section owner, docs maintainer, release manager), maps events to reviews, and defines a six-step loop. Agent signals are first-class feedback: failed searches, unknown slugs, repeated questions, and agent-reported defects become findability or accuracy bugs. Agents may report and review, but they do not publish. The MCP server remains read-only; adding write tools to collect feedback would break its contract and make the server harder to trust.

### 8. The style guide is also agent-facing

The same Markdown serves humans and agents. Rules such as stable anchors, self-contained sections, explicit nouns, frontmatter as search metadata, and no image-only instructions make the guide easier to retrieve without creating an agent-only variant. Hidden instructions or agent-only claims are forbidden; agents read what people read.
