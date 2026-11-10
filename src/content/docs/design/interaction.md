---
title: Interaction & Feedback
description: Keyboard shortcuts, focus, pointer targets, undo, search, toasts, errors, loading states, and motion — the small behaviors that make a Linux app feel responsive and trustworthy.
---

Users do not experience your architecture. They experience what happens when they press a key, click a button, or wait for a file to open. Interaction design is the discipline of making those moments predictable, fast, and reversible.

## Keyboard first

Every action must be reachable without a pointer. This is a baseline for accessibility, a productivity feature for power users, and a quality signal for everyone else.

### Standard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl+N` | New |
| `Ctrl+O` | Open |
| `Ctrl+S` | Save |
| `Ctrl+Shift+S` | Save as |
| `Ctrl+W` | Close window |
| `Ctrl+Q` | Quit application |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo |
| `Ctrl+X` / `Ctrl+C` / `Ctrl+V` | Cut / copy / paste |
| `Ctrl+A` | Select all |
| `Ctrl+F` | Find / search |
| `Ctrl+K` | Command palette (optional) |
| `F1` | Help / shortcuts |
| `Esc` | Cancel, close, leave fullscreen |
| `F11` | Fullscreen |
| `Ctrl++` / `Ctrl+-` / `Ctrl+0` | Zoom in / out / reset |

Do not invent a different shortcut for a standard action. Do not override a system shortcut. If a shortcut conflicts with the desktop, let the user change it or choose a different one.

### Actions, not key handlers

Bind shortcuts to `Gio.Action` objects, not raw key events. Actions can be discovered by menus, the shortcuts dialog, and accessibility tools.

```python title="Actions and accelerators"
action = Gio.SimpleAction.new("new-note", None)
action.connect("activate", self.on_new_note)
self.add_action(action)

app.set_accels_for_action("win.new-note", ["<Control>n"])
```

For app-wide actions, use `app.`; for window actions, use `win.`. Add the action to the window or application accordingly.

### Shortcuts dialog

Expose the full shortcut list in a searchable dialog. libadwaita provides `Adw.ShortcutsDialog`; use it instead of a hand-written help page.

## Focus

Focus is the keyboard user's cursor. If it is invisible or unpredictable, the app is unusable without a mouse.

- Show a clear focus ring. Do not remove it for aesthetics.
- Keep a logical tab order that follows the visual layout.
- Move focus to the first meaningful control when a view opens.
- Restore focus to the trigger when a dialog closes.
- Trap focus inside modal dialogs; `Esc` closes them.
- Do not put focus on a destructive button by default.
- Make custom widgets focusable and expose their state.

```python title="Focusing a search field"
self.search_entry.grab_focus()
```

Test by tabbing through the entire app with the mouse untouched. Then test with a screen reader.

## Pointer and touch targets

- Minimum target: 24×24 px (WCAG 2.2). Comfortable: 32×32 px or larger.
- Provide hover and pressed states; the cursor should change over interactive elements.
- Right-click opens a context menu for the object under the pointer.
- Drag and drop should have a keyboard-accessible alternative.
- Do not rely on hover for essential information; touch and keyboard users cannot hover.
- Support two-finger scrolling and kinetic scrolling where appropriate.
- Avoid swipe-only navigation on the desktop; provide buttons and shortcuts.

## Feedback

Every action needs a response within 100 ms. If the work takes longer, show progress.

| Duration | Feedback |
| --- | --- |
| < 100 ms | Immediate visual state change |
| 100 ms–1 s | Inline spinner or subtle progress |
| > 1 s | Determinate progress, cancel button, and a description |
| Background | Notification or a status indicator in the app |

### Toasts

Use `Adw.Toast` for non-critical confirmations and undo affordances.

```python title="Undo toast"
toast = Adw.Toast.new("Note deleted")
toast.set_button_label("Undo")
toast.connect("button-clicked", self.on_undo_delete)
self.toast_overlay.add_toast(toast)
```

Toasts disappear automatically. Do not use them for errors that require action; use an inline banner or a dialog.

### Notifications

