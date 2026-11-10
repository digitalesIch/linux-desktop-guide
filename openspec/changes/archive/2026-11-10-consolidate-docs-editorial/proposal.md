# Proposal

## Why

The guide has grown to 31 pages and more than 43,000 words. That scale has introduced two editorial problems: repeated competitor framing that makes the guide sound defensive, and repeated summary sections ("Key takeaways") that add length without adding decisions. A smaller number of pages also restate the same audit or checklist. The result is harder to scan than it should be, and the voice drifts between confident guidance and commentary about other platforms.

## What Changes

- Remove competitor comparisons from the landing page, `start/why-linux`, `design/principles`, `start/native-standard`, `start/choose-stack`, and `engineering/qt`. Replace them with direct statements about the Linux/Ubuntu platform and the supported path.
- Remove the per-page `## Key takeaways` summary blocks. Keep a clear next-step link or a `## See also` section where it helps navigation.
- Consolidate the duplicated one-hour audit: keep the full audit in `ship/quality-bar` and link to it from `ship/release-checklist`.
- Tighten page intros, headings, and transitions. Remove meta-commentary about the guide, Apple-style comparisons, and defensive phrasing.
- Keep the guide opinionated: the change removes competitor framing, not judgment about the right stack, packaging path, or design.
- Align the Ubuntu-specific content with the existing packaging, security, and integration claims so the guide reads as one system.

## Capabilities

### New Capabilities

None. This is a documentation-content change with no application behavior or public API changes. The change opts out of spec deltas with `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- Markdown content under `src/content/docs/`.
- Pagefind index and generated static site.
- No runtime code, build system, package metadata, or example-app behavior changes.
- Word count should decrease, while the number of pages stays the same.
