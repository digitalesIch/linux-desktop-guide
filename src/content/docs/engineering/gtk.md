---
title: GTK & libadwaita
description: "A practical deep dive into GTK 4.22 and libadwaita 1.9: application structure, Blueprint UI, adaptive widgets, actions, models, settings, async work, custom widgets, and debugging."
---

GTK 4 is the toolkit behind GNOME and the default native stack on Ubuntu 26.04 LTS. libadwaita adds the GNOME design system: headerbars, adaptive split views, view switchers, preferences pages, dialogs, toasts, and the Adwaita style.

The combination is opinionated, and that is the point. If you are building for GNOME/Ubuntu, it gives you the shortest path to native behavior: accessibility, input methods, Wayland, portals, and a coherent visual language.

:::note[Versions in Ubuntu 26.04]
GTK 4.22, libadwaita 1.9, GNOME 50. GTK 4 is the stable line; GTK 3 is maintenance-only. Target GTK 4.10+ APIs unless you need to support an older distro, and guard newer APIs at runtime.
:::

## The application skeleton

Every GTK app starts with an application object and a window. Use `Adw.Application`, not a bare `Gtk.Application`, so libadwaita's style and helpers are initialized.

```python title="src/main.py"
import gi
gi.require_version("Gtk", "4.0")
gi.require_version("Adw", "1")
from gi.repository import Adw, Gio, Gtk

class NotesApp(Adw.Application):
    def __init__(self):
        super().__init__(
            application_id="io.github.yourname.Notes",
            flags=Gio.ApplicationFlags.DEFAULT_FLAGS,
        )
        self.connect("activate", self.on_activate)

    def on_activate(self, _app):
        window = NotesWindow(application=self)
        window.present()

if __name__ == "__main__":
    NotesApp().run(None)
```

`Gtk.Application` handles single-instance behavior, D-Bus activation, and the main loop. Do not call `Gtk.init()` manually or create a second `Gtk.Application`.

## Blueprint: declarative UI

Blueprint is a readable UI description language that compiles to GTK `.ui` files. It is easier to review than XML and avoids building large widget trees in code.

```text title="src/window.blp"
using Gtk 4.0;
using Adw 1;

menu main_menu {
  section {
    item {
      label: _("About Notes");
      action: "win.about";
    }
  }
}

template $NotesWindow: Adw.ApplicationWindow {
  title: _("Notes");
  default-width: 980;
  default-height: 680;

  content: Adw.ToolbarView {
    [top]
    Adw.HeaderBar {
      [start]
      Gtk.Button {
        icon-name: "list-add-symbolic";
        tooltip-text: _("New note");
        action-name: "win.new-note";
        styles ["suggested-action"]
      }

      [end]
      Gtk.MenuButton {
        icon-name: "open-menu-symbolic";
        menu-model: main_menu;
      }
    };

    content: Adw.OverlaySplitView split {
      sidebar: Gtk.ScrolledWindow {
        child: Gtk.ListBox note_list {
          styles ["navigation-sidebar"]
        };
      };

      content: Gtk.Stack content_stack {
        Gtk.ScrolledWindow {
          child: Gtk.Label {
            label: _("Select a note");
            styles ["dim-label"];
          };
        }
      };
    };
  };
}
```

Compile it:

```bash title="Terminal"
blueprint-compiler compile src/window.blp --output src/window.ui
```

Bundle the `.ui` file into a GResource so it is available at runtime:

```xml title="src/notes.gresource.xml"
<?xml version="1.0" encoding="UTF-8"?>
<gresources>
  <gresource prefix="/io/github/yourname/Notes">
    <file>window.ui</file>
  </gresource>
</gresources>
```

```bash title="Terminal"
glib-compile-resources src/notes.gresource.xml \
  --sourcedir=src --target=src/notes.gresource
```

Then bind the template in Python:

