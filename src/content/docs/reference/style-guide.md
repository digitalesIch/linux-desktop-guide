---
title: Style Guide
description: "The house style for the Linux Desktop Guide and the apps it documents — voice, page shape, terminology, code, links, screenshots, accessibility, localization, and agent-facing Markdown."
---

This is the house style for every page in `src/content/docs`, the generated agent Markdown, app user documentation, UI strings, error messages, and release notes. It exists so a reader can move between pages without relearning the voice, and so an agent can retrieve a section without guessing what "it" refers to.

Accuracy wins over style. If a rule makes a page less correct, break the rule and fix the rule later. The process, standards, and review gates are in [User Documentation](/ship/documentation/); platform terms are in the [Glossary](/reference/glossary/).

## The short version

1. Write for a task or a decision, not a feature.
2. Put the answer first.
3. Use the reader's terms and the UI's exact labels.
4. Prefer a concrete example over an abstract description.
5. Keep one idea per paragraph and one procedure per page.
6. Be direct and honest about limits.
7. Link to the canonical source instead of restating it.
8. Make the page accessible and translatable.
9. Keep headings and slugs stable; they are link targets.
10. Test what you write on the target.

## Voice and audience

Write for a competent developer who is new to this specific app or platform. Do not explain programming basics. Do explain a platform contract the reader may not know.

- Use second person, active voice, and present tense: "Press Restore", not "The note will be restored by pressing Restore".
- Be opinionated but fair. State the recommendation, then the trade-off.
- Do not compare against another operating system or use it as the baseline.
- Do not use marketing language: *powerful*, *seamless*, *revolutionary*, *best-in-class*. If a quality matters, measure it or name the mechanism.
- Do not blame the reader. Avoid *simply*, *just*, *obviously*, and *of course* as minimizers.
- Admit uncertainty. "Not verified on Fedora 45" is better than a guess.
- Use "you" for the reader. Use "the guide" rather than "we"; reserve "we" for maintainer notes where a person is actually speaking.
- Contractions are fine in explanation. Use full forms in procedures and requirements.

| Before | After |
| --- | --- |
| "The application utilizes a portal to facilitate file access" | "The app uses a portal to open files" |
| "Simply click the button to restore your note" | "Press Restore" |
| "This is the best solution for all users" | "This is the default for the Ubuntu + GNOME target" |

## Page shape

- Page titles use Title Case. Section headings use sentence case.
- Do not add an H1 in the body. Starlight renders the frontmatter title.
- Open with one paragraph that states the problem or decision.
- Each `##` section answers one question. Use `###` only for a real subcase.
- Put the most important sentence first in each section.
- End with a next step or a short `## See also`. Do not add a summary block that repeats the page.
- Use tables for comparisons, checklists for gates, and code blocks for commands.
- Keep the page navigable at a glance: a reader should understand the structure from the headings alone.

A task page starts from this template:

```text title="Task page template"
---
title: Restore a Deleted Note
description: One sentence for search results and social previews.
---

State the user's goal and when they need this page.

## What you need

## Steps

## Result

## If it fails

## See also
```

## Sentences and words

- Keep sentences short enough to scan. One idea per sentence.
- Prefer the concrete verb: *use*, not *utilize*; *start*, not *initiate*; *help*, not *facilitate*.
- Prefer "for example" to "e.g." and "that is" to "i.e.".
- Use the serial comma in lists of three or more.
- Use a spaced em dash — like this — for an aside. Do not use a hyphen as a dash.
- Use ISO dates (`2026-11-10`) in metadata, review records, changelogs, and sources.
- Use numerals for versions, measurements, and counts in tables and procedures: `GTK 4.22`, `16.7 ms`, `3–5 users`.
- Write `200%` without a space; write `16.7 ms` and `2 GB` with one.
- Avoid "etc." in a procedure. List the items or link to the reference.
- Use "must" for a requirement, "should" for a recommendation, and "may" for an option. Do not use "shall" in guide prose; it belongs in specifications.
- Use present tense for current behavior. Do not write "will" when the behavior already exists.

## Terminology

Use one term for one concept. The full platform vocabulary is in the [Glossary](/reference/glossary/); do not create a second glossary. These are the terms this guide uses precisely:

| Term | Use it to mean | Avoid |
| --- | --- | --- |
| **app** | The product the reader is building or using | "application" in prose |
| **user** | The person using the app | "end user" unless contrasting with a developer or administrator |
| **Linux desktop** | The ecosystem and the user's session | "Linux Desktop" as a common noun |
| **target** | A distribution + desktop + toolkit entry in `src/data/targets.json` | "platform" when the matrix entry is meant |
| **reference target** | The primary supported target with one default stack and HIG | "main platform" |
| **validation target** | A target used to check portability, not the primary recommendation | "secondary target" |
| **compatibility target** | A target supported through a fallback, usually Flatpak | "unsupported target" |
| **baseline** | The validated version set in `src/data/baseline.json` | "current versions" without a source |
| **stack** | Toolkit, language or binding, and supporting libraries | "technology" |
| **canonical** | The single source the guide treats as authoritative | "official" when no authority exists |
| **deprecated** | Still available, but no longer recommended | "removed" |
| **removed** | No longer available | "deprecated" |
| **agent docs** | The generated Markdown, `llms.txt`, and `llms-full.txt` | "AI docs" |
| **docs MCP** | The local, read-only `docs` server | "documentation API" |
| **review trigger** | An event that requires a documentation review | "review event" |

