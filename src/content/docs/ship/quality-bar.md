---
title: The Quality Bar
description: A seven-dimension scorecard for Linux desktop apps — from prototype to exemplary — with concrete criteria, an audit method, and a 90-day improvement plan.
---

"Quality" is too vague to argue about and too important to leave implicit. This page turns it into a scorecard you can use in a design review, a release gate, or a conversation with your team.

It is not a certification. It is a shared vocabulary for asking: **how native is this app, and what is the next most valuable thing to fix?**

## The seven dimensions

| Dimension | The question it answers |
| --- | --- |
| **Design & UX** | Does the app feel calm, clear, and consistent with the host? |
| **Platform integration** | Does it use the desktop's files, notifications, secrets, and settings? |
| **Performance** | Does it start fast and stay responsive? |
| **Accessibility** | Can everyone use it, including keyboard and screen-reader users? |
| **Reliability & security** | Does it fail safely and protect user data? |
| **Distribution & metadata** | Can users find, install, and update it with confidence? |
| **Maintainability & community** | Can it be sustained for the next five years? |

## The scorecard

Score each dimension from 0 to 3.

| Score | Label | Meaning |
| --- | --- | --- |
| 0 | Prototype | Works on the developer's machine; not ready for users |
| 1 | Usable | The core task works; platform fit is incomplete |
| 2 | Native | Behaves like a first-class citizen of its primary desktop |
| 3 | Exemplary | A reference for other apps; strong on secondary desktops too |

### 1. Design & UX

| Level | Criteria |
| --- | --- |
| 0 | Custom chrome, inconsistent spacing, no empty/error states |
| 1 | Recognizable structure; some platform widgets; light/dark works |
| 2 | Follows the primary HIG; adaptive layout; keyboard-first; polished states |
| 3 | Feels inevitable; brand is distinctive without fighting the host; excellent across sizes and locales |

### 2. Platform integration

| Level | Criteria |
| --- | --- |
| 0 | Hardcoded paths; no desktop file; custom file picker |
| 1 | Desktop file and icon; basic open/save; some notifications |
| 2 | Portals, single instance, file activation, secrets, recent files, MPRIS/search where relevant |
| 3 | Integration is invisible and reliable; works sandboxed with minimal permissions; degrades gracefully outside the primary desktop |

### 3. Performance

| Level | Criteria |
| --- | --- |
| 0 | Multi-second startup; UI freezes on common actions |
| 1 | Acceptable startup; occasional jank; memory grows |
| 2 | Within budget on target hardware; async I/O; 60 fps scrolling; bounded memory |
| 3 | Measures and guards budgets in CI; excellent on old hardware; battery-friendly |

### 4. Accessibility

| Level | Criteria |
| --- | --- |
| 0 | Mouse-only; no labels; poor contrast |
| 1 | Keyboard reachable; native widgets; some labels |
| 2 | WCAG 2.2 AA; Orca-tested; 200% scaling; reduced motion; high contrast |
| 3 | Accessibility is designed in; tested with real AT users; documented statement; regressions gated |

### 5. Reliability & security

| Level | Criteria |
| --- | --- |
| 0 | Crashes on bad input; secrets in plaintext; no error handling |
| 1 | Basic error handling; atomic writes; no obvious secrets |
| 2 | Sandboxed, least privilege, keyring, redacted logs, crash reporting opt-in, recovery paths |
| 3 | Threat-modeled; fuzzed parsers; signed releases; incident response; security contact |

### 6. Distribution & metadata

| Level | Criteria |
| --- | --- |
| 0 | No metadata; manual copy of files; no updates |
| 1 | Desktop file, icon, basic package; manual updates |
| 2 | Valid AppStream, screenshots, Flathub/deb/Snap, signed updates, clean uninstall |
| 3 | Multiple channels maintained from one tag; reproducible builds; verification; excellent store listing |

### 7. Maintainability & community

| Level | Criteria |
| --- | --- |
| 0 | One person, no tests, no docs, no license |
| 1 | Some tests; README; a release process |
| 2 | Clear architecture; CI; docs; issue templates; translation workflow; bus factor > 1 |
| 3 | Healthy contributors; regular releases; roadmap; responsive security process; upstream contributions |

