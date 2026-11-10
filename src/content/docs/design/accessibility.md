---
title: Accessibility
description: Keyboard access, screen-reader semantics, contrast, text scaling, reduced motion, and inclusive forms — the technical and legal baseline for Linux desktop apps.
---

Accessibility is not a feature for a minority of users. It is the quality of the interface under constraints: no mouse, small screen, low vision, motor impairment, cognitive load, bright sunlight, or a noisy train. Most people benefit from accessible design at some point, and many rely on it permanently.

It is also a legal requirement. The **European Accessibility Act** applies to many digital products and services from 28 June 2025. WCAG 2.2 AA is the common reference; EN 301 549 is the European harmonized standard; Section 508 applies in the United States. If you ship to the public, accessibility is part of compliance, not a nice-to-have.

## The Linux accessibility stack

| Layer | What it does |
| --- | --- |
| **AT-SPI** | D-Bus protocol that exposes the UI tree, roles, states, and actions |
| **Toolkit** | GTK 4 and Qt 6 expose accessibility semantics automatically for native widgets |
| **Orca** | GNOME screen reader; reads the AT-SPI tree and drives the app |
| **Accerciser** | Inspector for the accessibility tree |
| **Desktop settings** | Large text, high contrast, reduced motion, sticky keys, screen reader |

If you use native widgets, you get most of this for free. If you draw your own controls, you must implement the semantics yourself — and that is usually a bad trade.

