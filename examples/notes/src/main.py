#!/usr/bin/env python3

import json
import pathlib
import sys

import gi

gi.require_version("Gtk", "4.0")
gi.require_version("Adw", "1")

from gi.repository import Adw, Gio, GLib, Gtk


APP_ID = "io.github.yourname.Notes"


class NotesApplication(Adw.Application):
    def __init__(self):
        super().__init__(application_id=APP_ID)
        self.connect("activate", self.on_activate)
        self.set_accels_for_action("win.new-note", ["<Control>n"])

    def on_activate(self, _app):
        window = NotesWindow(application=self)
        window.present()


class NotesWindow(Adw.ApplicationWindow):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.set_title("Notes")
        self.set_default_size(980, 680)

        self.data_file = pathlib.Path(GLib.get_user_data_dir()) / "notes" / "notes.json"
        self.notes = self.load_notes()
        self.rows = {}

        new_action = Gio.SimpleAction.new("new-note", None)
        new_action.connect("activate", self.on_new_note)
        self.add_action(new_action)

        about_action = Gio.SimpleAction.new("about", None)
        about_action.connect("activate", self.on_about)
        self.add_action(about_action)

        header = Adw.HeaderBar()

        new_button = Gtk.Button(icon_name="list-add-symbolic")
        new_button.set_tooltip_text("New note (Ctrl+N)")
        new_button.set_action_name("win.new-note")
        new_button.add_css_class("suggested-action")
        header.pack_start(new_button)

        menu = Gio.Menu()
        menu.append("About Notes", "win.about")
        menu_button = Gtk.MenuButton(icon_name="open-menu-symbolic", menu_model=menu)
        menu_button.set_tooltip_text("Main menu")
        header.pack_end(menu_button)

        self.listbox = Gtk.ListBox()
        self.listbox.set_selection_mode(Gtk.SelectionMode.SINGLE)
        self.listbox.add_css_class("navigation-sidebar")
        self.listbox.connect("row-selected", self.on_row_selected)

        sidebar_scroller = Gtk.ScrolledWindow()
        sidebar_scroller.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC)
        sidebar_scroller.set_child(self.listbox)
        sidebar_scroller.set_vexpand(True)

        self.title_label = Gtk.Label(xalign=0)
        self.title_label.add_css_class("title-2")

        self.body_label = Gtk.Label(xalign=0, wrap=True, selectable=True)
        self.body_label.add_css_class("body")

        content_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=12)
        content_box.set_margin_top(30)
        content_box.set_margin_bottom(30)
        content_box.set_margin_start(36)
        content_box.set_margin_end(36)
        content_box.append(self.title_label)
        content_box.append(self.body_label)

        content_scroller = Gtk.ScrolledWindow()
        content_scroller.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC)
        content_scroller.set_child(content_box)
        content_scroller.set_vexpand(True)

        empty = Adw.StatusPage()
        empty.set_icon_name("document-edit-symbolic")
        empty.set_title("No note selected")
        empty.set_description("Select a note or create a new one with Ctrl+N.")
        empty.set_vexpand(True)

        self.stack = Gtk.Stack()
        self.stack.set_transition_type(Gtk.StackTransitionType.CROSSFADE)
        self.stack.add_named(empty, "empty")
        self.stack.add_named(content_scroller, "editor")
        self.stack.set_visible_child_name("empty")

        split = Adw.OverlaySplitView()
        split.set_sidebar(sidebar_scroller)
        split.set_content(self.stack)
        split.set_min_sidebar_width(240)
        split.set_max_sidebar_width(320)
        split.set_show_sidebar(True)

        toolbar = Adw.ToolbarView()
        toolbar.add_top_bar(header)
        toolbar.set_content(split)
        self.set_content(toolbar)

        self.refresh()
        self.connect("close-request", self.on_close_request)

    def load_notes(self):
        try:
            data = json.loads(self.data_file.read_text(encoding="utf-8"))
            if isinstance(data, list):
                return data
        except (FileNotFoundError, json.JSONDecodeError):
            pass
        return [
            {
                "title": "Welcome to Notes",
                "body": "This note lives in your XDG data directory.\n\n"
                "It survives restarts, works inside a Flatpak sandbox, "
                "and never writes next to the application binary.",
            },
            {
                "title": "Keyboard first",
                "body": "Press Ctrl+N to create a note. Every action in a "
                "native app should be reachable without a mouse.",
            },
        ]

    def save_notes(self):
        self.data_file.parent.mkdir(parents=True, exist_ok=True)
        temp = self.data_file.with_suffix(".tmp")
        temp.write_text(
            json.dumps(self.notes, indent=2, ensure_ascii=False), encoding="utf-8"
        )
        temp.replace(self.data_file)

    def refresh(self):
        child = self.listbox.get_first_child()
        while child is not None:
            self.listbox.remove(child)
            child = self.listbox.get_first_child()

        self.rows.clear()
        for index, note in enumerate(self.notes):
            row = Adw.ActionRow(
                title=note["title"], subtitle=note["body"].splitlines()[0]
            )
            row.set_subtitle_lines(1)
            row.set_activatable(True)
            self.listbox.append(row)
            self.rows[row] = index

        first = self.listbox.get_row_at_index(0)
        if first is not None:
            self.listbox.select_row(first)

    def on_row_selected(self, _listbox, row):
        if row is None or row not in self.rows:
            return
        note = self.notes[self.rows[row]]
        self.title_label.set_text(note["title"])
        self.body_label.set_text(note["body"])
        self.stack.set_visible_child_name("editor")

    def on_new_note(self, _action, _param):
        self.notes.insert(0, {"title": "Untitled note", "body": "Start writing…"})
        self.save_notes()
        self.refresh()

    def on_about(self, _action, _param):
        about = Adw.AboutDialog(
            application_name="Notes",
            application_icon=APP_ID,
            developer_name="Your Name",
            version="0.1.0",
            developers=["Your Name <you@example.com>"],
            copyright="© 2026 Your Name",
        )
        about.present(self)

    def on_close_request(self, _window):
        self.save_notes()
        return False


if __name__ == "__main__":
    app = NotesApplication()
    if "--quit-after-startup" in sys.argv:
        GLib.timeout_add(800, app.quit)
    app.run(None)
