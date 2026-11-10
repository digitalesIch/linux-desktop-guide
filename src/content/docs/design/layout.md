---
title: Layout & Navigation
description: Adaptive layouts, navigation patterns, dialogs, empty states, and settings pages for Linux desktop apps — with GNOME/libadwaita and KDE/Kirigami patterns.
---

Layout is where "native" becomes visible. A Linux app can use the right widgets and still feel wrong if the navigation model fights the desktop, the window does not adapt, or the settings page looks like a web form.

Start with the **content model**, not the widgets. What is the user looking at? Is it a list, a document, a canvas, a timeline, or a set of independent tools? The answer determines the navigation pattern.

## Pick the pattern

| Pattern | Use when | GNOME/libadwaita | KDE/Kirigami |
| --- | --- | --- | --- |
| Single view | One task, one document | `Adw.ApplicationWindow` + content | `Kirigami.Page` |
| Master–detail | A list and a selected item | `Adw.NavigationSplitView` | `Kirigami.PageRow` |
| Collapsible sidebar | Many sections, content-first | `Adw.OverlaySplitView` + `Adw.Sidebar` | `Kirigami.GlobalDrawer` |
| View switcher | 2–5 peer views | `Adw.ViewStack` + `Adw.ViewSwitcher` | `Kirigami.PageRow` / tabs |
| Tabs | Multiple open documents | `Adw.TabView` + `Adw.TabBar` | `QTabWidget` / `Kirigami.PageRow` |
| Focused task | Modal editing or confirmation | `Adw.Dialog` / `Adw.AlertDialog` | `Kirigami.Dialog` / `Kirigami.PromptDialog` |
| Settings | Preferences | `Adw.PreferencesPage` / `Adw.PreferencesDialog` | `KConfigDialog` / `Kirigami.ScrollablePage` |

### Master–detail

The canonical desktop layout: a list on the left, content on the right. On narrow windows, the list becomes the first page and the content slides in.

```text
Wide:    [ sidebar ][ detail                    ]
Narrow:  [ list ] → [ detail ] → back
```

Use `Adw.NavigationSplitView` when the user navigates *into* an item and expects a back button. Use `Adw.OverlaySplitView` when the sidebar is a persistent navigation surface that can collapse into an overlay.

### Sidebars and view switchers

- A **sidebar** is for navigation between sections that persist. Use `Adw.Sidebar` (libadwaita 1.9) or a `Gtk.ListBox` with the `navigation-sidebar` style class.
- A **view switcher** is for 2–5 peer views inside the same context. Use `Adw.ViewSwitcher` in the headerbar, not a row of custom tabs.
- A **tab view** is for multiple open documents. Use `Adw.TabView`; do not reimplement tabs with buttons.

If the sidebar contains more than ~10 items without grouping, the information architecture is probably wrong. Group with sections and labels.

## Make it adaptive

Test at three widths:

| Width | Typical layout |
| --- | --- |
| < 600 px | Single pane; navigation pushes a new page |
| 600–900 px | Collapsed sidebar or two panes with narrow content |
| > 900 px | Sidebar + content, or three panes |

Use `Adw.Breakpoint` to change layout properties at a width threshold. In Blueprint:

```text title="Adaptive split view"
Adw.ApplicationWindow {
  content: Adw.ToolbarView {
    [top]
    Adw.HeaderBar {}

    content: Adw.OverlaySplitView split {
      sidebar: Gtk.ScrolledWindow {
        child: Gtk.ListBox { ... };
      };

      content: Gtk.Stack { ... };
    };
  };

  Adw.Breakpoint {
    condition ("max-width: 600sp")
    setters {
      split.collapsed: true;
    }
  }
}
```

In Python:

```python title="Python / libadwaita"
breakpoint = Adw.Breakpoint.new(
    Adw.BreakpointCondition.parse("max-width: 600sp")
)
breakpoint.add_setter(split, "collapsed", True)
self.add_breakpoint(breakpoint)
```

Do not use breakpoints for everything. Prefer widgets that provide the adaptive primitives (`Adw.OverlaySplitView`, `Adw.NavigationSplitView`, `Adw.ViewStack`), and pair them with a breakpoint when they need to collapse or change structure.

## Window size and state

Wayland does not let apps position windows. Save the size, maximized state, and fullscreen state; let the compositor decide where the window goes.

```python title="Persisting window size with GSettings"
self.settings = Gio.Settings.new("io.github.yourname.Notes")

# Restore the initial size.
self.set_default_size(self.settings.get_int("window-width"), self.settings.get_int("window-height"))

# Save the actual size when the window closes.
def on_close_request(self, _window):
    self.settings.set_int("window-width", self.get_width())
    self.settings.set_int("window-height", self.get_height())
    return False
```

