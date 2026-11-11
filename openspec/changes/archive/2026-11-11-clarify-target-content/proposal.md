# Proposal

## Why

The public target pages contain several claims that are now inconsistent with the matrix and the evidence:

- `targets/index.md` says "Plasma 6 is Wayland-only", but X11 is removed in Plasma 6.8; Fedora 45 may ship 6.7.x.
- The Fedora GNOME validation row says "the same GNOME stack as Ubuntu", but it is GNOME 51/GTK 4.24 against Ubuntu's GNOME 50/GTK 4.22.
- Fedora KDE and the target JSON use a single `Last validated` date, although only Ubuntu 26.04.1 was runtime-validated; Fedora, Debian, and Arch were checked through release notes and package indexes.
- The Qt chapter says "build it against Qt 6.10 and KDE Frameworks 6.24" while the Fedora KDE reference is Qt 6.11/KF 6.30+.
- The baseline page promises a "future freshness pipeline" that does not exist yet.

These are content defects on a live site. They should be fixed without changing the target matrix, the site architecture, or the deployment.

## What Changes

- Correct the Plasma Wayland statement to "Plasma 6.8 removes the X11 session; this target uses Wayland".
- Describe Fedora GNOME as the next GNOME stack (GNOME 51/GTK 4.24), not the same version as Ubuntu.
- Separate "evidence checked" from "runtime validated": add a note to the target index and change the Fedora KDE field label to "Last checked".
- Clarify the Qt chapter's dual baseline: Ubuntu 26.04 ships Qt 6.10.2/KF 6.24; Fedora 45 supplies Qt 6.11/KF 6.30+; the example builds against the lower baseline and remains compatible.
- Replace the future freshness promise on the baseline page with the current manual review contract.
- Do not change target roles, scores, default stacks, or the target matrix.

## Capabilities

### New Capabilities

None. This is a content correction with no new runtime behavior. The change opts out of spec deltas with `skip_specs: true`.

### Modified Capabilities

None. The existing `docs-content` requirements already require dated evidence and honest uncertainty; this change brings the pages back into line with them.

## Impact

- `src/content/docs/targets/index.md`
- `src/content/docs/targets/fedora-kde.md`
- `src/content/docs/targets/ubuntu-gnome.md`
- `src/content/docs/engineering/qt.md`
- `src/content/docs/reference/baseline.mdx`
- No site configuration, workflow, target data, or matrix change.
