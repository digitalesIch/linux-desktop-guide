---
title: Visual Language
description: Typography, color, spacing, icons, shape, and motion for Linux desktop apps that adapt to GNOME, KDE, and the user's accessibility settings.
---

A Linux app does not need a unique visual language to be distinctive. It needs a **coherent** one that sits inside the host's language. The fastest route to "native" is to use the platform's type scale, spacing, icons, and semantic colors, then spend your design budget on the parts the platform does not provide: your content, your empty states, your icon.

This page uses GTK 4 + libadwaita as the reference because it is the Ubuntu default. The principles translate to Qt/Kirigami with `Kirigami.Units`, `Kirigami.Theme`, and Breeze icons.

## Typography

Use the system UI font. Do not ship a custom font for body text unless the product is a reading or writing app where typography is the feature.

| Role | libadwaita class | Typical use |
| --- | --- | --- |
| Page title | `.title-1` | Main window or empty-state headline |
| Section title | `.title-2` | Dialog titles, large content headers |
| Subsection | `.title-3` / `.title-4` | Card headings, grouped content |
| Heading | `.heading` | Settings group headings |
| Body | `.body` | Default text |
| Caption | `.caption` | Metadata, timestamps, helper text |
| Monospace | `.monospace` | Code, IDs, logs |
| Dimmed | `.dim-label` | Secondary information |

Rules:

- Keep body text at the system size. If you need emphasis, use weight or the heading classes, not a larger font.
- Line length: 45–75 characters for prose; wider for tables and code.
- Line height: the toolkit default is tuned for the font; do not compress it.
- Use `Gtk.Label` with `wrap=True` and `xalign=0` for multi-line text; avoid fixed heights.
- Do not use Pango markup for layout. Use it for inline emphasis only, and keep the plain text accessible.
- Test at 200% text scaling and with long translations (German is a good stress test).