```python title="src/window.py"
@Gtk.Template(resource_path="/io/github/yourname/Notes/window.ui")
class NotesWindow(Adw.ApplicationWindow):
    __gtype_name__ = "NotesWindow"

    note_list = Gtk.Template.Child()
    content_stack = Gtk.Template.Child()

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.note_list.connect("row-selected", self.on_row_selected)
```

For Meson, compile Blueprint and GResource as custom targets. Keep the `.blp` as the source of truth; check in the generated `.ui` only if your build system needs it.

## The widget vocabulary

| Need | Widget |
| --- | --- |
| Window with headerbar | `Adw.ApplicationWindow` + `Adw.HeaderBar` |
| Toolbar + content | `Adw.ToolbarView` |
| Collapsible sidebar | `Adw.OverlaySplitView` |
| Master–detail navigation | `Adw.NavigationSplitView` |
| Peer views | `Adw.ViewStack` + `Adw.ViewSwitcher` |
| Sidebar navigation | `Adw.Sidebar` (1.9) or `Gtk.ListBox` |
| Tabs | `Adw.TabView` + `Adw.TabBar` |
| Settings | `Adw.PreferencesPage` + rows |
| Dialog | `Adw.Dialog`, `Adw.AlertDialog` |
| Toast | `Adw.ToastOverlay` + `Adw.Toast` |
| Empty/error state | `Adw.StatusPage` |
| Inline banner | `Adw.Banner` |
| List with model | `Gtk.ListView` + `Gio.ListStore` |
| Search | `Gtk.SearchEntry` + `Gtk.FilterListModel` |
| Form row | `Adw.EntryRow`, `Adw.SwitchRow`, `Adw.SpinRow`, `Adw.ComboRow` |
| Progress | `Gtk.ProgressBar`, `Adw.Spinner` |

Prefer these over custom compositions. They carry spacing, accessibility, keyboard behavior, and theme integration.

## Actions and shortcuts

Use `Gio.Action` for commands. Actions can be bound to buttons, menu items, and shortcuts, and they show up in the shortcuts dialog.

```python title="Window actions"
new_action = Gio.SimpleAction.new("new-note", None)
new_action.connect("activate", self.on_new_note)
self.add_action(new_action)

app.set_accels_for_action("win.new-note", ["<Control>n"])
```

```text title="Binding a button to an action"
Gtk.Button {
  icon-name: "list-add-symbolic";
  action-name: "win.new-note";
}
```

Use `app.` for application-wide actions (quit, about, preferences) and `win.` for window-scoped actions.

## Lists and models

Do not build thousands of widgets. Use a model and a `Gtk.ListView` with a factory.

```python title="A list backed by Gio.ListStore"
store = Gio.ListStore.new(NoteObject)
for note in notes:
    store.append(NoteObject(note))

selection = Gtk.SingleSelection.new(store)
list_view = Gtk.ListView.new(selection, Gtk.SignalListItemFactory())
```

For filtering and sorting, wrap the model:

```python
filter_model = Gtk.FilterListModel.new(store, filter)
sort_model = Gtk.SortListModel.new(filter_model, sorter)
selection = Gtk.SingleSelection.new(sort_model)
```

A `Gtk.SignalListItemFactory` binds a row widget to an item. Reuse rows; do not create a new widget per item on every scroll.

## Settings

Use GSettings for preferences that belong to the desktop. Define a schema, install it, and bind properties.

```python title="Binding window size"
settings = Gio.Settings.new("io.github.yourname.Notes")
settings.bind("window-width", self, "default-width", Gio.SettingsBindFlags.DEFAULT)
settings.bind("window-height", self, "default-height", Gio.SettingsBindFlags.DEFAULT)
```

Build the preferences UI with `Adw.PreferencesPage`:

```text title="Preferences page"
Adw.PreferencesPage {
  Adw.PreferencesGroup {
    title: _("Appearance");

    Adw.SwitchRow dark_mode {
      title: _("Follow system color scheme");
    }
  }
}
```

