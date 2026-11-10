# Design

## Context

See `proposal.md` for motivation. The site uses Astro Starlight and a consistent visual system, but the editorial rules were never made explicit. Pages were written one at a time, which produced recurring summary blocks, occasional competitor framing, and a few duplicated checklists. The Ubuntu integration change added a new platform hub and cross-links; this change makes the whole guide read as one voice.

## Baseline

- 33 Markdown files (31 content pages plus the landing page and 404).
- 45,997 words.
- 28 `## Key takeaways` sections.
- 13 competitor-name mentions across 6 files.

## Goals / Non-Goals

**Goals:**

- Make the guide sound confident and direct, not defensive or comparative.
- Reduce repetition without removing technical depth.
- Give every page a predictable shape: intro, decision-oriented sections, next step or See also.
- Keep the guide opinionated about the supported path and the quality bar.
- Preserve the existing information architecture and design system.

**Non-Goals:**

- Rewriting every page from scratch.
- Changing the site design, navigation structure, or example app.
- Removing legitimate factual references to other platforms when they describe a real portability target.
- Flattening genuine technical disagreements between GNOME, KDE, and other desktops.

## Decisions

### 1. Write about the platform, not about competitors

Remove comparisons such as "macOS gives you..." and "not a worse version of macOS." State what Linux and Ubuntu provide directly. The reader does not need another platform as a reference point.

Exception: a factual portability list (for example, Qt targeting multiple operating systems) may name platforms when the capability itself is the point. Keep those mentions rare and specific.

### 2. No per-page summary blocks

Remove `## Key takeaways`. They repeat the page, lengthen it, and make every page end the same way. Keep the final "Next:" link or add a short `## See also` list when the page benefits from navigation. Reference pages can keep a compact checklist or table, but not a summary of the summary.

### 3. One canonical audit

Keep the full "one-hour audit" in `ship/quality-bar`. Replace the duplicate in `ship/release-checklist` with a link plus the release-specific smoke tests. This makes the audit a single artifact that can be improved in one place.

### 4. Predictable page shape

Use this structure unless the page is a reference index:

1. A one-paragraph statement of the problem or decision.
2. `##` sections that each answer one question.
3. A final `## See also` or "Next:" line.

Prefer short intros. Remove lines that talk about the guide itself ("this page is opinionated", "the short version") unless they set a real constraint.

### 5. Keep the judgment

The guide should still say "use GTK/libadwaita for GNOME-first apps", "start with no Flatpak permissions", "do not require Ubuntu Pro", and "remove the key takeaways." Editorial cleanup must not turn the guide into a neutral link list.

### 6. Duplicate inventory

| Pattern | Count | Decision |
| --- | --- | --- |
| `## Key takeaways` | 28 | Remove; keep the next-step link |
| One-hour audit | 2 | Keep the full audit in `ship/quality-bar`; link from `ship/release-checklist` |
| `## Anti-patterns` | 2 | Keep the platform-level table in `start/why-linux`; rename the design and architecture variants |
| `## Common pitfalls` | 4 | Keep; each is toolkit- or platform-specific |
| Settings, secrets, search, performance, motion, icons | 2 each | Keep; each appears in a different layer (design vs engineering vs platform) |

### 7. Consolidation map

| Area | Change |
| --- | --- |
| Landing | Replace the competitor paragraph and quote with a direct statement about building for Linux/Ubuntu |
| `start/why-linux` | Remove the macOS comparison table and the "worse version" framing; keep the four contracts |
| `start/native-standard` | Replace "macOS or Windows chrome" with "another platform's chrome" |
| `start/choose-stack` | Remove "not a religion" and competitor framing; keep the stack recommendations |
| `design/principles` | Remove the "copy of macOS" line; keep the HIG comparison |
| `engineering/qt` | Remove macOS from the cross-platform list unless the list itself is the point |
| All pages | Remove `## Key takeaways`; preserve next links |
| `ship/release-checklist` | Replace the duplicated audit with a link to the quality bar |

## Risks / Trade-offs

- **Removing summaries loses skimmability** → Keep tables, checklists, and clear headings; add `See also` where navigation matters.
- **Removing competitor framing weakens contrast** → Replace it with concrete platform facts and decisions, not vague praise.
- **Over-editing destroys the voice** → Keep strong claims and specific recommendations; only remove defensive or comparative framing.
- **Inconsistent edits across 31 pages** → Use the consolidation map and run a final grep for competitor terms and summary headings.
- **Ubuntu content drifts from existing packaging advice** → Re-read the packaging, security, and integration pages after the pass and check the cross-links.

## Migration Plan

No migration. Content-only change; rollback is a revert of the affected Markdown files.

## Open Questions

None.

Final: 44,054 words (-1,943, about -4.2%); 0 competitor mentions; 0 key-takeaway sections.