## How to score

1. **Score honestly.** A 3 is rare. Most good apps are 2s with one or two 3s.
2. **Score the shipped artifact**, not the repository. A beautiful demo with a broken Flatpak is not a 2.
3. **Score the primary desktop first.** A GNOME app on KDE can still be a 2 if it degrades gracefully.
4. **Use evidence.** "Accessibility: 2" needs an Orca test, not an intention.
5. **Pick the lowest dimension.** That is the next investment, not the most fun one.

A simple rule:

- **0–7:** prototype; do not ask users to rely on it.
- **8–13:** usable; focus on the weakest dimension.
- **14–18:** native; polish and distribution.
- **19–21:** exemplary; maintain and share.

No dimension should be 0 at a public release.

## The definition of native

Use this as a quick binary check:

- ☐ It launches on Wayland and respects the compositor.
- ☐ It uses the host's widgets, icons, and color scheme.
- ☐ It follows the primary desktop's HIG.
- ☐ It has a desktop file, icon, and valid AppStream metadata.
- ☐ It stores data in XDG directories.
- ☐ It uses portals for files, notifications, and secrets.
- ☐ It starts fast and never blocks the main loop.
- ☐ It is fully keyboard accessible.
- ☐ It works at 200% scaling and with reduced motion.
- ☐ It ships a reproducible, sandboxed build with minimal permissions.
- ☐ It has a maintainer and an update path.

If all eleven are true, the app is native by this guide's definition. The scorecard tells you how *good* it is beyond that.

## The one-hour audit

You do not need a week to find the biggest gap. Block one hour:

1. **Install the published artifact** on a clean VM.
2. **Start it cold** and time the first window.
3. **Use it with the keyboard only** for five minutes.
4. **Switch to dark mode and 200% scaling**; look for clipping.
5. **Open a file through the file manager** (tests portals and MIME).
6. **Trigger a failure** (offline, read-only file, denied permission) and read the message.
7. **Inspect the accessibility tree** with Accerciser for the main screen.
8. **Check the software-center listing** and the permissions.
9. **Uninstall and reinstall**; check data behavior.

Write down one thing per dimension. The lowest score is your next sprint.

## Common failure modes

| Symptom | Likely dimension | First fix |
| --- | --- | --- |
| Looks great in screenshots, feels wrong in use | Design & UX | Use platform widgets and HIG patterns |
| File picker is broken in Flatpak | Platform integration | Use `Gtk.FileDialog` / portal |
| Startup feels slow | Performance | Defer work; profile with Sysprof |
| Screen reader says "panel" for everything | Accessibility | Use native widgets; add labels |
| Users lose data on crash | Reliability | Atomic writes; autosave |
| App is invisible in the software center | Distribution | Fix AppStream metadata |
| Only one person can release | Maintainability | Document and automate the release |
| Reviews complain about permissions | Security/distribution | Remove static permissions; use portals |

## A 90-day plan

For a new app that wants to reach "native":

**Days 1–30: foundation**

- Choose the primary desktop and toolkit.
- Build the core flow with native widgets.
- Add XDG storage, desktop file, icon, and metainfo.
- Set up CI, tests, and a Flatpak build.
- Establish the performance budget.

**Days 31–60: integration**

- Add portals, single instance, notifications, and settings.
- Run the accessibility audit; fix labels, focus, and scaling.
- Test on Wayland at 100–200% scaling.
- Add error states, autosave, and recovery.

**Days 61–90: release**

- Run the UX matrix and the release checklist.
- Submit to Flathub; fix linter and review feedback.
- Publish screenshots and release notes.
- Set up crash reporting (opt-in) and a support path.
- Schedule the first patch release.


## Sources

- [Quality Signals](/reference/quality-signals/)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [AppStream](https://www.freedesktop.org/software/appstream/docs/)
- [Flathub requirements](https://docs.flathub.org/docs/for-app-authors/requirements)
- [XDG specifications](https://specifications.freedesktop.org/)

Next: [Checklists](/reference/checklists/) — the condensed, copy-paste version for daily use.
