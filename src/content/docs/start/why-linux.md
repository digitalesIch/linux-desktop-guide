---
title: Why Linux Is Different
description: Linux is not a single platform with a single vendor. It is a set of contracts between apps, desktops, and users. Understanding those contracts is the first step to building software that feels native.
---

If you come from macOS, the first instinct is to look for the Linux equivalent of AppKit, SwiftUI, the Human Interface Guidelines, and the App Store. You will find something in each category — but not one of each. Linux is not a product with a vendor at the top. It is an ecosystem held together by open standards, several strong desktop communities, and users who expect to remain in control.

That changes the job. You are not targeting one platform. You are targeting a **contract**: a small set of protocols, file formats, and behavioral expectations that let your app work across GNOME, KDE Plasma, and every distribution that ships them.

Once you accept that, the apparent fragmentation becomes an advantage. You can choose the toolkit that fits your product. You can ship directly to users. You can integrate as deeply as the platform allows — without asking a gatekeeper for permission.

## The stack, from glass to app

A Linux desktop app sits on a layered stack. Each layer has a stable interface, and each one can change independently.

| Layer | What it provides | What your app should use |
| --- | --- | --- |
| Kernel & drivers | Hardware, input, power, networking | Standard APIs; never talk to devices directly unless you must |
| Display | Wayland compositor, rendering, input, scaling | Wayland protocols through your toolkit; XWayland only for legacy |
| Desktop services | Notifications, files, secrets, screen capture, settings | D-Bus and XDG Desktop Portals |
| Toolkit | Widgets, layout, accessibility, theming | GTK 4 + libadwaita, Qt 6 + Kirigami, or another maintained toolkit |
| Your app | Product logic, data, presentation | Platform conventions plus your own brand |

The important line is not between "Linux" and "your app". It is between **stable contracts** and **implementation details**. Wayland, D-Bus, XDG directory layout, AppStream, and the Desktop Entry specification are contracts. A particular compositor's private protocol, a distro's patched library, or an undocumented D-Bus interface is an implementation detail. Build on the former; treat the latter as optional.

:::tip[The practical test]
If a feature only works on one desktop, one display server, or one packaging format, it is not your baseline. It is an enhancement. Make the baseline excellent first.
:::

## What macOS gives you, and what Linux gives you instead

The comparison is useful as long as it is not treated as a checklist to copy.

| Concern | macOS | Linux desktop |
| --- | --- | --- |
| UI toolkit | AppKit / SwiftUI | GTK 4 + libadwaita, Qt 6 + Kirigami, Rust toolkits |
| Design authority | Apple Human Interface Guidelines | GNOME HIG, KDE HIG, elementary HIG, distribution guidance |
| Windowing | One compositor (WindowServer) | Wayland compositors (Mutter, KWin, wlroots-based) |
| Integration | Frameworks and system services | D-Bus, XDG Desktop Portals, freedesktop specifications |
| Distribution | Mac App Store, notarized direct download | Flathub, deb, Snap, AppImage, distro repositories |
| Sandbox | App Sandbox + entitlements | Flatpak/Snap sandboxes + portals |
| Updates | Sparkle, App Store, system updates | Flatpak/OSTree, Snap, package manager, app-specific updaters |
| User control | Guided by the OS vendor | Explicit, visible, and often scriptable |

The last row is the philosophical difference. On Linux, the user can replace the desktop, the theme, the file manager, the compositor, and the package source. Your app is a guest in an environment it does not own. The best Linux apps behave like good guests: they adapt, they ask before taking, and they leave things as they found them.

## The four contracts

Everything in this guide hangs off four contracts. They are also the four sections of the platform part of this book.

### 1. Display: render through the compositor

Wayland is the default on Ubuntu 26.04 LTS. The compositor owns the screen, input, and the security boundary. Your app renders its own surfaces and talks to the compositor through protocols. It does not position windows at absolute screen coordinates, synthesize input, or capture the screen behind the compositor's back.

This is not a restriction to work around. It is what makes fractional scaling, per-monitor DPI, input methods, and secure screen sharing possible.

→ [Wayland & Display](/platform/wayland/)

### 2. Desktop: integrate through standards