Capitalization and spelling that people get wrong:

- **Flatpak** is the product; `flatpak` is the command.
- **Flathub** is the store; never `flathub` in prose.
- **Snap** is the product; `snap` is the command and the package.
- **AppStream** is the metadata standard; `appstreamcli` is the tool.
- **MetaInfo** is the AppStream file; the suffix is `.metainfo.xml`.
- **Wayland**, **X11**, and **XWayland** are protocol names.
- **D-Bus**, not DBus.
- **GTK** is the toolkit; `Gtk` is the namespace in code.
- **libadwaita** is lowercase; **Qt** and **Kirigami** keep their capitalization.
- **XDG** is the prefix for the specifications; `xdg` appears in commands and paths.
- **HIG** is the acronym for Human Interface Guidelines.
- **MCP** is the protocol; `docs` is the name of this project's server.

Words to avoid unless the sentence gives them a measurement or a mechanism:

| Avoid | Why | Use instead |
| --- | --- | --- |
| simply, just, obviously, of course | Makes difficulty the reader's fault | State the action |
| easy, user-friendly | Unmeasurable | Name the property: fewer steps, keyboard access, clear labels |
| modern, powerful, seamless, robust | Marketing | Name the mechanism or the measured result |
| utilize, leverage, facilitate | Nominalization | use, start, help |
| click here, read more | Link text that fails out of context | The destination name |
| secure | Unverifiable without a threat model | The specific control: sandboxed, least privilege, encrypted |
| native | Vague without the platform contracts | The HIG, widgets, portals, and integration that apply |
| works | Untestable without a target | "Runs on Ubuntu 26.04 LTS + GNOME" |
| support | Ambiguous without a version and window | "Supported on GTK 4.22 until …" |

## Code and commands

- Every command should be runnable on a stated target. Mark placeholders clearly: `io.github.yourname.Notes`, `<your-app-id>`.
- Put a `title=` on code blocks that represent a file or a terminal session.
- Use the correct language tag: `bash`, `c`, `cpp`, `rust`, `python`, `xml`, `yaml`, `json`, `text`.
- Do not add a `$` prompt unless you are showing output separately. Use `text` for output and directory trees.
- One command per line. Put comments above the command and explain *why*, not *what*.
- Show expected output when the reader needs it to confirm success.
- Use the versions in the [Baseline](/reference/baseline/) and the [target matrix](/targets/). Do not invent a version.
- Do not put secrets, tokens, personal paths, or real email addresses in an example.
- Use `~` for the home directory in prose and paths. Use `$HOME` when the shell expands it.
- Format keyboard shortcuts as `Ctrl+K`, `Alt+F2`, `Super`. Do not add spaces around `+`.
- Format file paths and environment variables as code: `~/.config`, `XDG_CONFIG_HOME`.
- Write versions without a `v` prefix in prose: `Ubuntu 26.04 LTS`, `Qt 6.11`. A git tag may keep the repository's actual `v2.4.0` form.
- Use `sudo` only when the step requires it, and say what it changes.

## Links

- Internal links are root-relative with a trailing slash: `/platform/wayland/`. Add an anchor only when it is stable: `/reference/resources/#agent-access`.
- Link text names the destination. "Read the [Wayland chapter](/platform/wayland/)" beats "Read more [here](/platform/wayland/)".
- Link the canonical source for a claim: the specification, the upstream documentation, or the project's own release notes.
- Do not use a bare URL as link text. Put the title in the text and the URL in the target.
- Do not link the same concept repeatedly in one paragraph. Link once, then use the term.
- Headings are anchors. Renaming a heading breaks incoming links; update the links in the same change.
- A `## Sources` section lists primary sources with the date they were checked.
- Do not link to `dist/` or generated files. Link to the source page or the live route.

## UI text and error messages

