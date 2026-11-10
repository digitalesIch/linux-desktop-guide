---
title: Feedback
description: "How to report a wrong, missing, or unclear page in the Linux Desktop Guide — for human readers and agents, with a static GitHub Issues workflow that works on GitHub Pages."
---

The guide is only as good as the corrections it receives. Report a command that fails, a prerequisite that is missing, a screenshot from an old release, a link that no longer resolves, or a page you could not find.

This page is also the feedback contract for agents. The site is static and runs on GitHub Pages, so there is no form POST and no server log. GitHub Issues is the transport.

## Open an issue

[Open a documentation issue](https://github.com/digitalesIch/linux-desktop-guide/issues/new?template=docs-feedback.yml)

The repository is **public**. You need a GitHub account to open an issue; if you are signed out, GitHub will ask you to sign in first.

## What to report

| Report | Example |
| --- | --- |
| Wrong command or output | `flatpak install` uses a runtime branch that is end-of-life |
| Missing prerequisite | The page assumes Flatpak is installed |
| Stale version or screenshot | The page shows GTK 4.18 but the baseline is 4.22 |
| Broken link or anchor | A chapter link lands on a missing heading |
| Unclear or incomplete step | A procedure works only with a setting the page never mentions |
| Missing page | A core task has no task-based page |
| Inaccessible documentation | A table is unreadable at 200% zoom, or an image has no alt text |

Do not use this channel for app support, feature requests, or security vulnerabilities. For a vulnerability, use a [private security advisory](https://github.com/digitalesIch/linux-desktop-guide/security/advisories/new), not a public issue.

## What to include

The issue form asks for these fields. A report without them usually needs a round trip.

| Field | What to write |
| --- | --- |
| **Page** | The URL or slug, for example `/ship/documentation/` |
| **Section** | The heading the problem appears under |
| **Quote** | The exact sentence or code block |
| **Expected** | What the page should say or do |
| **Actual** | What it says or what happened |
| **Version / commit** | The guide version, release, or commit you read |
| **Target** | Ubuntu 26.04 LTS + GNOME, Fedora 45 KDE, or another supported target |
| **Reporter** | Human or agent |
| **Source** | The specification, upstream documentation, or test that supports the correction |

Do not include secrets, tokens, personal data, or private file contents. A screenshot should be cropped to the relevant UI and stripped of personal information.

## For agents

Agents are readers and reviewers, not publishers. They report; a human owner decides and publishes.

Use the same fields from the command line:

```bash title="Terminal"
gh issue create \
  --repo digitalesIch/linux-desktop-guide \
  --title "[Docs] Wrong runtime branch in the Flatpak example" \
  --body-file /tmp/docs-feedback.md
```

```text title="docs-feedback.md"
Page: /platform/flatpak-portals/
Section: Build and install
Quote: runtime-version 46
Expected: A supported runtime branch for the current baseline
Actual: The example uses an end-of-life branch
Version/commit: 2026-11-10
Target: Ubuntu 26.04 LTS + GNOME
Reporter: agent
Source: https://docs.flatpak.org/en/latest/available-runtimes.html
```

Rules for agents:

- Do not edit the page or open a pull request that rewrites it without human review.
- Do not include secrets, personal data, or unpublished user content.
- Do not use the docs MCP server as a write path. It is read-only by design.
- Treat a failed search, an unknown slug, or a dead-end related link as a findability bug; include the query and the page you expected.
- Report the version, target, and source. "The docs are wrong" is not reproducible.

## How reports are handled

1. **Triage** — the maintainer tags the page and the cause: missing, wrong, unclear, stale, or unfindable.
2. **Fix** — the page owner updates the source of truth. A repeatable defect gets a check.
3. **Verify** — the step is run on the stated target, the links are checked, and the page is re-read.
4. **Record** — the review date, version, and reviewer are added to the page or the change. Maintainers add the `agent-report` label to reports from automated agents.
5. **Close** — the reporter is told what changed. User-visible corrections go into the release notes.

The full ownership model and review triggers are in [User Documentation](/ship/documentation/#feedback-and-ownership). The writing rules are in the [Style Guide](/reference/style-guide/).

## See also

- [User Documentation](/ship/documentation/) — process, standards, review, and the documentation gate
- [Style Guide](/reference/style-guide/) — voice, terminology, links, code, and agent-facing writing
- [Checklists](/reference/checklists/) — the condensed documentation gate