Notifications, file dialogs, secrets, screen capture, global shortcuts, and opening URLs all have standard interfaces. On a modern Linux desktop, most of them are mediated by **XDG Desktop Portals**. Your app asks for a capability; the desktop decides how to provide it and, when necessary, asks the user.

→ [System Integration](/platform/integration/) and [Flatpak & Portals](/platform/flatpak-portals/)

### 3. Data: follow the XDG layout

There is no single "Application Support" directory. Configuration, data, state, cache, and runtime files have separate homes defined by the XDG Base Directory specification. Writing to the right place is not bureaucracy; it is what makes backup, reset, migration, and sandboxing work.

→ [The XDG Contract](/platform/xdg/)

### 4. Distribution: ship reproducibly

Users can install software from a software center, a package manager, a single file, or a Git checkout. Each channel has different expectations. The common denominator is trust: a reproducible build, valid metadata, minimal permissions, and an update path that does not require the user to reinstall.

→ [Packaging & Distribution](/platform/packaging/)

## What "native" means here

"Native" is not a theme, a font, or a titlebar shape. It is a set of observable behaviors.

- **Predictable.** Standard shortcuts work. Files open where the user expects. Settings persist. The app starts even when the network is down.
- **Responsive.** The first window appears quickly. The main loop never blocks. Scrolling and typing stay smooth under load.
- **Integrated.** The app uses the host's file dialogs, notifications, secrets store, and settings. It appears in search, the software center, and the task switcher with the right name and icon.
- **Accessible.** Every action is reachable by keyboard and exposed to assistive technologies. Text scales. Contrast holds. Motion can be reduced.
- **Honest.** Permissions match the feature set. Metadata matches the binary. Errors say what happened and what to do next.

A native app can be written in C, Rust, Python, C++, or TypeScript. It can use GTK, Qt, or a custom renderer. What makes it native is that it respects the contracts above.

## Anti-patterns that break the illusion

These are the most common ways a ported or hastily built app stops feeling native.

| Anti-pattern | Why it fails | Do this instead |
| --- | --- | --- |
| Hardcoding `~/.myapp` | Breaks backups, sandboxing, and multi-user setups | Use XDG directories |
| Requiring `sudo` at runtime | Violates least privilege and desktop expectations | Use a user service or a portal |
| Bundling a full Chromium for a form | Wastes memory, battery, and startup time | Use the native toolkit unless web tech is essential |
| Drawing a custom titlebar | Fights tiling, gestures, and accessibility | Use the toolkit's headerbar/window frame |
| Ignoring the file chooser portal | Breaks in Flatpak and Snap | Use `Gtk.FileDialog` or the portal API |
| Polling every second | Wastes battery | Use event-driven APIs and D-Bus signals |
| Shipping a tray-only app | Many desktops do not expose a tray | Provide a real window and an optional status icon |
| Writing logs with secrets | Leaks credentials into journald and support bundles | Redact, rotate, and use structured logging |
| Auto-updating inside a sandbox | Bypasses the store and breaks permissions | Let Flatpak/Snap/the package manager update |

## The Linux advantage

It is worth saying plainly: the Linux model is not a worse version of macOS. It is a different bet.

- **You can ship without a gatekeeper.** Flathub, a PPA, a `.deb`, or a tarball are all legitimate paths.
- **You can integrate deeper.** D-Bus, portals, and the XDG specs expose capabilities that closed platforms often keep private.
- **You can support older hardware.** A well-written GTK or Qt app can run on a decade-old laptop and still feel responsive.
- **You can be inspected.** Users and distributors can read the source, verify the build, and patch the package.
- **You can choose your stack.** The ecosystem rewards maintenance and good citizenship, not a single vendor's roadmap.

The cost is that you must take standards seriously. The reward is software that belongs on the desktop rather than merely running on it.

## Key takeaways

- Linux is a contract ecosystem, not a single vendor platform.
- Build on Wayland, XDG, D-Bus, portals, and AppStream — not on one desktop's private behavior.
- "Native" is measured in behavior: predictable, responsive, integrated, accessible, honest.
- The four contracts are display, desktop, data, and distribution.
- Fragmentation is a design constraint. Treat it as the brief, not as an excuse.

Next: [Choose Your Stack](/start/choose-stack/) — an honest comparison of the toolkits and languages you can build on.
