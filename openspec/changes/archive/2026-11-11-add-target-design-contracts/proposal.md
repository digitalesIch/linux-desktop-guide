# Proposal

## Why

The guide defines the right platform targets, but its design chapters are still mostly GNOME/Adwaita-shaped. KDE readers are sent to the external KDE HIG without a guide-level translation of the decisions that actually shape an app: navigation, window chrome, dialogs, settings, density, feedback, and cross-desktop fallback.

Copying the HIGs would create a second, drifting source of truth and lose the guide's curation. Linking them alone leaves the target path incomplete. The missing layer is our own concise design contract per reference target.

## What Changes

- Add a **Design contract: GNOME** section to `targets/ubuntu-gnome.md`.
- Add a **Design contract: KDE Plasma** section to `targets/fedora-kde.md`.
- Point `design/principles.md` at the two contracts and state the three-layer model: canonical HIG, target contract, shared principles.
- Keep the canonical HIGs as the exhaustive reference for each platform, with links and a checked date.
- Keep the contracts short: navigation, window structure, dialogs, settings, spacing/icons, feedback, keyboard/accessibility, and cross-desktop behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This is a content addition. The change opts out of spec deltas with `skip_specs: true`.

## Impact

- `src/content/docs/targets/ubuntu-gnome.md`
- `src/content/docs/targets/fedora-kde.md`
- `src/content/docs/design/principles.md`
- `src/content/docs/reference/resources.md` only if a source is missing

No new route, sidebar entry, toolkit code, target, or automated gate. The HIGs remain the canonical source; the contracts are decision summaries in the guide's voice.
