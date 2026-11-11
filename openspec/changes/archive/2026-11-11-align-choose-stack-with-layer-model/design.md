# Design

## Context

See `proposal.md` for the motivation. The page already says there is no single Linux SDK and that each target has one default stack. The remaining problem is wording at the boundaries: Flatpak is mixed into the target defaults, the "both equally" case picks Qt without a target rationale, and Rust and Kubuntu are described with roles that do not match the matrix.

## Goals / Non-Goals

**Goals:**

- Make the page's role explicit: Linux-wide stack decision, not a platform guide.
- Keep target-native packaging and cross-target packaging separate.
- Require a primary HIG in the "both equally" case instead of implying a universal Qt compromise.
- Keep the page's useful toolkit and language comparison intact.

**Non-Goals:**

- Adding a new target or changing the matrix.
- Repeating the Platform Guides' setup, packaging, and validation details.
- Removing alternative stacks from the comparison.
- Changing the guide's recommended default for either reference target.

## Decisions

### 1. One orientation note at the top

A `:::note` block states that the page compares toolkits, languages, and HIG choices; target-native setup and validation live in the Platform Guides; cross-target apps use the recipe page. This prevents the comparison tables from reading as a second target matrix.

### 2. Target defaults are toolkit + HIG, not channels

The GNOME default is GTK 4 + libadwaita + Blueprint + Meson. The KDE default is Qt 6 + Kirigami + KDE Frameworks + CMake. Packaging is shown separately: Ubuntu-native Snap/deb, Fedora-native Flatpak/Flathub with RPM secondary, and Flatpak as the cross-target build.

### 3. "Both equally" is a product decision, not a toolkit vote

The page says to choose one primary HIG and toolkit, document the other desktop as a guest, and not average the HIGs. It does not recommend Qt automatically.

### 4. Roles that match the matrix

Kubuntu is an additional Ubuntu-based KDE check outside the matrix, not a validation target. Rust is a language choice for GTK, not a separate default stack. The single-binary option is a special case with explicit trade-offs.

## Risks / Trade-offs

- **Longer target boxes** → Keep them to toolkit, native packaging, and cross-target packaging; link the target pages for details.
- **Repeating the cross-target page** → The page links the recipe instead of restating its test matrix.
- **Overcorrecting** → Keep the existing GTK/Qt comparison and language guidance; only fix the layer boundaries.

## Migration Plan

Edit the one page, run the documentation and quality gates, commit, deploy, and archive the change. The content is source-only; no route or navigation change.