- Use the exact label the user sees. If the label is **Restore**, do not write "recover".
- Write UI paths as `Settings > Trash`.
- Buttons and menu items use sentence case and no trailing period: **Restore**, **Save a copy**.
- An error message answers four questions: what happened, why, what to do now, and whether the data is safe. The full pattern is in [User Documentation](/ship/documentation/#in-app-text).
- Do not show an error code alone. Add a stable code for support after the human-readable message.
- Empty states say what will appear and offer the first action: "No notes yet. Create your first note."
- Release notes are user-facing: visible changes, migration steps, and known issues. Do not paste the git log.
- Do not use documentation to excuse a confusing UI. If every user needs a paragraph to find a button, change the button.

## Tables, lists, and checklists

- Use a table for a comparison or a mapping. Give the first column a clear label and keep cells short.
- Do not put long prose in a table. If a cell needs three sentences, use a subsection.
- Use numbered lists for sequence and bullets for options.
- Keep nesting to two levels. If a list needs a third level, split it.
- Checklists use `- ☐` and an imperative item: `- ☐ Verify the file opens through the portal.`
- Use `**bold**` for a label you are naming and backticks for a literal value.
- Do not use footnotes. Put sources at the end.

## Screenshots and media

- Take screenshots from the shipped build, on the stated target, at the stated scale.
- Do not fake window chrome or crop out the native shadow, title bar, and rounded corners.
- Remove personal data, API keys, and private file names.
- Write alt text that describes the information, not the file: "The Trash view with one note selected and the Restore button highlighted."
- Captions are one sentence and do not end with a period.
- Provide light and dark variants where the UI differs. Do not use color alone to convey state.
- Never put the only copy of an instruction in an image.
- Compress images and keep them current. An outdated screenshot is a trust signal in the wrong direction.

## Accessibility and localization

- Use one page title and a logical heading hierarchy. Do not skip from `##` to `####`.
- Make link text meaningful out of context. "Download the manifest" is better than "Download".
- Provide alt text for images and captions or transcripts for video.
- Meet WCAG 2.2 AA for contrast, focus, keyboard access, and 200% zoom. The technical baseline is in [Accessibility](/design/accessibility/).
- Write plain language. Expand an abbreviation on first use.
- Do not put instructions only in an image, a tooltip, or a hover state.
- Write complete UI strings. Do not concatenate fragments; use placeholders and plural forms.
- Give translators context: a comment for ambiguous strings, the screen where the string appears, and the maximum length if it matters.
- Use locale APIs for dates, numbers, and currency in the app. Use ISO dates in metadata and review records.
- Test the layout in RTL and with translated strings that are longer than English.
- The localization workflow is in [Localization](/design/localization/).

## Writing for agents

The same Markdown serves people and agents. There is no agent-only page and no hidden instruction. An agent that retrieves one section should be able to use it without reading the whole page.

- Keep slugs and headings stable. They are the retrieval and link API.
- Make the frontmatter title and description specific. They become search results, `llms.txt` entries, and MCP excerpts.
- Make each section self-contained. Repeat the subject instead of writing "it" or "this" without an antecedent.
- Avoid "above", "below", and "as mentioned earlier" as the only navigation. Link to the section by name.
- Put facts in text, tables, or code blocks, not only in images, tabs, or JavaScript.
- State versions, targets, and prerequisites explicitly. "Run the command" is incomplete without where and with which version.
- Use the canonical terms from this page and the [Glossary](/reference/glossary/). Do not introduce a synonym in one section.
- Do not edit `dist/`, `llms.txt`, `llms-full.txt`, or the generated per-page `.md` files. Edit the source in `src/content/docs/`.
- The docs MCP server is read-only. Do not add write tools just to collect feedback.

### Agent feedback

Agents are readers and reviewers, not publishers. When an agent finds a documentation defect, it should report:

- the page slug and section heading;
- the exact quote or code block;
- what it expected and what it found;
- the app or guide version and target;
- the primary source that contradicts the page.

A human owner decides whether to change the page. Agents must not silently rewrite content, publish generated pages, or submit an upstream change without review. The feedback loop and review triggers are in [User Documentation](/ship/documentation/#feedback-and-ownership).

What agents can check well:

- broken internal links and anchors;
- code blocks that no longer match the example app or a manifest;
- missing prerequisites and unstated versions;
- duplicate pages and competing terms;
- heading structure and missing descriptions.

What a human must review:

- technical accuracy and security claims;
- tone and editorial judgment;
- screenshots and visual claims;
- translations and legal statements;
- whether the page actually helps a user finish the task.

## Review checklist

- ☐ The title and description are specific enough to identify the page in search.
- ☐ There is no H1 in the body; section headings are sentence case.
- ☐ The intro states the problem or decision in one paragraph.
- ☐ Each `##` section answers one question.
- ☐ Procedures have prerequisites, steps, a result, and a recovery path.
- ☐ UI labels match the shipped app exactly.
- ☐ Commands were run on the stated target; placeholders are marked.
- ☐ Versions match the baseline and target matrix.
- ☐ Internal links are root-relative with a trailing slash; external links are primary sources.
- ☐ Sources have a checked date.
- ☐ No minimizers, hype, blame, or competitor framing.
- ☐ Terms match the glossary; one concept has one name.
- ☐ Tables, lists, and checklists follow the formats above.
- ☐ Screenshots are current, have alt text, and contain no personal data.
- ☐ The page is keyboard accessible, readable at 200% zoom, and translatable.
- ☐ Sections are self-contained and anchors are stable.
- ☐ `npm run check:docs` passes.

## Sources

Style rules checked 2026-11-10. The documentation process and its standards are in [User Documentation](/ship/documentation/).

- [ISO 24495-1:2023 — Plain language: governing principles and guidelines](https://www.iso.org/standard/78907.html)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Diátaxis](https://diataxis.fr/)
- [GNOME Human Interface Guidelines](https://developer.gnome.org/hig/)
- [KDE Human Interface Guidelines](https://develop.kde.org/hig/)

Next: [Glossary](/reference/glossary/) — the platform terms this style guide tells you to use.