`default-width`/`default-height` bindings only set the initial size; they do not track a user resize.

Provide a sensible default size for the first launch, and a minimum size that still works at 200% scaling. Do not force a size that only fits your monitor.

## Empty, loading, and error states

Every view that can be empty needs three states:

| State | What to show |
| --- | --- |
| Empty | What this view is for, why it is empty, and one primary action |
| Loading | A skeleton or spinner that does not shift the layout; cancel if long |
| Error | What failed, why, and what the user can do; a retry action |

Use `Adw.StatusPage` for empty and error states. It gives you the right spacing, icon size, and typography.

```python title="Empty state"
page = Adw.StatusPage()
page.set_icon_name("document-edit-symbolic")
page.set_title("No notes yet")
page.set_description("Create your first note to get started.")
button = Gtk.Button(label="New note")
button.add_css_class("suggested-action")
page.set_child(button)
```

Do not use a blank white window with a tiny "No data" label. The empty state is the first impression of the feature.

## Settings

Settings are part of the UI, not a config file with a window around it.

- Group by task: "Appearance", "Editing", "Sync", "Privacy".
- Use `Adw.PreferencesPage` with `Adw.PreferencesGroup` and rows (`Adw.SwitchRow`, `Adw.EntryRow`, `Adw.SpinRow`, `Adw.ComboRow`).
- Apply changes immediately; no "Save" button.
- Provide search if there are more than ~15 settings.
- Use a separate dialog for window-specific settings; use the app's preferences for global settings.
- Provide "Reset to defaults" and a way to export/import settings.

On KDE, use `KConfigDialog` or a Kirigami settings page with the same grouping principles.

## Dialogs

Use a dialog when the user must finish a focused task before returning, or when a decision is destructive and irreversible.

- `Adw.AlertDialog` for confirmations and simple choices.
- `Adw.Dialog` for a small form or a focused task.
- `Adw.PreferencesDialog` for settings that belong to a window.
- Avoid dialogs that merely display information; use inline UI.
- Do not stack dialogs. If a dialog opens another dialog, reconsider the flow.
- Destructive actions use a clear verb ("Delete note"), not "OK".
- The escape route is always available (`Esc`), and the primary action is reachable with `Enter`.

## Onboarding

Keep it to one screen or none. The app should be usable immediately; onboarding explains the *why*, not the *how*.

- Show the core value in one sentence.
- Offer one primary action ("Create your first note").
- Do not require an account, a tour, or a permission before the user sees value.
- Explain permissions in context, when the feature is used.
- Make onboarding dismissible and re-openable from Help/About.

## Menus and discoverability

- Put primary actions in the headerbar as buttons with labels or well-known icons.
- Put secondary actions in the primary menu (the hamburger or gear), grouped with separators.
- Show shortcuts in menu items.
- Use `Gtk.PopoverMenu` / `Adw.HeaderBar` conventions; do not build a custom dropdown.
- Do not hide the only way to do something in a context menu. Context menus are accelerators, not the primary interface.

## Kirigami notes

If you are building for KDE:

- Use `Kirigami.ApplicationWindow` and `Kirigami.Page`.
- `Kirigami.PageRow` gives you adaptive master–detail with a back button on narrow screens.
- `Kirigami.OverlaySheet` is the mobile-friendly alternative to a dialog; use it for quick actions, not for long forms.
- Use `Kirigami.Units.gridUnit` for spacing instead of hardcoded pixels.
- Use `Kirigami.Theme` colors; respect the system color scheme.
- Use Breeze icons and `Kirigami.Icon` for consistency.

## Layout checklist

- ☐ The navigation model matches the content: list/detail, sections, documents, or a single task.
- ☐ The app works at 360 px, 720 px, and 1280 px widths.
- ☐ The sidebar collapses or becomes a navigation page on narrow windows.
- ☐ Window size and maximized state persist; position does not.
- ☐ Empty, loading, and error states exist for every dynamic view.
- ☐ Settings use `Adw.PreferencesPage` / `KConfigDialog`, grouped by task.
- ☐ Dialogs are focused, dismissible, and never stacked.
- ☐ Onboarding is one screen and skippable.
- ☐ Primary actions are visible; secondary actions are in a menu with shortcuts.
- ☐ The layout works at 200% text and display scaling.

Next: [Interaction & Feedback](/design/interaction/) — keyboard, focus, undo, search, and the small behaviors that make an app feel alive.
