---
title: Design Principles
description: How to design Linux desktop apps that feel calm, fast, and native across GNOME, KDE, and the wider ecosystem — without sanding off your product's character.
---

Linux design is plural. GNOME, KDE Plasma, and elementary publish human-interface guidelines; COSMIC publishes its own design guidance. Each has a coherent language, but they do not agree on every pattern. There is no single authority that can settle every question, so the app has to make a choice: **pick a primary desktop, follow its conventions deeply, and adapt gracefully elsewhere.**

That is not a limitation. It is what lets a Linux app feel like it belongs in more than one place without feeling imported from another platform. The [Platform Targets](/targets/) page chooses the default HIG for each target; this chapter explains the principles behind that choice.

## The principles

### 1. Clarity before cleverness

The user should understand what the window does, what is selected, and what happens next without reading documentation. Use plain labels, visible state, and a clear hierarchy.

- One primary action per view.
- Destructive actions are visually distinct and confirmable.
- Icons are supported by labels when the meaning is not universal.
- Empty states explain the next step.

### 2. Calm by default

Desktop apps are long-lived. The interface should be quiet enough to live in for hours.

- Avoid constant animation, pulsing badges, and attention-seeking color.
- Use motion to explain a change, not to decorate it.
- Keep chrome minimal; let content carry the visual weight.
- Do not use modals for information that can be inline.

### 3. Content is the interface

The best GNOME apps feel like a frame around the user's work. The headerbar, sidebar, and toolbar should recede when the user is reading, writing, or editing.

- Reduce persistent toolbars to the actions that matter in context.
- Use progressive disclosure for advanced settings.
- Let the window resize and the layout adapt; do not force a fixed canvas.
- Prefer a document-first layout over a dashboard of widgets.

### 4. Keyboard-first, pointer-optional

Every action should be reachable without a mouse. This is not a power-user feature; it is the baseline for accessibility and speed.

- Standard shortcuts work.
- Focus is visible and moves logically.
- Menus expose shortcuts.
- Dialogs can be completed and dismissed from the keyboard.
- Search is one shortcut away.

### 5. Consistency with the host

Use the host's widgets, spacing, icons, and interaction patterns. A custom control is a debt: it must reimplement focus, hover, pressed, disabled, high-contrast, RTL, and accessibility behavior.

- Use `Adw` widgets on GNOME, Kirigami on KDE.
- Follow the host's HIG for navigation and dialogs.
- Respect the system accent, dark mode, font, and text scale.
- Do not ship a theme that overrides the desktop.

### 6. Direct manipulation

When the user can act on an object, let them act on the object. Drag to reorder, click to select, type to rename, right-click for context.

- Provide visible affordances, not hidden gestures.
- Support undo for reversible actions.
- Keep selection stable across refreshes.
- Do not require a modal dialog for a one-field edit.

### 7. Feedback is immediate

Every action should produce a visible response within 100 ms. If the work takes longer, show progress and allow cancellation.

- Buttons show a pressed state.
- Long operations show progress, not a frozen window.
- Success is quiet; failure is specific.
- Toasts confirm non-critical actions; notifications cover background events.
- Errors say what happened, why, and what to do next.

### 8. Forgiving by design

Users make mistakes, and so do apps. Design for recovery.

- Undo instead of confirmation for reversible actions.
- Confirm only destructive, irreversible actions.
- Autosave and restore sessions.
- Never lose user input because of a crash or a closed dialog.
- Provide a reset path for settings and a export path for data.

### 9. Performance is a design property

A beautiful interface that stutters is not beautiful. Startup time, scroll smoothness, and input latency are part of the experience.

- Keep the first paint fast.
- Avoid layout thrash and huge widget trees.
- Use skeleton states instead of blank windows.
- Test on the oldest hardware you support.

### 10. Respect the user's settings

The desktop is configurable because users have preferences. Honor them.

- Light/dark mode and accent color.
- Font size and text scaling.
- Reduced motion.
- High contrast.
- Language and locale.
- Power-saving mode.

