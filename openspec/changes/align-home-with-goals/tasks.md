# Tasks

## 1. Hero and scope

- [x] 1.1 Rewrite the hero title, tagline, description, and artwork alt text around the path from a useful task to an installable, updatable app; mark the artwork as an illustration.
- [x] 1.2 Replace the "every distribution" claim and the repeated platform pitch with three durable distinctions; verify the copy names the selected targets rather than promising universal behavior.

## 2. Targets and design entry points

- [x] 2.1 Link Ubuntu + GNOME and Fedora + KDE directly from the reference-target card and name their design contracts; verify both profiles and anchors resolve.
- [x] 2.2 Give GNOME and KDE equal design entry points in the closing navigation; verify neither target is presented as the default for the other.

## 3. Development path and release criteria

- [x] 3.1 Replace "From first window to Flathub" with the three-step path through a useful core task, persistence and recovery, integration, packaging, installation, and updates.
- [x] 3.2 Replace the performance-budget band with the four mandatory release criteria; verify the copy separates them from the advisory quality score and links the Quality Bar.

## 4. Verification

- [x] 4.1 Run `npm run check:docs`; verify links, anchors, target consistency, and the base path.
- [x] 4.2 Run `npm run check:quality -- --no-build` and review the page at desktop and narrow widths; verify the hierarchy is scannable and no section implies a completed Fedora runtime validation.
- [x] 4.3 Run `openspec validate align-home-with-goals --strict`; verify only the landing page and change artifacts are touched.
- [ ] 4.4 Commit and push; verify the Pages deployment and the live page.

## Workflow follow-up

- Archive after verification.
- Resume the Fedora KDE development path: a persistent Qt core task, matching build dependencies, and recorded runtime checks.
