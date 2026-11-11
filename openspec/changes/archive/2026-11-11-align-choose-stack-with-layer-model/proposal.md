# Proposal

## Why

`start/choose-stack.md` is the Linux-wide stack decision page, but several passages still read like a universal platform recommendation. Flatpak appears inside both target-default boxes, Kubuntu is called a validation option even though it is not in the target matrix, and "Both equally" recommends Qt as the automatic compromise. That conflicts with the new Platform Guide and cross-target model.

## What Changes

- Add a short note that this page is the Linux-wide decision guide, not a platform guide.
- Keep Flatpak out of the target-native default stack: Ubuntu uses Snap/deb natively; Fedora uses Flatpak/Flathub natively; Flatpak is the cross-target channel.
- Replace "Both equally → Qt" with "choose one primary HIG and toolkit; document the other as a guest."
- Describe Kubuntu as an additional Ubuntu-based KDE check outside the matrix, not a validation target.
- Clarify Rust as a language choice for GTK, not a separate target default.
- Mark the single-binary option as a special case, not a reference default.
- Separate the host toolkit version from the Flatpak runtime version.

## Impact

- `src/content/docs/start/choose-stack.md`
- `openspec/changes/align-choose-stack-with-layer-model/`

No new route, target, component, or packaging channel. The page keeps its existing structure and links.
