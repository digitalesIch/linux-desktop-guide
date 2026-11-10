# Proposal

## Why

The first-app tutorial presents `examples/notes` as its full source, but the two have drifted. The tutorial writes data under an app-ID directory while the example and the surrounding prose use `notes`; the tutorial styles the body with a class the example does not use; the example is missing the accessibility labels and About fields the tutorial teaches; and the desktop entry, AppStream metadata, and icon differ between the two. A reader who follows the tutorial and a reader who opens the example get different behavior and different metadata.

The reading path also jumps from "The Native Standard" straight to Design, skipping the entire Platform section even though the sidebar places Platform next. The glossary has no inbound link from any page.

These are documentation-quality defects, not missing features. The fix is to make the example authoritative, keep the tutorial in sync with a check, and repair the navigation.

## What Changes

- Make `examples/notes` the canonical source for the tutorial's file snippets.
  - Align the data path, CSS class, accessibility labels, About dialog, and `--quit-after-startup` hook.
  - Align the desktop entry, AppStream metadata, and icon between the tutorial and the example.
  - Use the application ID for `StartupWMClass`; keep the desktop and AppStream categories consistent.
- Add `scripts/check-examples.mjs`:
  - extract every titled file block from `start/first-app.md`;
  - compare it with the matching file in `examples/notes`;
  - print a unified diff and exit non-zero on drift.
- Add `check:examples` to `package.json` and include it in `check:docs`.
- Fix the reading path:
  - `start/native-standard` points to `platform/ubuntu`;
  - `platform/ubuntu` points to `platform/wayland`.
- Link the glossary from `start/why-linux` and `platform/ubuntu`.

## Capabilities

### Modified Capabilities

- `docs-content`: tutorial snippets and the runnable example must agree; the reading path must follow the sidebar; the glossary must be discoverable.
- `docs-tooling`: the documentation gate checks example consistency.

## Impact

- `src/content/docs/start/first-app.md`
- `examples/notes/src/main.py`, `examples/notes/data/*`
- `src/content/docs/start/native-standard.md`, `src/content/docs/platform/ubuntu.md`
- `scripts/check-examples.mjs`, `scripts/check-docs.mjs`, `package.json`
- `README.md`, `AGENTS.md`
- No site structure changes beyond the existing pages.
