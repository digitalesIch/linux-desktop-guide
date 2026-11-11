# Tasks

## 1. Layer orientation and defaults

- [x] 1.1 Add a note that the page is the Linux-wide stack decision guide, not a platform guide, and link the Platform Guides and the cross-target recipe.
- [x] 1.2 Remove Flatpak from the GNOME target default box; show Snap/deb as target-native and Flatpak as cross-target.
- [x] 1.3 Label Fedora's Flatpak as both target-native and cross-target, with RPM as the archive-native secondary.

## 2. Decision language

- [x] 2.1 Replace "Both equally → Qt" with "choose one primary HIG and toolkit; document the other as a guest."
- [x] 2.2 Describe Kubuntu as an additional check outside the matrix, not a validation target.
- [x] 2.3 Clarify Rust as a language choice for GTK, not a separate target default, and mark the single-binary option as a special case.
- [x] 2.4 Separate host toolkit versions from the Flatpak runtime version in the versions section.

## 3. Verification

- [x] 3.1 Run `npm run check:docs`; verify links, anchors, target consistency, and agent-doc validation.
- [x] 3.2 Run `npm run check:quality -- --no-build` and review the page at desktop and narrow widths.
- [x] 3.3 Run `openspec validate align-choose-stack-with-layer-model --strict`; verify only the page and change artifacts are touched.
- [ ] 3.4 Commit and push; verify the Pages deployment and the live page.
- [ ] 3.5 Archive the change.

## Workflow follow-up

- The parallel MCP refactor belongs to the structure session and stays untouched.
- Then create the runnable `examples/notes-qt/` project and the Fedora container build path.
