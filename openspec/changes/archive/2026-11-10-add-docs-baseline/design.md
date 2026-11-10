# Design

## Context

See `proposal.md`. The guide targets Ubuntu 26.04 LTS and currently repeats exact versions in several pages. The site is built with Astro Starlight; MDX pages can import JSON at build time. A future docs MCP server will need a structured baseline, and a later freshness pipeline will need a review date. The baseline must be useful before either exists.

## Goals / Non-Goals

**Goals:**

- Make the validated version set obvious and authoritative.
- Keep a machine-readable source for the future MCP server and freshness checks.
- Remove duplicate version tables from prose pages.
- Explain the difference between “validated” and “minimum supported”.
- Keep the page useful without JavaScript.

**Non-Goals:**

- Defining a minimum-version support policy for every component.
- Automating upstream freshness checks.
- Adding the MCP server in this change.

## Decisions

### 1. JSON is the source of truth

`src/data/baseline.json` holds the version set. The page imports it and renders a table. The future MCP server reads the same file. No version values are duplicated in MDX prose.

### 2. The page explains the policy, not just the numbers

Sections:

- What the baseline is.
- Validated components table.
- Ubuntu support window.
- Baseline vs minimum supported version.
- Review policy and date.
- Primary sources.
- How to update the baseline.

The page states that a baseline is a tested reference environment, not a promise that older releases are unsupported.

### 3. Remove duplicate version tables

`start/choose-stack` keeps its stack guidance but replaces its “Versions to target in 2026” table with a link to the baseline. GTK and Qt version notes link to the baseline for the full set. `platform/ubuntu` keeps its release-support table and links to the baseline for component versions.

### 4. Validate the data in CI and locally

A small Node script checks required keys, ISO dates, and the review date. `npm run check:baseline` runs it. The build still works if the script is not run, but CI should run it before `npm run build`.

### 5. Review date

`review_due` is six months after `validated_on`. The page shows both. The later freshness pipeline can use the same field to open a review issue.

## Risks / Trade-offs

- **JSON and page drift** → The page imports the JSON; no manual table duplication.
- **Baseline mistaken for minimum support** → The page has an explicit “Baseline vs minimum” section.
- **Review date becomes stale** → The page displays it; the later freshness pipeline will enforce it.
- **MDX table rendering** → Validate the built HTML; fall back to an HTML table inside MDX if needed.
