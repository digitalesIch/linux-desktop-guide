---
title: Choose Your Stack
description: GTK 4 + libadwaita, Qt 6 + Kirigami, Rust, Python, or web tech? A practical comparison of Linux desktop stacks, what they are good at, and where they stop feeling native.
---

There is no single "Linux SDK". There are several mature stacks, each with a different center of gravity. The right choice is the one your team can maintain for five years, on the desktop your users actually run.

GTK and Qt are both excellent. Rust is a strong default for new apps, but not a requirement. Web technology can be the right answer when the product is genuinely web-shaped — and the wrong answer when it is used to avoid learning the platform.

## At a glance

| If this is true… | Start with… |
| --- | --- |
| You are building for GNOME/Ubuntu first and want the most native result | **GTK 4 + libadwaita**, in C, Rust, Python, or Vala |
| You are building for KDE Plasma first, or need C++/QML depth | **Qt 6 + Kirigami** |
| You want memory safety, performance, and a growing GNOME ecosystem | **Rust + gtk-rs + libadwaita-rs** or **Relm4** |
| You have a small utility and a Python team | **Python + PyGObject + libadwaita** |
| You need a cross-platform desktop app and already have a web team | **Tauri** (preferred) or **Electron** (with eyes open) |
| You are building a game or a custom-rendered canvas | **SDL3**, **Godot**, or **Qt Quick** |
| You need a single binary for many distros with minimal runtime | **Rust + Iced/Slint**, or **Qt** with static deployment |

For most new Linux-first apps in 2026, the strongest default is:

> **GTK 4.22 + libadwaita 1.9 + Blueprint + Meson + Flatpak**, written in Rust or C.

It is the stack used by GNOME's own apps, it has the deepest accessibility and portal integration, and it is what Ubuntu 26.04 LTS ships. If you are targeting KDE first, replace GTK/libadwaita with Qt 6.10 + Kirigami/KDE Frameworks 6.

## The comparison

### GTK 4 + libadwaita

**What it is:** GTK is the widget toolkit behind GNOME. libadwaita adds the GNOME design system: headerbars, adaptive split views, view switchers, preferences pages, dialogs, toasts, and the Adwaita style.

**Strengths**

- The most direct path to a GNOME-native look and feel.
- Excellent accessibility (AT-SPI), input method, and Wayland integration.
- Modern rendering through GSK; GTK 4.22 adds native SVG rendering with `GtkSvg`.
- libadwaita 1.9 adds `Adw.Sidebar`, `Adw.ViewSwitcherSidebar`, and automatic reduced-motion support.
- Strong language options: C, Rust, Python, Vala, JavaScript (GJS).
- Blueprint makes UI declarative and reviewable.

**Trade-offs**

- libadwaita is intentionally GNOME-opinionated. On KDE it will look like a GNOME app, not a Plasma app.
- The C API is verbose; Rust and Python wrappers reduce the pain but add their own friction.
- GTK's major-version transitions are infrequent but significant. Budget for them.
- Custom design systems require restraint; fighting Adwaita usually looks worse than adopting it.

**Choose it when:** GNOME/Ubuntu is your primary audience, you want the shortest path to native behavior, or you are building an app for the GNOME ecosystem.

### Qt 6 + Kirigami

**What it is:** Qt is a mature C++/QML application framework. Kirigami is KDE's adaptive UI framework built on Qt Quick. KDE Plasma 6.6 and Qt 6.10 ship in Ubuntu 26.04's KDE edition.

**Strengths**

- Excellent performance and a very mature tooling chain (Qt Creator, QML profiler, GammaRay).
- QML is productive for highly animated, touch-friendly, adaptive interfaces.
- Kirigami gives you KDE-native navigation, cards, sheets, and responsive page stacks.
- Strong cross-platform story across desktop, mobile, and embedded targets.
- C++ and Python bindings; Qt Widgets remains a solid choice for dense desktop UIs.

**Trade-offs**

- Two UI paradigms: Qt Widgets (classic desktop) and Qt Quick/QML (declarative, GPU-rendered). Mixing them has costs.
- QML performance depends on discipline; JavaScript bindings and oversized scenes can burn CPU.
- KDE integration is excellent, but a Qt app on GNOME does not automatically inherit GNOME's HIG.
- Licensing requires attention (LGPL/GPL/commercial) depending on how you link.

**Choose it when:** KDE is your primary desktop, you need C++/QML depth, or you want one codebase across desktop and embedded.

### Rust toolkits

Rust is no longer experimental on the Linux desktop. GNOME apps such as Loupe and Resources are written in Rust, and COSMIC is built on Rust.

| Option | Model | Best for | Notes |
| --- | --- | --- | --- |
| **gtk-rs + libadwaita-rs** | Bindings to GTK/libadwaita | GNOME-native apps | Most native; follows GTK's object model closely |
| **Relm4** | Component/message architecture on gtk-rs | GNOME apps with complex state | Ergonomic, opinionated, good docs |
| **Iced** | Elm-inspired, custom renderer | Cross-platform tools and games-adjacent UIs | Not GNOME-native; smaller ecosystem |
| **Slint** | Declarative UI, custom renderer | Embedded and cross-platform products | Commercial licensing for some uses |
| **libcosmic** | COSMIC desktop toolkit | COSMIC-native apps | Young but active; tied to System76's ecosystem |

**Strengths:** memory safety, fearless concurrency, strong packaging story (`cargo` + vendored sources), excellent performance.

**Trade-offs:** longer compile times, a smaller pool of desktop UI contributors, and GTK objects are not `Send` — the main-thread rule still applies.