An app that ignores these settings is not native, no matter how it looks.

## Pick a primary desktop

| Desktop | Design language | Toolkit | HIG |
| --- | --- | --- | --- |
| GNOME | Calm, content-first, headerbars, Adwaita | GTK 4 + libadwaita | [GNOME HIG](https://developer.gnome.org/hig/) |
| KDE Plasma | Dense, configurable, Kirigami | Qt 6 + Kirigami | [KDE HIG](https://develop.kde.org/hig/) |
| elementary OS | Minimal, structured, AppCenter-first | GTK 4 + Granite | [elementary HIG](https://docs.elementary.io/hig/) |
| COSMIC | Modular, Rust-native | libcosmic | [COSMIC design](https://system76.com/cosmic) |

**Pick one as your primary.** Follow its navigation, spacing, and dialog conventions. On other desktops, use the toolkit's platform integration, avoid hardcoded assets, and accept that the app will feel like a guest — because it is one.

The reference targets carry a concise decision layer in their profiles: [GNOME design contract](/targets/ubuntu-gnome/#design-contract-gnome) and [KDE Plasma design contract](/targets/fedora-kde/#design-contract-kde-plasma). The canonical HIGs remain the exhaustive reference; these contracts translate them into the choices an app has to make. They are summaries, not copies of the upstream guidelines.

## Where brand belongs

Brand expression is not banned. It just has a small, high-leverage surface area:

| Good places for brand | Bad places for brand |
| --- | --- |
| App icon | Window controls |
| Accent color (within system limits) | File dialogs |
| Empty states and illustrations | Notifications |
| Onboarding copy | Menus and shortcuts |
| About dialog | Titlebar layout |
| Marketing site and screenshots | System tray behavior |

The fastest way to make a Linux app feel foreign is to import another platform's chrome. The fastest way to make it feel distinctive is a strong icon, a thoughtful empty state, and a clear voice.

## A design process that fits Linux

1. **Write the user's task in one sentence.** "Capture a thought before it disappears." Not "note management".
2. **Sketch the smallest flow.** One window, one primary action, one escape hatch.
3. **Choose the platform pattern.** Sidebar, split view, stack, tabs, or dialog. Use the HIG, not a generic design-gallery mockup.
4. **Prototype in the real toolkit.** GTK Builder/Blueprint or Qt Quick. A prototype that cannot resize is not a prototype.
5. **Test at three sizes.** Narrow (360 px), medium (720 px), wide (1280 px). Test at 200% scale.
6. **Test with the keyboard only.** Then with Orca. Then with reduced motion and high contrast.
7. **Remove one thing.** The first design is usually too busy.
8. **Ship, observe, iterate.** Watch where users hesitate; fix the flow, not the color.

## What to avoid

| Anti-pattern | Why it hurts |
| --- | --- |
| Hamburger menu for primary navigation | Hides the app's structure; poor discoverability |
| Custom titlebar with fake window controls | Breaks tiling, gestures, and platform expectations |
| Modal dialog for every action | Interrupts flow; stacks up; hard to undo |
| Tiny icon-only buttons without tooltips | Inaccessible and ambiguous |
| Animation on every state change | Feels slow; ignores reduced-motion settings |
| Fixed window size | Breaks on small screens and at 200% scaling |
| Dark mode as an afterthought | Half the UI becomes unreadable |
| "Are you sure?" for reversible actions | Trains users to click through dialogs |
| Hover-only controls | Unusable with keyboard and touch |
| Custom file picker | Breaks sandboxing, bookmarks, and recent files |


## Sources

- [GNOME HIG](https://developer.gnome.org/hig/)
- [KDE HIG](https://develop.kde.org/hig/)
- [elementary HIG](https://docs.elementary.io/hig/)
- [COSMIC design](https://system76.com/cosmic)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

Next: [Visual Language](/design/visual-language/) — typography, color, spacing, icons, and motion that adapt to the host.
