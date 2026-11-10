# Tasks

## 1. Baseline audit

- [x] 1.1 Record baseline metrics: page count, word count, number of `## Key takeaways` headings, and number of competitor mentions; verify the counts with `grep`/`wc` and save them in the change notes.
- [x] 1.2 List every duplicate or near-duplicate section (audit, anti-patterns, common pitfalls, key takeaways) and decide keep/link/remove for each; verify the decision list covers all 31 content pages.

## 2. Remove competitor framing

- [x] 2.1 Rewrite the landing page paragraph and closing quote in `src/content/docs/index.mdx` so they describe the Linux/Ubuntu opportunity directly; verify no competitor names remain in the file.
- [x] 2.2 Rewrite the opening and remove the comparison table from `src/content/docs/start/why-linux.md`; keep the four contracts and the positive platform description, verified by a clean read-through.
- [x] 2.3 Replace competitor-specific anti-pattern language in `start/native-standard.md`, `design/principles.md`, `start/choose-stack.md`, and `engineering/qt.md` with platform-neutral wording; verify `grep` finds no unnecessary competitor mentions.
- [x] 2.4 Keep only factual portability mentions that describe a real target; verify each remaining mention has a clear technical reason and is not a comparison.

## 3. Remove repetitive summaries and consolidate the audit

- [x] 3.1 Remove every `## Key takeaways` section while preserving the following "Next:" link or adding a short `## See also` where navigation would otherwise be lost; verify the heading count is zero.
- [x] 3.2 Replace the duplicated one-hour audit in `src/content/docs/ship/release-checklist.md` with a link to the canonical audit in `src/content/docs/ship/quality-bar.md` plus release-specific smoke tests; verify the release checklist still covers the release-day checks.
- [x] 3.3 Tighten page endings so each page ends with a next step, a See also list, or a reference table; verify no page ends with a stranded bullet list.

## 4. Tone and structure pass

- [x] 4.1 Replace defensive/meta phrases ("the short version", "honest comparison", "not a religion", "it is worth saying plainly") with direct statements; verify the affected pages read as guidance rather than commentary.
- [x] 4.2 Standardize headings around decisions and tasks ("Choose the channel", "Audit the app", "What to avoid") and remove headings that only announce a summary; verify the sidebar/TOC still reads coherently.
- [x] 4.3 Tighten intros on the longest pages (`start/why-linux`, `start/choose-stack`, `platform/wayland`, `platform/security`, `design/principles`, `engineering/gtk`, `engineering/qt`) so each opens with the decision, not background; verify the first two paragraphs state the page's purpose.
- [x] 4.4 Review the Ubuntu page and its cross-links for consistency with the packaging, security, integration, and accessibility pages; verify the packaging recommendation and Pro optionality are not contradicted elsewhere.

## 5. Verification and commit

- [x] 5.1 Run `npm run build` and verify all pages build, Pagefind indexes the site, and the navigation still includes the Ubuntu page.
- [x] 5.2 Run the internal link/anchor checker over `dist/` and verify zero missing pages or anchors.
- [x] 5.3 Run Lighthouse on the landing page, `platform/ubuntu`, `start/why-linux`, and `reference/checklists`; verify Accessibility, Best Practices, and SEO remain at 1.0 with no failures.
- [x] 5.4 Compare the final word count with the baseline and verify the guide is shorter without losing required topics; record the delta in the change notes.
- [x] 5.5 Review the final diff for voice consistency, factual accuracy, and remaining competitor mentions; verify `git diff --check` passes and `grep` finds no `## Key takeaways`.
- [x] 5.6 Commit the editorial change on the `workspace` branch with an English commit message; verify `git status` is clean.

## Workflow follow-up

- Archive both documentation changes after review, using the OpenSpec archive workflow.
- Re-check the external Ubuntu/component links at the next release or after a major Ubuntu point release.