Apply changes immediately. Provide a reset action. Do not write config files behind the user's back.

## Async work

GTK runs on the GLib main loop. Use async I/O and return to the main thread.

```python title="Async file load"
def load_note(self, path):
    self.cancellable = Gio.Cancellable()
    file = Gio.File.new_for_path(path)
    file.load_contents_async(self.cancellable, self.on_loaded)

def on_loaded(self, file, result):
    try:
        ok, contents, _etag = file.load_contents_finish(result)
    except GLib.Error as error:
        if not error.matches(Gio.io_error_quark(), Gio.IOErrorEnum.CANCELLED):
            self.show_error(error)
        return
    self.apply_contents(contents)
```

For CPU-bound work, use a worker thread and deliver the result with `GLib.idle_add`. Do not touch GTK objects from the worker.

## Custom widgets

Subclass a widget when the behavior is genuinely new. Compose existing widgets when it is not.

- Override `do_measure` and `do_snapshot` for custom drawing (GTK 4, not `size_allocate`/`draw`).
- Implement `Gtk.Accessible` semantics: role, label, state.
- Respect the style context and high-contrast mode.
- Test at 200% scaling and with RTL.
- Prefer `Gtk.DrawingArea` + a model for charts, not a wall of labels.

## CSS and resources

Use libadwaita's named colors and style classes. Custom CSS should be small.

```python title="Loading a custom stylesheet"
provider = Gtk.CssProvider()
provider.load_from_resource("/io/github/yourname/Notes/style.css")
Gtk.StyleContext.add_provider_for_display(
    Gdk.Display.get_default(),
    provider,
    Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION,
)
```

```css title="style.css"
.app-badge {
  background-color: alpha(@accent_bg_color, 0.15);
  color: @accent_color;
  border-radius: 6px;
  padding: 2px 8px;
  font-weight: 600;
}
```

Do not target internal widget nodes or ship a full theme. libadwaita 1.9 deprecates the autoloaded `style-dark.css`, `style-hc.css`, and `style-hc-dark.css`; use `style.css` with `@media (prefers-color-scheme: dark)` and `prefers-contrast` instead.

## Debugging

| Tool | Use |
| --- | --- |
| `GTK_DEBUG=interactive` | Open the GTK Inspector |
| `GTK_DEBUG=actions` | Log action activation |
| `GTK_DEBUG=layout` | Show layout diagnostics |
| `GTK_DEBUG=builder` | Catch deprecated builder patterns |
| `GTK_DEBUG=help` | List all debug options |
| `gtk4-widget-factory` | Exercise every widget and state |
| `gtk4-demo` | Reference implementations |
| `GSK_RENDERER=help` | List renderer options |

Use the Inspector to check CSS, layout, accessibility, and render nodes. It is the fastest way to find why a widget is the wrong size.

## Common pitfalls

| Pitfall | Fix |
| --- | --- |
| `Gtk.init()` called manually | Let `Gtk.Application` initialize GTK |
| Window never appears | Call `present()` after creating it |
| Widget not visible | GTK 4 widgets are visible by default; check parent and size |
| `pack_start` on a `Gtk.Box` | Use `append()` / `prepend()` in GTK 4 |
| Blocking the main loop | Use async APIs or a worker |
| Touching widgets from a thread | Return to the main thread first |
| CSS targets internals | Use public style classes and named colors |
| Hardcoded font sizes | Use `.title-*`, `.heading`, `.body`, `.caption` |
| Missing accessible label | Set `Gtk.AccessibleProperty.LABEL` |
| Custom titlebar breaks tiling | Use `Adw.HeaderBar` and toolkit window controls |
| Rebuilding rows on scroll | Use `Gtk.ListView` + a factory |

Next: [Qt & Kirigami](/engineering/qt/) — the KDE-native stack with the same architectural discipline.