On Ubuntu, the stack is documented in the [Ubuntu Desktop accessibility guide](https://documentation.ubuntu.com/desktop/en/latest/explanation/accessibility-stack/). GTK 4 apps expose semantics through `Gtk.Accessible`; GTK 3 uses ATK. Orca is the default screen reader, with BRLTTY for Braille and Speech Dispatcher/eSpeak for speech. Custom-rendered or web-rendered UI does not inherit AT-SPI semantics automatically; test it with Orca and budget for explicit accessibility work. The [AT-SPI D-Bus interfaces](https://documentation.ubuntu.com/desktop/en/latest/reference/accessibility/dbus/) are the reference for custom assistive tooling.

## The baseline: WCAG 2.2 AA

The four principles are **perceivable, operable, understandable, and robust**. For desktop apps, the practical checklist is:

- Every action is operable with a keyboard.
- Every control has an accessible name and role.
- Focus is visible and follows a logical order.
- Text and UI components meet contrast requirements.
- Content reflows at 200% zoom/text scaling without loss of function.
- Motion can be reduced.
- Errors are identified and described.
- Forms have labels, instructions, and error messages.
- Media has captions/transcripts where applicable.
- The app does not rely on color alone.

WCAG 2.2 adds several criteria that matter for desktop apps: **2.4.11 Focus Not Obscured (Minimum)**, **2.5.7 Dragging Movements**, **2.5.8 Target Size (Minimum)**, **3.2.6 Consistent Help**, **3.3.7 Redundant Entry**, and **3.3.8 Accessible Authentication (Minimum)**. Treat them as part of the AA baseline, not as optional polish.

EN 301 549 v4.1.1 adopts WCAG 2.2, but procurement documents may still cite v3.2.1 (WCAG 2.1 AA). Check which harmonised standard your market or customer requires.

## Semantics: use native widgets

A `Gtk.Button` already exposes a button role, a label, a pressed state, and keyboard activation. A custom `Gtk.DrawingArea` with a click handler exposes none of that.

- Use native widgets for buttons, entries, lists, tabs, menus, dialogs, and switches.
- If you must build a custom widget, subclass an existing accessible widget or implement `Gtk.Accessible` correctly.
- Give icon-only buttons an accessible label.
- Link labels to their controls with mnemonics.
- Expose state changes (expanded, selected, busy) through properties, not just visuals.

```python title="Accessible icon-only button"
button = Gtk.Button(icon_name="list-add-symbolic")
button.set_tooltip_text("New note")
button.update_property([Gtk.AccessibleProperty.LABEL], ["New note"])
```

```python title="Label linked to an entry"
label = Gtk.Label(label="_Name", use_underline=True)
label.set_mnemonic_widget(name_entry)
```

Tooltips are not a substitute for accessible names. A screen reader may not read a tooltip, and a keyboard user may never hover.

## Keyboard access

- Every interactive element is reachable with `Tab` / `Shift+Tab`.
- Every action has a keyboard path, even if it is only through a menu.
- Dialogs trap focus and restore it on close.
- `Esc` closes the current layer.
- `Enter` activates the default action; `Space` toggles the focused control.
- Arrow keys navigate lists, trees, tabs, and radio groups according to platform conventions.
- No keyboard traps. If focus enters a custom widget, it can leave.
- Shortcuts do not conflict with the desktop or screen reader.

Test by unplugging the mouse. Then test with Orca running.

## Focus visibility

- Keep the toolkit's focus ring, or replace it with something equally visible.
- Do not use `outline: none` without an alternative.
- Focus should be visible in light, dark, and high-contrast modes.
- The focused element should be scrolled into view.
- When a dialog closes, focus returns to the control that opened it.

## Contrast and color

| Element | Minimum contrast |
| --- | --- |
| Body text | 4.5:1 |
| Large text (18 pt / 14 pt bold) | 3:1 |
| UI components and boundaries | 3:1 |
| Focus indicator | 3:1 against adjacent colors |

- Use semantic colors from the toolkit; they are tested against the theme.
- Do not use color as the only indicator of state. Add an icon, label, or pattern.
- Check hover, pressed, disabled, selected, and error states.
- Test in high-contrast mode; custom colors often fail there.
- Do not put text over busy images without a solid or blurred scrim.

## Text scaling and zoom

Users can increase the system font size or set a display scale of 200%. The app must remain usable.

- Use wrapping labels, flexible layouts, and scrollable content.
- Avoid fixed heights for text containers.
- Do not truncate essential text; use ellipsis only for secondary information.
- Test at 200% text scaling and 200% display scaling.
- Keep target sizes usable when text grows.
- Do not disable zoom in a document viewer; support `Ctrl++`/`Ctrl+-`.

## Reduced motion

- Respect the system's reduced-motion setting.
- libadwaita 1.9 applies it to most widgets automatically; custom animations must check.
- Replace large transitions with instant state changes or short fades.
- Do not autoplay video or looping animations.
- Provide a way to pause or stop motion in media.

```python title="Checking reduced motion for a widget"
from gi.repository import Adw

animations_enabled = Adw.get_enable_animations(self)
```

libadwaita widgets honor the system setting. GTK 4.22 core widgets and custom animations still need verification; do not assume every animation is disabled automatically.

## Forms and errors

- Every field has a visible label, not just a placeholder.
- Required fields are marked in text, not only with an asterisk.
- Errors are announced and associated with the field.
- Error messages say how to fix the problem.
- Do not clear the form on error.
- Support autofill and password managers where appropriate.
- Group related fields with a fieldset-like container and a heading.

## Media

- Provide captions for video with speech.
- Provide transcripts for audio.
- Provide audio descriptions for visual information that is not in the dialogue.
- Do not autoplay media with sound.
- Ensure media controls are keyboard accessible and labeled.
- Respect reduced motion and autoplay settings.

## Testing

1. **Keyboard-only:** complete the main tasks with no mouse.
2. **Orca:** enable the screen reader and walk through the app. `orca --replace` starts it; `Super+Alt+S` toggles it on GNOME. Listen for missing labels, duplicate announcements, and focus jumps.
3. **Accerciser:** inspect roles, names, states, and relations. Fix anything that reads as "unknown" or "panel".
4. **High contrast:** switch the desktop to high contrast and check every custom style.
5. **Large text:** set 200% text scaling and 200% display scaling; check clipping and overflow.
6. **Reduced motion:** disable animations and verify the app remains understandable.
7. **Automation:** use `dogtail` or AT-SPI scripts for regression tests on critical flows.

:::tip[Test with real assistive technology]
Automated accessibility checks catch missing labels. They do not catch a confusing reading order or an announcement that fires three times. Budget time with Orca and, if possible, a screen-reader user.
:::

## Common failures

| Failure | Fix |
| --- | --- |
| Icon-only button with no label | Add `Gtk.AccessibleProperty.LABEL` |
| Placeholder used as a label | Add a persistent visible label |
| Custom toggle with no state | Use `Gtk.Switch` / `Gtk.ToggleButton` or expose state |
| Focus ring removed | Restore or replace it |
| Fixed-height rows clip large text | Use natural height and wrapping |
| Color-only error state | Add an icon and text |
| Dialog focus escapes to the background | Use a modal dialog and trap focus |
| Animation ignores reduced motion | Check the setting before animating |
| Drag-only reordering | Add move up/down actions |
| Canvas-drawn chart with no text alternative | Provide a table or description |

## Legal and organizational checklist

- ☐ Accessibility is in the definition of done, not a post-release audit.
- ☐ WCAG 2.2 AA is the target for public-facing apps.
- ☐ Keyboard and screen-reader tests are part of release QA.
- ☐ The accessibility statement names known limitations and a contact.
- ☐ Third-party components are checked for accessibility.
- ☐ The team has access to Orca, Accerciser, and a high-contrast environment.
- ☐ Accessibility bugs are prioritized like other user-facing bugs.

Next: [Localization](/design/localization/) — making the app work in every language, locale, and writing direction.
