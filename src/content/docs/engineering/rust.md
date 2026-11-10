---
title: Rust on the Desktop
description: Rust desktop options compared — gtk-rs, Relm4, Iced, Slint, libcosmic — with a complete gtk-rs project, actions, async patterns, testing, accessibility, and Flatpak packaging.
---

Rust is a strong choice for Linux desktop apps. GNOME's Loupe and Resources are written in Rust, COSMIC is built on Rust, and the gtk-rs bindings are mature enough for production. You get memory safety, fearless concurrency, and a packaging story that fits Flatpak well.

The [gtk-rs](https://gtk-rs.org/gtk4-rs/stable/latest/book/) and [Relm4](https://relm4.org/book/stable/) ecosystems are active; the trade-offs are real: longer compile times, a smaller pool of UI contributors, and a toolkit object model that does not map cleanly to Rust's ownership rules. None of them are blockers if you choose the right layer.

Ubuntu documents both the archive Rust toolchain and the `rustup` path, along with the versions available in each release. Use the [Ubuntu Rust guide](https://ubuntu.com/developers/docs/toolchains/rust/) when you need an install path, and the [version reference](https://ubuntu.com/developers/docs/reference/availability/rust/) before you promise support for an older LTS.

## The options

| Stack | Model | Best for | Notes |
| --- | --- | --- | --- |
| **gtk-rs + libadwaita-rs** | Direct GTK bindings | GNOME-native apps | Most native; object model is GTK's |
| **Relm4** | Component/message architecture on gtk-rs | GNOME apps with complex state | Ergonomic; good docs and examples |
| **Iced** | Elm-inspired, custom renderer | Cross-platform tools, games-adjacent UIs | Not GNOME-native; smaller ecosystem |
| **Slint** | Declarative UI, custom renderer | Embedded and cross-platform products | Licensing depends on use |
| **libcosmic** | COSMIC toolkit | COSMIC-native apps | Young, tied to System76's ecosystem |

For a GNOME/Ubuntu app, use **gtk-rs + libadwaita-rs**, or **Relm4** if you want a structured message loop. For a custom-rendered cross-platform tool, evaluate Iced or Slint before committing.

### Version and feature matrix

| Crate | Version in the 2026 stack | Features to enable |
| --- | --- | --- |
| `gtk4` | 0.11.x | `v4_22` or `gnome_50` |
| `libadwaita` | 0.9.x | `v1_9` |
| `relm4` | 0.11.x | Match the gtk4 feature set |
| `iced` | 0.14.x | Default renderer; evaluate accessibility yourself |
| `slint` | 1.18.x | Check the license for your use |
| `libcosmic` | git-pinned | Track the COSMIC release you target |

Feature flags are compile-time. If you enable `v4_22`/`v1_9`, the binary will not run against an older GTK/libadwaita; use runtime checks only if you build separate compatibility paths.

## Project skeleton

```text
notes/
├── Cargo.toml
├── src/
│   ├── main.rs
│   └── note.rs
├── data/
│   ├── io.github.yourname.Notes.desktop
│   ├── io.github.yourname.Notes.metainfo.xml
│   └── io.github.yourname.Notes.svg
└── io.github.yourname.Notes.yml
```

Keep the domain logic in its own module so it can be tested without a display. `main.rs` owns the application and window; `note.rs` owns the data rules.

## A minimal gtk-rs app

```toml title="Cargo.toml"
[package]
name = "notes"
version = "0.1.0"
edition = "2024"

[dependencies]
gtk = { package = "gtk4", version = "0.11", features = ["v4_22"] }
libadwaita = { version = "0.9", features = ["v1_9"] }
```

```rust title="src/note.rs"
pub fn normalize_title(value: &str) -> String {
    value.trim().to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn trims_surrounding_whitespace() {
        assert_eq!(normalize_title("  Buy milk  "), "Buy milk");
    }
}
```

```rust title="src/main.rs"
mod note;

use adw::prelude::*;
use gtk::{gio, glib};

fn main() -> glib::ExitCode {
    let app = adw::Application::builder()
        .application_id("io.github.yourname.Notes")
        .build();

    app.connect_activate(build_ui);
    app.run()
}

fn build_ui(app: &adw::Application) {
    let window = adw::ApplicationWindow::builder()
        .application(app)
        .title("Notes")
        .default_width(980)
        .default_height(680)
        .build();

    let header = adw::HeaderBar::new();

    let add_button = gtk::Button::builder()
        .icon_name("list-add-symbolic")
        .tooltip_text("New note")
        .action_name("win.new-note")
        .build();
    add_button.add_css_class("suggested-action");
    header.pack_start(&add_button);

    let list = gtk::ListBox::new();
    list.set_selection_mode(gtk::SelectionMode::Single);
    list.add_css_class("boxed-list");

    let scroller = gtk::ScrolledWindow::builder()
        .hscrollbar_policy(gtk::PolicyType::Never)
        .vexpand(true)
        .child(&list)
        .build();

    let toolbar = adw::ToolbarView::new();
    toolbar.add_top_bar(&header);
    toolbar.set_content(Some(&scroller));
    window.set_content(Some(&toolbar));

    let new_note = gio::SimpleAction::new("new-note", None);
    new_note.connect_activate(glib::clone!(
        #[weak]
        list,
        move |_, _| {
            let row = adw::ActionRow::builder()
                .title(note::normalize_title("Untitled note"))
                .build();
            list.append(&row);
        }
    ));
    window.add_action(&new_note);
    app.set_accels_for_action("win.new-note", &["<Control>n"]);

    window.present();
}
```

This app keeps notes in memory. The [first-app tutorial](/start/first-app/) shows the XDG persistence, atomic-write, and Flatpak parts; replace the in-memory list with `gio::File` or SQLite when you add storage. The Rust example is illustrative: build it against the crate versions in the table above and the GTK/libadwaita development packages for your distribution.

## State and actions

The window owns the `gio::SimpleAction`; the button activates it, and the action appends to the list. That is the smallest useful boundary: the widget tree does not own the data, and a test can exercise the data rule without a window. For a larger app, move the state into a struct and pass messages instead of mutating widgets from several callbacks. Relm4's component model below is one way to structure that.

## Testing

`cargo test` runs the `note` module's unit test without a display. Add more tests around the pure data layer before reaching for a UI test:

```bash title="Terminal"
cargo test
cargo clippy --all-targets -- -D warnings
cargo fmt --check
```

For the UI, drive the app through AT-SPI with [Dogtail](https://gitlab.com/dogtail/dogtail), or use the GTK test harness under a throwaway compositor. Run session-bus tests inside `dbus-run-session`; keep `weston --headless` or the distribution's headless GNOME session in CI. `cargo llvm-cov` adds coverage, and the [Testing](/engineering/testing/) chapter covers the full matrix.

## Accessibility

gtk-rs exposes GTK's accessibility semantics for native widgets. Set labels on icon-only controls and custom widgets:

```rust title="Accessible icon button"
use gtk::prelude::*;

let button = gtk::Button::builder()
    .icon_name("list-add-symbolic")
    .build();
button.update_property(&[
    gtk::accessible::Property::Label("New note"),
    gtk::accessible::Property::Description("Create a new note"),
]);
```

Test with Orca and Accerciser, at 200% text scaling and in high-contrast mode. Do not treat a tooltip as the accessible name; use `gtk::accessible::Property::Label` and, for custom widgets, an explicit `AccessibleRole`.

## Ownership and the GTK object model

GTK objects are reference-counted and not `Send`. Rust's ownership rules still apply to your data, but the widget graph is shared.

- Keep UI objects on the main thread.
- Use `glib::clone!` with weak references for signal handlers to avoid cycles.
- Store application state in your own struct, not in a web of `Rc<RefCell<>>`.
- Use `Rc<RefCell<T>>` only when you genuinely need shared mutable state on the main thread.
- Prefer messages/channels over shared mutable state across threads.

```rust title="Weak reference in a signal handler"
let label = gtk::Label::new(Some("0"));
button.connect_clicked(glib::clone!(
    #[weak] label,
    move |_| {
        let count = label.text().parse::<i32>().unwrap_or(0) + 1;
        label.set_text(&count.to_string());
    }
));
```

If the label is dropped, the handler does nothing instead of keeping the whole window alive.

## Relm4

Relm4 gives you a component model: `init`, `update`, and a `view!` macro. It is a good fit for apps with clear messages and state transitions.

```rust title="Relm4 skeleton"
use relm4::gtk;
use relm4::prelude::*;

struct AppModel {
    count: u32,
}

#[derive(Debug)]
enum AppMsg {
    Increment,
}

#[relm4::component]
impl SimpleComponent for AppModel {
    type Init = ();
    type Input = AppMsg;
    type Output = ();

    view! {
        gtk::ApplicationWindow {
            set_title: Some("Notes"),
            set_default_width: 980,
            set_default_height: 680,
            gtk::Button {
                set_label: "Increment",
                connect_clicked => AppMsg::Increment,
            },
            gtk::Label {
                set_label: &model.count.to_string(),
            },
        }
    }

    fn init(
        _init: Self::Init,
        root: Self::Root,
        sender: ComponentSender<Self>,
    ) -> ComponentParts<Self> {
        let model = AppModel { count: 0 };
        let widgets = view_output!();
        ComponentParts { model, widgets }
    }

    fn update(&mut self, msg: AppMsg, _sender: ComponentSender<Self>) {
        match msg {
            AppMsg::Increment => self.count += 1,
        }
    }
}
```

Relm4's macros and component lifecycle are stable, but the API evolves. Pin the version and read the book for your release.

## Async work

Rust async runtimes and the GLib main loop are separate worlds. Bridge them deliberately.

- Use `glib::MainContext::spawn_local` for futures that touch GTK objects.
- Use `async-channel` or `tokio::sync::mpsc` to send results from a Tokio runtime to the main thread.
- Do not block the main loop with `block_on`.
- Use `gio` async APIs for file and network I/O where possible.
- Cancel work when the view closes; use `gio::Cancellable`, a `CancellationToken`, or drop the future.
- Send results back with `async-channel` or a similar channel; do not share GTK objects across threads.

```rust title="Spawning UI-bound async work"
glib::MainContext::default().spawn_local(async move {
    let contents = gio::File::for_path(path)
        .load_contents_future()
        .await
        .map(|(bytes, _etag)| bytes);

    match contents {
        Ok(bytes) => label.set_text(&String::from_utf8_lossy(&bytes)),
        Err(error) => eprintln!("load failed: {error}"),
    }
});
```

## Packaging with Flatpak

Flathub builds have no network access. Vendor Rust dependencies and provide a source list.

```bash title="Terminal"
# Generate a Flatpak source list from Cargo.lock
python3 flatpak-cargo-generator.py Cargo.lock -o cargo-sources.json
```

```yaml title="Flatpak module"
build-options:
  append-path: /usr/lib/sdk/rust-stable/bin
  env:
    CARGO_HOME: /run/build/notes/cargo
    CARGO_NET_OFFLINE: "true"

sdk-extensions:
  - org.freedesktop.Sdk.Extension.rust-stable

modules:
  - name: notes
    buildsystem: simple
    build-commands:
      - cargo build --release --offline
      - install -Dm755 target/release/notes /app/bin/notes
      - install -Dm644 data/io.github.yourname.Notes.desktop /app/share/applications/io.github.yourname.Notes.desktop
      - install -Dm644 data/io.github.yourname.Notes.metainfo.xml /app/share/metainfo/io.github.yourname.Notes.metainfo.xml
      - install -Dm644 data/io.github.yourname.Notes.svg /app/share/icons/hicolor/scalable/apps/io.github.yourname.Notes.svg
    sources:
      - type: dir
        path: .
      - cargo-sources.json
```

[`type: dir`](https://docs.flatpak.org/en/latest/module-sources.html#dir) is for local development. A Flathub submission uses a `git` source pinned to a tag/commit or an `archive` source with a checksum. The runtime does not include the Rust toolchain; the SDK extension and `CARGO_HOME` above are required for an offline build.

Use the `org.gnome.Platform` runtime for gtk-rs/libadwaita apps. The runtime includes GTK and libadwaita; your binary links against them.

## Profiling and release checks

- `perf`, `heaptrack`, and `cargo flamegraph` for CPU, allocation, and startup profiles.
- `cargo llvm-cov` for coverage; `insta`, `proptest`, and `trybuild` for snapshot, property, and compile-fail tests.
- `cargo audit`/`cargo deny` for advisories and license policy; generate an SBOM for releases.
- Pin the Rust toolchain (`rust-toolchain.toml`) and the Flatpak SDK extension version.
- Measure cold start with `hyperfine`; keep the first window under your budget before optimizing details.

## Common pitfalls

| Pitfall | Fix |
| --- | --- |
| GTK object sent across threads | Keep it on the main thread; send data, not widgets |
| `Rc` cycle keeps the window alive | Use weak references in signal handlers |
| Blocking the main loop with `block_on` | Use `spawn_local` or a worker + channel |
| Enabling GTK features not in the runtime | Match feature flags to the target runtime |
| Missing Cargo sources in Flatpak | Generate `cargo-sources.json` |
| Long compile times in CI | Cache `target/`, use `sccache` |
| Assuming `Send` for UI state | Keep UI state local; use messages across threads |
| Ignoring accessibility | gtk-rs exposes GTK semantics; set labels and roles |


## Sources

- [gtk-rs book](https://gtk-rs.org/gtk4-rs/stable/latest/book/)
- [gtk4 crate](https://docs.rs/gtk4/)
- [libadwaita crate](https://docs.rs/libadwaita/)
- [Relm4 book](https://relm4.org/book/stable/)
- [Flatpak Rust sources](https://github.com/flatpak/flatpak-builder-tools/blob/master/cargo/README.md)
- [cargo-audit](https://rustsec.org/)
- [cargo-deny](https://embarkstudios.github.io/cargo-deny/)

Next: [Performance](/engineering/performance/) — how to measure and defend the numbers users feel.