**Choose it when:** you want memory safety without giving up native GTK, or you are building a new app with a team that already knows Rust.

### Python + PyGObject

**What it is:** Python bindings to GTK/libadwaita (and the rest of GObject).

**Strengths:** the fastest way to prototype a native GTK app; excellent for internal tools and small utilities; no compile step.

**Trade-offs:** startup time and memory are worse than C/Rust; packaging a Python runtime into Flatpak adds size; type safety is weak; distribution to users who do not have the right Python environment is painful.

**Choose it when:** the app is small, the team is Python-first, or you are prototyping. For a widely distributed app, budget for packaging and startup work.

### Vala and C

**Vala** compiles to C and gives you GObject syntax with less boilerplate. It is used by elementary and some GNOME apps. The ecosystem is smaller than Rust's, and tooling is less active.

**C** remains the lingua franca of GTK and the Linux desktop. It is stable, portable, and well documented. It is also manual: memory management, error handling, and string handling are on you. Use C for libraries and small, long-lived tools; prefer Rust for new application code unless your team is already fluent.

### Electron, Tauri, and web tech

Web technology is legitimate when the product is genuinely document- or web-shaped, or when the team's velocity depends on it. It is a poor default for a small native utility.

| Option | What you get | What you pay |
| --- | --- | --- |
| **Electron** | Chromium + Node.js, predictable rendering | 100–300 MB installs, high memory, slow cold start, duplicated accessibility stack |
| **Tauri** | System webview + Rust backend | Much smaller binaries, but rendering and behavior vary by distro webview |
| **Flutter** | Custom renderer, consistent pixels | Not native widgets; accessibility and IME integration require care; large runtime |
| **Wails** | Go + system webview | Similar trade-offs to Tauri, smaller ecosystem |

If you choose this path, do the native work anyway: a proper `.desktop` file, AppStream metadata, portal-based file dialogs, keyboard shortcuts, dark-mode support, accessibility labels, and a tray-free primary workflow. A web app that respects the desktop is better than a native app that does not.

## Language and toolkit are separate decisions

You can write GTK apps in C, Rust, Python, Vala, or JavaScript. You can write Qt apps in C++, Python, or QML/JavaScript. Choose the toolkit for its **platform fit and widget model**; choose the language for **your team, safety requirements, and packaging constraints**.

A useful rule:

- **Toolkit** determines how native the app can feel.
- **Language** determines how expensive it is to maintain.
- **Packaging** determines whether users can actually run it.

Do not let a language preference force you into a toolkit that fights the desktop, and do not let a toolkit force you into a language your team cannot staff.

## Ubuntu toolchains

Ubuntu publishes supported setup and version-availability guides for Python, Go, Rust, GCC, Clang, .NET, Java, and Zig. Use them as the source of truth when you need to know what an LTS release ships, or when you need a supported install path:

- [Ubuntu for Developers](https://documentation.ubuntu.com/ubuntu-for-developers/) — overview and tutorials.
- [Toolchains](https://documentation.ubuntu.com/ubuntu-for-developers/toolchains/) — per-language setup and first-program guides.
- [Toolchain availability](https://documentation.ubuntu.com/ubuntu-for-developers/reference/availability/) — what each Ubuntu release provides.
- [IDEs](https://documentation.ubuntu.com/ubuntu-for-developers/reference/ides/) — supported editors and install commands.

For GTK apps, use the archive toolchain when you link against system libraries. For compilers or language runtimes that must be newer than the archive, use a project-local toolchain or a snap and pin the version in CI. Do not mix an archive library with a newer runtime ABI without testing the combination.

## A decision walkthrough

1. **Which desktop is primary?** GNOME/Ubuntu → GTK/libadwaita. KDE → Qt/Kirigami. Both equally → Qt with a platform-integration pass, or accept that one desktop will be secondary.
2. **Does the app need a custom renderer?** Games, CAD, video editors, and canvas-first tools may prefer SDL3, Qt Quick, or a custom GPU stack. Form-and-list apps should use native widgets.
3. **Is the team already fluent in a stack?** A well-maintained Qt app beats a poorly maintained GTK app. Maintenance is a feature.
4. **How will it ship?** Flatpak is the default when you want one upstream build across distributions. If you need a deb in the Ubuntu archive, plan for Debian packaging from day one.
5. **What is the accessibility story?** Native widgets give you AT-SPI semantics for free. Custom-drawn UI does not. Budget accordingly.
6. **What is the five-year plan?** Check the toolkit's release cadence, major-version policy, and the health of its bindings.

## Versions to target in 2026

| Component | Ubuntu 26.04 LTS | Notes |
| --- | --- | --- |
| GTK | 4.22 | GTK 4 is the stable line; GTK 3 is maintenance-only |
| libadwaita | 1.9 | GNOME 50 design system |
| Qt | 6.10.2 | Qt 6.8 LTS is a conservative alternative for broader distro support |
| KDE Frameworks | 6.24 | KDE Plasma 6.6 |
| Python | 3.14 | PyGObject available in the archive |
| Rust | Current stable via rustup | Use a pinned toolchain in CI |
| Flatpak runtime | `org.gnome.Platform` 50 / `org.kde.Platform` 6.10 | Match the runtime to your toolkit |

:::caution[Do not target the newest API by default]
A Flatpak app can bundle a newer runtime, but a deb must work with the libraries in the archive. If you ship both, target the oldest library version you support and guard newer APIs at runtime.
:::

Next: [Build Your First App](/start/first-app/) — a complete, minimal GTK 4 app with packaging.