Use notifications for events that happen while the user is not looking at the app. They should be actionable, rate-limited, and free of secrets. See [System Integration](/platform/integration/#notifications).

## Undo and destructive actions

- Prefer undo over confirmation for reversible actions.
- Confirm only destructive, irreversible actions ("Delete 12 notes permanently?").
- Use a clear verb on the destructive button ("Delete", not "OK").
- Keep an undo stack for editing operations, with a visible history if the app is complex.
- Autosave drafts and restore them after a crash.

`Gtk.TextBuffer` has built-in undo for text editing. For app-level operations, implement a command stack with clear descriptions.

## Search

Search is a first-class interaction, not a filter box bolted onto a list.

- `Ctrl+F` focuses search; `Esc` clears or closes it.
- Search incrementally, with a debounce of 100–200 ms.
- Show a "no results" state with a way to clear the query.
- Highlight matches in the results, not just in the detail view.
- Preserve the query when navigating into a result and back.
- For large datasets, search the model, not the rendered widgets.

```python title="Incremental search"
self.search_entry.connect("search-changed", self.on_search_changed)

def on_search_changed(self, entry):
    query = entry.get_text().strip().lower()
    self.filter_model.set_filter(
        Gtk.CustomFilter.new(lambda item: query in item.title.lower())
    )
```

`Gtk.FilterListModel` has a `filter` property, not a `set_filter_func()` method; `Gtk.CustomFilter` wraps the match function.

If the app has searchable content that should appear in the desktop overview, add a GNOME Shell search provider. Do not make the shell wait on a slow network call.

## Command palette

A command palette (`Ctrl+K`) is optional, but useful for apps with many actions. It should:

- list actions, not just navigation;
- show shortcuts next to actions;
- search by synonyms and translated labels;
- never be the only way to reach an action;
- be fast and keyboard-only.

## Motion

Motion should explain a change, not decorate it.

- Use 150–250 ms for most transitions.
- Animate transform and opacity, not layout.
- Respect reduced motion. If the user disabled animations, do not animate; show the final state.
- Do not animate on every keystroke or scroll event.
- Avoid parallax, bouncing, and attention-seeking loops.

## Sound and haptics

Desktop apps should be silent by default. Sound is appropriate for media apps, games, and explicit user-enabled alerts. Haptics are not a desktop primitive; do not depend on them.

If you add sound:

- Provide a setting to disable it.
- Use it for meaningful events, not every click.
- Never use sound as the only feedback.

## Errors

An error message should answer three questions:

1. **What happened?** "Could not save the note."
2. **Why?** "The disk is full."
3. **What can I do?** "Free some space, then try again."

Rules:

- Use plain language; put the technical detail behind "Details".
- Offer a retry action when retrying can work.
- Never show a raw stack trace as the primary message.
- Do not blame the user.
- Log the technical detail with a correlation ID; do not include secrets.
- For destructive or data-loss errors, preserve the user's work and offer export.

## Loading

- Show a skeleton for content that has a known shape; a spinner for unknown work.
- Avoid layout shift when content arrives; reserve space.
- Cancel work when the user navigates away.
- Do not block the entire window for a small background task.
- Show determinate progress when you can estimate it; indeterminate when you cannot.
- Keep the UI responsive during long operations; the main loop is sacred.

## Interaction checklist

- ☐ Every action is reachable by keyboard.
- ☐ Standard shortcuts work; custom shortcuts are documented.
- ☐ Focus is visible, logical, and restored after dialogs.
- ☐ Target sizes are at least 24×24 px.
- ☐ Hover is not required for essential information.
- ☐ Actions respond within 100 ms; long work has progress and cancel.
- ☐ Reversible actions use undo; destructive actions confirm.
- ☐ Search is incremental and has a no-results state.
- ☐ Errors explain what, why, and what to do next.
- ☐ Reduced motion is respected.
- ☐ Sound is optional and off by default.
- ☐ Notifications are actionable and rate-limited.


## Sources

- [GNOME HIG](https://developer.gnome.org/hig/)
- [KDE HIG](https://develop.kde.org/hig/)
- [Adw.ShortcutsDialog](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/1.9/class.ShortcutsDialog.html)
- [Gtk.CustomFilter](https://docs.gtk.org/gtk4/class.CustomFilter.html)
- [Gtk.FilterListModel](https://docs.gtk.org/gtk4/class.FilterListModel.html)

Next: [Accessibility](/design/accessibility/) — the legal, ethical, and technical baseline for software that works for everyone.