:::tip[Don't hardcode font sizes]
A user who sets a larger system font expects every app to follow. If you must use a custom size, express it relative to the system font and test the result at 100%, 150%, and 200%.
:::

## Color

Use semantic colors from the toolkit, not hex values.

| Need | libadwaita token | Notes |
| --- | --- | --- |
| Window background | `@window_bg_color` | Adapts to light/dark |
| Window text | `@window_fg_color` | Meets contrast in both schemes |
| Card background | `@card_bg_color` | Layered surfaces |
| Accent background | `@accent_bg_color` | Buttons, selection |
| Accent text on accent | `@accent_fg_color` | Do not guess |
| Accent as text | `@accent_color` | Links, highlights |
| Destructive | `@destructive_bg_color` / `@destructive_color` | Use sparingly |
| Success/warning | `@success_color` / `@warning_color` | Semantic, not decorative |

The system accent color is a user preference. Respect it. A brand accent can be used inside illustrations or the app icon; it should not repaint every button.

Contrast:

- Body text: at least 4.5:1 against its background.
- Large text and UI boundaries: at least 3:1.
- Never use color as the only signal. Pair it with an icon, label, or pattern.
- Test in light, dark, and high-contrast modes.
- Do not place text on a photographic background without a scrim.

## Spacing and layout

Use a 6 px base grid: 6, 12, 18, 24, 36, 48. This matches Adwaita's rhythm and keeps layouts calm.

| Space | Use |
| --- | --- |
| 6 px | Icon-to-label, tight inline gaps |
| 12 px | Related controls, list row padding |
| 18 px | Between groups in a card |
| 24 px | Page margins, section spacing |
| 36–48 px | Major section breaks, empty states |

Prefer the toolkit's spacing constants:

```python
box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=12)
box.set_margin_top(24)
box.set_margin_bottom(24)
box.set_margin_start(24)
box.set_margin_end(24)
```

Avoid fixed widths for text containers. Let labels wrap, let lists scroll, and let the window resize.

## Icons

- Use **symbolic** icons for UI controls. They inherit the text color and work in light, dark, and high-contrast themes.
- Use full-color icons for app icons and illustrative content.
- Install app icons into `hicolor` at multiple sizes; provide an SVG.
- Keep one icon style. Mixing GNOME symbolic icons with colorful KDE icons looks accidental.
- Icon-only buttons need a tooltip and an accessible label.
- Do not use an icon to replace a label when the meaning is ambiguous.

```python
button = Gtk.Button(icon_name="list-add-symbolic")
button.set_tooltip_text("New note")
button.update_property([Gtk.AccessibleProperty.LABEL], ["New note"])
```

## Shape and elevation

Adwaita uses modest corner radii: 6 px for controls, 12 px for cards and dialogs, and fully rounded pills for status badges. Pick a small set and use it consistently.

- Use borders and background layering before shadows.
- Shadows should suggest elevation, not decoration. A popover can have a shadow; a list row should not.
- Avoid glassmorphism, neon glows, and heavy gradients. They date quickly and often fail contrast.
- In dark mode, use a subtle border instead of a bright shadow.

## Motion

Motion explains cause and effect. It should be fast enough to feel responsive and subtle enough to ignore.

| Interaction | Duration | Easing |
| --- | --- | --- |
| Button press | 100–150 ms | ease-out |
| View transition | 200–250 ms | ease-in-out |
| Dialog enter | 200 ms | ease-out |
| Toast | 150 ms in, 250 ms out | ease-out |

Rules:

- Animate transform and opacity, not layout properties.
- Do not animate more than one thing at a time unless they are part of the same transition.
- Respect reduced motion. libadwaita 1.9 applies the system setting to most widgets automatically; custom animations must check it.
- Never use motion to hide latency. Fix the latency or show progress.

```css title="Custom animation with reduced-motion fallback"
@media (prefers-reduced-motion: no-preference) {
  .pulse {
    transition: opacity 180ms ease-out;
  }
}
```

## Imagery and empty states

- Use illustrations to explain a state, not to fill space.
- Provide light and dark variants, or use symbolic imagery that adapts.
- Empty states should say what the view is for, why it is empty, and what to do next.
- Screenshots in AppStream metadata should show the real app, in both light and dark mode, without fake window chrome.

## Brand expression

| Surface | Guidance |
| --- | --- |
| App icon | The strongest brand surface. Make it legible at 16 px. |
| Accent | Use the system accent for controls; use your brand color in illustrations and the icon. |
| Empty states | A short, human sentence and a clear action. |
| Onboarding | One screen, not a carousel. Explain the value and the first step. |
| About dialog | Name, version, developers, license, website. No marketing wall. |
| Window chrome | Do not brand it. Use the host's headerbar and controls. |

## GTK CSS: use it sparingly

GTK CSS is for small adjustments, not for rebuilding a theme. Prefer libadwaita's style classes and widget properties.

```css title="A restrained custom badge"
.app-badge {
  background-color: alpha(@accent_bg_color, 0.15);
  color: @accent_color;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 0.85em;
  font-weight: 600;
}
```

```python title="Applying it"
badge = Gtk.Label(label="Beta")
badge.add_css_class("app-badge")
```

Avoid:

- Targeting internal widget nodes (`.button > box > label`) — they change.
- Overriding `background` or `color` on broad selectors (`window`, `button`, `entry`).
- Shipping a full theme. It will break on the next libadwaita release.
- Using `!important` to win a specificity fight.

## Visual checklist

- ☐ System font, system text size, no fixed font sizes for body text.
- ☐ Semantic colors, no hardcoded hex values in widgets.
- ☐ System accent respected; brand color confined to icon/illustrations.
- ☐ Light, dark, and high-contrast modes tested.
- ☐ Spacing on a 6 px grid; consistent radii.
- ☐ Symbolic icons for controls; one icon style.
- ☐ Icon-only buttons have tooltips and accessible labels.
- ☐ Reduced motion respected.
- ☐ Layout works at 200% text scaling and 200% display scaling.
- ☐ Empty states explain the next step.
- ☐ Screenshots show the real app in both color schemes.

## Key takeaways

- Use the host's type scale, spacing, icons, and semantic colors.
- Brand belongs in the icon, content, and empty states — not in window chrome.
- Contrast and reduced motion are not optional.
- Custom CSS should be small, semantic, and easy to delete.
- A calm visual language is a feature, not a lack of personality.

Next: [Layout & Navigation](/design/layout/) — choosing the right adaptive structure for your app.
