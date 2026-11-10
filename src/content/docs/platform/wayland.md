---
title: Wayland & Display
description: How Wayland changes windowing, input, scaling, screen capture, and security — and what a native Linux app must do instead of reaching for X11.
---

Ubuntu 26.04 LTS ships a Wayland-only GNOME session. XWayland still runs X11 applications, but the native path is Wayland, and the assumptions that made X11 apps work are often exactly the assumptions that break under Wayland.

Wayland is not "X11 with a different socket". It is a different security model. The compositor is the display server, the window manager, the input router, and the policy layer. Clients render their own buffers and describe their surfaces; they do not get to inspect or control the rest of the session.

That model is why fractional scaling, per-monitor DPI, input methods, and secure screen sharing can work at all. It is also why apps that rely on global coordinates, synthetic input, or framebuffer capture stop working.

## The architecture in one diagram

```text
┌──────────────────────────────────────────────────────────────┐
│                        Your application                      │
│  GTK 4 / Qt 6  ──  renders buffers  ──  describes surfaces   │
└───────────────────────────┬──────────────────────────────────┘
                            │ Wayland protocol
┌───────────────────────────▼──────────────────────────────────┐
│                     Compositor (Mutter, KWin…)                │
│  window placement · input routing · scaling · focus · policy  │
└───────────────┬──────────────────────────────┬───────────────┘
                │                              │
        ┌───────▼────────┐            ┌────────▼─────────┐
        │  XWayland      │            │  Portals / D-Bus │
        │  legacy X11    │            │  screen capture  │
        └────────────────┘            └──────────────────┘
```

Your app talks to the compositor through the toolkit. It talks to desktop services through D-Bus and XDG Desktop Portals. It should not talk to the kernel's input devices, the DRM framebuffer, or another app's window.

## What changes for application developers

| Concern | X11 habit | Wayland-native approach |
| --- | --- | --- |
| Window position | `XMoveWindow` to absolute coordinates | Let the compositor place it; save size, not position |
| Screen capture | `XGetImage` / framebuffer grab | ScreenCast portal + PipeWire |
| Global shortcuts | `XGrabKey` | GlobalShortcuts portal, or app-local shortcuts |
| Input injection | `XTest` | Not allowed; design an accessible in-app path |
| Clipboard | X selection ownership | `Gdk.Clipboard`; asynchronous, portal-mediated where needed |
| Scaling | Integer scale factor | Fractional scale protocol; toolkit handles it |
| Decorations | Reparenting window manager | Client-side decorations by default; `xdg-decoration` negotiation |
| Focus stealing | `XRaiseWindow` / `_NET_ACTIVE_WINDOW` | Request activation through the toolkit; compositor decides |
| Idle inhibition | X screensaver extension | `org.freedesktop.portal.Inhibit` / `Gtk.Application.inhibit` |
| Accessibility | AT-SPI over X | AT-SPI over D-Bus; toolkit exposes semantics |

## The rules that matter

### Do not position windows

Wayland deliberately gives clients no global coordinate system. `Gtk.Window` has no "move to 1920, 400". The compositor may be tiled, may have multiple monitors with different scales, or may place the window on a workspace you cannot see.

**Do:** save and restore window *size*, maximized state, and fullscreen state. Let the compositor choose the monitor and position. If the app needs a specific monitor, use the toolkit's monitor APIs for sizing and fullscreen, not absolute coordinates.

**Avoid:** `move()`, `set_position()`, or X11 `XMoveWindow` calls. They either do nothing or behave inconsistently.

### Use client-side decorations, but do not reinvent them

GTK 4 and Qt 6 draw client-side decorations by default. A `Adw.HeaderBar` or a Qt window frame participates in tiling, dragging, resizing, and accessibility. A custom titlebar that draws its own drag logic usually breaks at least one of those.

**Do:** use `Adw.ApplicationWindow` + `Adw.HeaderBar`, or `QMainWindow` with the platform theme. If you need a custom header, keep the toolkit's window controls and drag handling.

**Avoid:** hiding the system close button, drawing fake traffic lights, or implementing window dragging with raw pointer events.

### Handle fractional scaling

Fractional scaling is enabled by default on Ubuntu 26.04. A 125% or 150% session is normal. Toolkit layouts should use logical pixels and vector assets; the compositor and toolkit handle the rest.

**Do**

- Use SVG icons and scalable UI assets.
- Test at 100%, 125%, 150%, 200%, and with two monitors at different scales.
- Use toolkit spacing and font scaling rather than hardcoded pixel sizes.
- Let text wrap and windows resize; do not assume a minimum width that only fits your development monitor.

**Avoid**

- Raster assets at a single size.
- Fixed-size windows that clip at 200%.
- Manual scale-factor math in application code.

GTK 4 handles fractional scaling through the compositor's scale protocol. If you draw custom content with `Gtk.Snapshot`, use the widget's logical coordinates and let the toolkit scale the surface.

### Screen capture goes through the portal

An app that needs to record the screen, share a window, or take a screenshot uses the **ScreenCast** or **Screenshot** portal. The desktop shows a picker and a permission prompt. The app receives a PipeWire stream, not a framebuffer.

**Do**

