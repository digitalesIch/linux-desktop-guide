---
title: Rust on the Desktop
description: Rust desktop options compared — gtk-rs, Relm4, Iced, Slint, libcosmic — with async patterns, memory ownership, Flatpak packaging, testing, and profiling.
---

Rust is a strong choice for Linux desktop apps. GNOME's Loupe and Resources are written in Rust, COSMIC is built on Rust, and the gtk-rs bindings are mature enough for production. You get memory safety, fearless concurrency, and a packaging story that fits Flatpak well.

The trade-offs are real: longer compile times, a smaller pool of UI contributors, and a toolkit object model that does not map cleanly to Rust's ownership rules. None of them are blockers if you choose the right layer.

Ubuntu documents both the archive Rust toolchain and the `rustup` path, along with the versions available in each release. Use the [Ubuntu Rust guide](https://ubuntu.com/developers/docs/toolchains/rust/) when you need an install path, and the [version reference](https://documentation.ubuntu.com/ubuntu-for-developers/reference/availability/rust/) before you promise support for an older LTS.

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

## A minimal gtk-rs app

```rust title="src/main.rs"
use adw::prelude::*;
use gtk::{gio, glib};

fn main() -> glib::ExitCode {
    let app = adw::Application::builder()
        .application_id("io.github.yourname.Notes")
        .flags(gio::ApplicationFlags::DEFAULT_FLAGS)
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

    let new_button = gtk::Button::builder()
        .icon_name("list-add-symbolic")
        .tooltip_text("New note")
        .build();
    new_button.add_css_class("suggested-action");
    header.pack_start(&new_button);

    let toolbar = adw::ToolbarView::new();
    toolbar.add_top_bar(&header);

    let label = gtk::Label::builder()
        .label("Select a note")
        .vexpand(true)
        .build();
    label.add_css_class("dim-label");
    toolbar.set_content(Some(&label));

    window.set_content(Some(&toolbar));
    window.present();
}
```

`Cargo.toml`:

```toml title="Cargo.toml"
[package]
name = "notes"
version = "0.1.0"
edition = "2024"

[dependencies]
gtk = { package = "gtk4", version = "0.11", features = ["v4_22"] }
libadwaita = { version = "0.9", features = ["v1_9"] }
```

Version numbers move; use the latest compatible releases and the feature flags for the minimum GTK/libadwaita version you support. Do not enable a feature you cannot run on your target distro.

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

`type: dir` is for local development. A Flathub submission uses a `git` source pinned to a tag/commit or an `archive` source with a checksum. The runtime does not include the Rust toolchain; the SDK extension and `CARGO_HOME` above are required for an offline build.

Use the `org.gnome.Platform` runtime for gtk-rs/libadwaita apps. The runtime includes GTK and libadwaita; your binary links against them.

## Testing and profiling

- `cargo test` for units and integration tests.
- `insta` for snapshot tests of serialized output.
- `proptest` for parsers and state machines.
- `trybuild` for compile-fail tests of macros.
- UI tests via `dogtail` or AT-SPI, driven from outside the process.
- `cargo llvm-cov` for coverage.
- `perf`, `heaptrack`, and `cargo flamegraph` for profiling.
- `cargo clippy -- -D warnings` and `cargo fmt --check` in CI.
- `cargo audit`/`cargo deny` for advisories and license policy; generate an SBOM for releases.
- Pin the Rust toolchain (`rust-toolchain.toml`) and the Flatpak SDK extension version.

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

Next: [Performance](/engineering/performance/) — how to measure and defend the numbers users feel.
