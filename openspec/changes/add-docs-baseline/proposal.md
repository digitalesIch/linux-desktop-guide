# Proposal

## Why

Version facts are currently spread across `platform/ubuntu`, `start/choose-stack`, `engineering/gtk`, and `engineering/qt`. That creates two problems: readers cannot tell which version set is authoritative, and a future MCP server or freshness check would have no structured source to read. A single baseline page and a machine-readable JSON file fix both.

## What Changes

- Add `src/data/baseline.json` with the validated Ubuntu, GNOME, GTK, libadwaita, Qt, KDE, Snap, and Flatpak versions plus the review date.
- Add `src/content/docs/reference/baseline.mdx`, which imports the JSON and renders the validated baseline, the support window, the difference between baseline and minimum support, and the review policy.
- Add the page to the Reference sidebar.
- Replace the duplicate version table in `start/choose-stack` with a short link to the baseline.
- Link the baseline from `platform/ubuntu` and the GTK/Qt version notes.
- Add a small `check:baseline` validation script for required fields and ISO dates.
- No behavior changes to the site beyond the new page.

## Capabilities

### New Capabilities

None. This is a documentation and structured-data change with no application behavior or public API changes. The change opts out of spec deltas with `skip_specs: true`.

### Modified Capabilities

None.

## Impact

- `src/data/baseline.json` (new)
- `src/content/docs/reference/baseline.mdx` (new)
- `astro.config.mjs` sidebar
- `start/choose-stack.md`, `platform/ubuntu.md`, `engineering/gtk.md`, `engineering/qt.md`
- `package.json` / `scripts/check-baseline.mjs`
- Pagefind index and static build
