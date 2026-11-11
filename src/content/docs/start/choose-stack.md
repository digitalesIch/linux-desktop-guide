---
title: Choose Your Target and Stack
description: Choose a platform target first, then the default stack for that target. A practical comparison of GTK 4 + libadwaita, Qt 6 + Kirigami, Rust, Python, and web tech.
---

There is no single "Linux SDK". There are several mature stacks, each with a different center of gravity. The right choice is the one your team can maintain for five years, on the desktop your users actually run.

GTK and Qt are both excellent. Rust is a strong default for new apps, but not a requirement. Web technology can be the right answer when the product is genuinely web-shaped — and the wrong answer when it is used to avoid learning the platform.

The guide does not pretend there is one stack for every Linux desktop. It pairs each **reference target** with a default stack, a HIG, and a packaging path. Choose the target first; the stack follows.

## Choose a target first

| Target | Default stack | HIG | Start |
| --- | --- | --- | --- |
| [Ubuntu 26.04 LTS + GNOME](/targets/ubuntu-gnome/) | GTK 4 + libadwaita | GNOME HIG | [GTK & libadwaita](/engineering/gtk/) |
| [Fedora 45 KDE + Qt](/targets/fedora-kde/) | Qt 6 + Kirigami + KDE Frameworks | KDE HIG | [Qt & Kirigami](/engineering/qt/) |
| [Debian 13](/targets/#compatibility-target) | The target stack, usually through Flatpak | GNOME or KDE HIG | Use the target's HIG |
| [Arch Linux](/targets/#validation-targets) | Either stack, for validation | The chosen desktop's HIG | Validation only, no support promise |

If you have not chosen a target, start with [Platform Targets](/targets/). If your product is genuinely cross-distro, pick one primary target, ship Flatpak, and test on the validation targets. Do not build a different UI for every distribution.

## At a glance

| If this is true… | Start with… |
| --- | --- |
| You are building for GNOME/Ubuntu first and want the most native result | **GTK 4 + libadwaita**, in C, Rust, Python, or Vala |
| You are building for KDE Plasma first, or need C++/QML depth | **Qt 6 + Kirigami** |
| You want memory safety, performance, and a growing GNOME ecosystem | **Rust + gtk-rs + libadwaita-rs** or **Relm4** |
| You have a small utility and a Python team | **Python + PyGObject + libadwaita** |
| You need a cross-platform app and already have a web team | A maintained web or custom-render runtime; apply the quality signals and do the native integration work |
| You are building a game or a custom-rendered canvas | **SDL3**, **Godot**, or **Qt Quick** |
| You need a single binary for many distros with minimal runtime | **Rust + Iced/Slint**, or **Qt** with static deployment |

The guide has one default **per target**, not one universal default:

> **GNOME target:** **[GTK 4.22 + libadwaita 1.9](/reference/baseline/) + Blueprint + Meson + Flatpak**, written in C, Rust, Python, or Vala.

> **KDE target:** **Qt 6.11 + Kirigami + KDE Frameworks 6.30+ + CMake + Flatpak**, written in C++ and QML.

GTK is the direct path to GNOME-native behavior, and it is what Ubuntu 26.04 LTS ships. Qt/Kirigami is the direct path to KDE-native behavior, and it is what the Fedora KDE reference target ships. A cross-distro product can share code, but it still has to choose which HIG it follows first.

## The comparison

### GTK 4 + libadwaita

**What it is:** GTK is the widget toolkit behind GNOME. libadwaita adds the GNOME design system: headerbars, adaptive split views, view switchers, preferences pages, dialogs, toasts, and the Adwaita style.

**Strengths**

- The most direct path to a GNOME-native look and feel.
- Excellent accessibility (AT-SPI), input method, and Wayland integration.
- Modern rendering through GSK; GTK 4.22 includes native SVG rendering with `GtkSvg`.
- libadwaita 1.9 adds `Adw.Sidebar`, `Adw.ViewSwitcherSidebar`, and automatic reduced-motion support.
- Strong language options: C, Rust, Python, Vala, JavaScript (GJS).
- Blueprint makes UI declarative and reviewable.

**Trade-offs**

- libadwaita is intentionally GNOME-opinionated. On KDE it will look like a GNOME app, not a Plasma app.
- The C API is verbose; Rust and Python wrappers reduce the pain but add their own friction.
- GTK's major-version transitions are infrequent but significant. Budget for them.
- Custom design systems require restraint; fighting Adwaita usually looks worse than adopting it.

**Choose it when:** GNOME/Ubuntu is your primary audience, you want a direct path to native behavior, or you are building an app for the GNOME ecosystem.

### Qt 6 + Kirigami

**What it is:** Qt is a mature C++/QML application framework. Kirigami is KDE's adaptive UI framework built on Qt Quick. The guide's KDE reference target is [Fedora 45 KDE Plasma](/targets/fedora-kde/); [Kubuntu 26.04](https://kubuntu.org/news/kubuntu-26-04-release-notes/) is a valid Ubuntu-based alternative, but it is a validation option, not a reference target.

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

### Web and custom-render runtimes

Web technology is legitimate when the product is genuinely document- or web-shaped, or when the team's velocity depends on it. It is a poor default for a small native utility, and it does not remove the need to integrate with the desktop.

If you choose a web or custom-render runtime, evaluate it with the same [quality signals](/reference/quality-signals/) as any other dependency:

- **Open source and license:** can you inspect, patch, and redistribute it?
- **Maintenance:** active releases, security process, and a clear support window.
- **Accessibility:** does it expose AT-SPI semantics, keyboard navigation, and input-method support, or will you rebuild them?
- **Sandboxing:** does it work inside Flatpak/Snap and use portals for files, notifications, and secrets?
- **Packaging:** can you build a reproducible artifact and validate its metadata?
- **Desktop integration:** does it support Wayland, fractional scaling, dark mode, and the host's file dialogs?
- **Runtime weight:** startup time, memory, battery, and install size are product costs, not just engineering metrics.

A named runtime is an example, not an endorsement. If a project fails the quality signals, do not recommend it just because it is popular.

If you choose this path, do the native work anyway: a proper `.desktop` file, AppStream metadata, portal-based file dialogs, keyboard shortcuts, dark-mode support, accessibility labels, and a tray-free primary workflow. A web app that respects the desktop is better than a native app that does not.

## Language and toolkit are separate decisions

You can write GTK apps in C, Rust, Python, Vala, or JavaScript. You can write Qt apps in C++, Python, or QML/JavaScript. Choose the toolkit for its **platform fit and widget model**; choose the language for **your team, safety requirements, and packaging constraints**.

A useful rule:

- **Toolkit** determines how native the app can feel.
- **Language** determines how expensive it is to maintain.
- **Packaging** determines whether users can actually run it.

Do not let a language preference force you into a toolkit that fights the desktop, and do not let a toolkit force you into a language your team cannot staff.

## Target toolchains

The two reference targets have their own setup paths. Ubuntu publishes supported setup and version-availability guides for Python, Go, Rust, GCC, Clang, .NET, Java, and Zig. Use them as the source of truth when you need to know what the LTS ships, or when you need a supported install path:

- [Ubuntu + GNOME target](/targets/ubuntu-gnome/) — the target environment and golden path.
- [Fedora + KDE target](/targets/fedora-kde/) — the target environment and golden path.
- [Ubuntu for Developers](https://ubuntu.com/developers/docs/) — overview and tutorials.
- [Toolchains](https://ubuntu.com/developers/docs/toolchains/) — per-language setup and first-program guides.
- [Toolchain availability](https://ubuntu.com/developers/docs/reference/availability/) — what each Ubuntu release provides.
- [IDEs](https://ubuntu.com/developers/docs/reference/ides/) — supported editors and install commands.

For GTK apps, use the archive toolchain when you link against system libraries. For compilers or language runtimes that must be newer than the archive, use a project-local toolchain or a snap and pin the version in CI. Do not mix an archive library with a newer runtime ABI without testing the combination.

## A decision walkthrough

1. **Which desktop is primary?** GNOME/Ubuntu → GTK/libadwaita. KDE → Qt/Kirigami. Both equally → Qt with a platform-integration pass, or accept that one desktop will be secondary.
2. **Does the app need a custom renderer?** Games, CAD, video editors, and canvas-first tools may prefer SDL3, Qt Quick, or a custom GPU stack. Form-and-list apps should use native widgets.
3. **Is the team already fluent in a stack?** A well-maintained Qt app beats a poorly maintained GTK app. Maintenance is a feature.
4. **How will it ship?** Flatpak is the default when you want one upstream build across distributions. If you need a deb in the Ubuntu archive, plan for Debian packaging from day one.
5. **What is the accessibility story?** Native widgets give you AT-SPI semantics for free. Custom-drawn UI does not. Budget accordingly.
6. **What is the five-year plan?** Check the toolkit's release cadence, major-version policy, and the health of its bindings using the [quality signals](/reference/quality-signals/).

## Versions to target in 2026

The validated version set for the GNOME target lives in [Baseline](/reference/baseline/); the full matrix lives in [Platform Targets](/targets/). The targets record the distribution, toolkit, Flatpak runtime, support window, and review date. Use them as the reference for examples and screenshots; define a separate minimum-version policy when you support an older release.

:::caution[Do not target the newest API by default]
A Flatpak app can bundle a newer runtime, but a deb must work with the libraries in the archive. If you ship both, target the oldest library version you support and use compile-time version checks (`GTK_CHECK_VERSION`, `QT_VERSION_CHECK`) or feature flags for newer APIs.
:::


## Sources

- [Platform Targets](/targets/)
- [How Targets Are Chosen](/targets/selection/)
- [Baseline](/reference/baseline/)
- [GTK 4 documentation](https://docs.gtk.org/gtk4/)
- [libadwaita 1.9](https://gnome.pages.gitlab.gnome.org/libadwaita/doc/1.9/)
- [Qt 6.10 release](https://www.qt.io/blog/qt-6.10-released)
- [KDE Frameworks 6.24](https://kde.org/announcements/frameworks/6/6.24.0/)
- [gtk-rs book](https://gtk-rs.org/gtk4-rs/stable/latest/book/)
- [Relm4 book](https://relm4.org/book/stable/)
- [Quality Signals](/reference/quality-signals/)

Next: [Build Your First App](/start/first-app/) for the GNOME path, or [Qt & Kirigami](/engineering/qt/) for the KDE path. If you have not chosen a target yet, start with [Platform Targets](/targets/).