- Use `org.freedesktop.portal.ScreenCast` for recording and sharing.
- Use `org.freedesktop.portal.Screenshot` for one-shot screenshots.
- Handle the case where the user cancels or denies permission.
- Stop the stream when the app is done; do not leave a recorder running.

**Avoid**

- X11 screenshot APIs.
- Reading `/dev/dri` or the framebuffer directly.
- Recording without a visible indicator.

### Global shortcuts need consent

A global shortcut is a key grab that works while another app has focus. Under Wayland, that is a privileged capability. Use the **GlobalShortcuts** portal, which lets the desktop present the shortcut and lets the user change or revoke it.

For shortcuts that only work while your window is focused, use the toolkit's shortcut system (`Gtk.ShortcutController`, `QShortcut`). That needs no portal and should be your default.

### Input methods are not optional

Wayland routes text input through the `text-input` and `input-method` protocols. GTK and Qt implement this, including Compose sequences, dead keys, and CJK input methods.

**Do:** use standard text widgets and let the toolkit handle input. Test with at least one non-Latin input method and with Compose sequences.

**Avoid:** intercepting raw key events to implement text entry, or assuming a US keyboard layout. If you implement a custom text editor, integrate with `Gtk.IMContext` (GTK) or `QInputMethod` (Qt).

### Clipboard and primary selection are asynchronous

`Gdk.Clipboard` reads and writes asynchronously. The clipboard may be owned by another process, and the data may arrive after a round trip. The primary selection (middle-click paste) is a separate clipboard on Linux.

**Do:** use `Gdk.Display.get_clipboard()` and `get_primary_clipboard()`, handle `read_text_async`/`read_value_async`, and provide a sensible fallback when the clipboard is empty.

**Avoid:** assuming the clipboard is synchronously available, or clearing it on exit. On Wayland, the clipboard survives the source app only if the compositor supports it; do not build features that depend on the source staying alive.

### Activation and single-instance behavior

Wayland restricts focus stealing. An app cannot raise itself over another app without the compositor's consent. `Gtk.Application` and `QApplication` use the `org.freedesktop.Application` D-Bus interface to activate an existing instance and pass files or URIs.

**Do:** use `Gtk.Application` with a stable application ID, implement `open` for file arguments, and let the toolkit handle activation. Use `GApplication`'s `HANDLES_OPEN` flag when the app opens documents.

**Avoid:** launching a second process and hoping the compositor focuses it. Avoid `wmctrl`, `xdotool`, or X11 activation hacks.

### Idle inhibition and suspend

Long-running work (video export, a download, a presentation) may need to prevent idle suspend. Use the **Inhibit** portal or the toolkit API:

```python title="Python / GTK"
cookie = app.inhibit(
    window,
    Gtk.ApplicationInhibitFlags.IDLE | Gtk.ApplicationInhibitFlags.SUSPEND,
    "Exporting video",
)
# ... later
app.uninhibit(cookie)
```

Release the inhibitor as soon as the work finishes. An app that holds an inhibitor forever is a battery bug.

## A minimal Wayland checklist

- ☐ The app starts on a Wayland session with no X11-specific code path.
- ☐ Window size and maximized state persist; position does not.
- ☐ The UI works at 100%, 125%, 150%, and 200% scaling.
- ☐ Icons are SVG or symbolic; no blurry raster assets.
- ☐ File dialogs use `Gtk.FileDialog` or the portal.
- ☐ Screen capture uses the ScreenCast portal.
- ☐ Global shortcuts use the portal or are app-local.
- ☐ Text input works with an IME and with Compose.
- ☐ The app is single-instance and handles file-open activation.
- ☐ The app does not hold idle inhibitors after work completes.
- ☐ Accessibility works with Orca on Wayland.

## Debugging Wayland

| Tool | Use |
| --- | --- |
| `WAYLAND_DEBUG=1` | Log the protocol messages between the app and compositor |
| `GTK_DEBUG=interactive` | Inspect the widget tree, layout, and render nodes |
| `gtk4-demo` / `gtk4-widget-factory` | Compare behavior with canonical GTK apps |
| Mutter Devkit | Test nested GNOME Shell with simulated monitors and scaling |
| `weston --backend=headless` | Run a headless Wayland compositor for tests |
| `wev` | Inspect input events on Wayland |
| `wl-info` / `wayland-info` | List globals and protocol support |

For GNOME-specific behavior, Mutter Devkit in GNOME 50 can simulate HiDPI, fractional scaling, multiple monitors, and clipboard sharing. It is the fastest way to test layout without physical hardware.

## Common pitfalls

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Window appears at a random position | App calls `move()` | Remove absolute positioning; save size only |
| Blurry UI at 125% | Raster assets or manual scaling | Use SVG and toolkit layouts |
| Screen share shows a black window | App uses X11 capture | Use the ScreenCast portal |
| Global shortcut does nothing | X11 key grab | Use GlobalShortcuts portal or app-local shortcut |
| Text input duplicates characters | Custom key handling | Use the toolkit's text widgets and IM context |
| File dialog does not open in Flatpak | Direct filesystem access | Use `Gtk.FileDialog` / FileChooser portal |
| App steals focus | X11 activation hack | Use `Gtk.Application` activation |
| Clipboard empty after copy | Asynchronous read not awaited | Use async clipboard APIs and handle failure |

Next: [The XDG Contract](/platform/xdg/) — where apps put their data, and why it matters.
