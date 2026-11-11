# Design

## Context

See `proposal.md` for the motivation. The guide already has most of the material: target profiles, shared platform chapters, design contracts, engineering chapters, release criteria, and packaging recipes. The missing piece is the boundary between them.

The current Ubuntu profile says `Primary packaging: Flatpak / Flathub` and `Secondary packaging: deb, Snap`. The Ubuntu platform page says the opposite in substance: Canonical supports deb and Snap as first-class formats; Flatpak is cross-distribution and not preinstalled. Both statements can only coexist if "primary" means "guide-wide upstream default," but the profile does not say that.

## Goals / Non-Goals

**Goals:**

- Give each layer one job and one source of truth.
- Make target-native packaging and cross-target packaging different, named decisions.
- Give readers a concrete recipe for one app across targets without pretending one toolkit is native everywhere.
- Keep existing URLs and target roles stable.

**Non-Goals:**

- Adding a new target or changing the matrix roles.
- Creating full platform guides for Debian, Arch, and Fedora GNOME in this change. They remain validation/compatibility targets covered by the matrix and shared chapters.
- Adding a new navigation system, component, or stylesheet.
- Replacing the Native Standard or the design contracts.
- Declaring Fedora runtime validation that has not been performed.

## Decisions

### 1. Three layers

- **Linux-wide foundation:** toolkit-neutral standards, architecture, accessibility, security, testing, release criteria, and shared packaging strategy. It lives in Start, Platform, Design, Engineering, Ship, and Reference.
- **Platform guides:** target-native decisions. They live in `targets/*.md` and contain the distribution, desktop, toolkit, HIG, native packaging, integration, and validation checklist.
- **Cross-target recipe:** how one app reaches several targets. It lives in `start/one-app-across-targets.md` and connects the other two layers.

Each layer links to the others. A platform guide does not repeat a shared rule; a shared page does not pretend a target-native choice applies everywhere.

### 2. A platform guide is not a second copy of the guide

The existing target profiles keep their URLs and gain a short orientation line: what is target-native, what is shared, and where to go next. Debian, Arch, and Fedora GNOME remain validation/compatibility entries in the matrix; they do not get a full golden path in this change. That is a scope decision, not an omission to hide.

### 3. Cross-target means one primary desktop, not one universal UI

A single codebase can share architecture, data, tests, metadata, and a common package. It cannot be equally native on GNOME and KDE. The recipe requires a primary HIG and toolkit, and it documents guest behavior on the other desktop. This is the same rule as the Native Standard's primary-HIG requirement, applied to packaging and support.

### 4. Packaging has two scopes

- **Target-native default:** the channel the target's platform owner supports and users expect. Ubuntu: Snap for third-party apps, deb for archive/system integration. Fedora: Flatpak/Flathub, with RPM for archive integration. Debian: deb, with Flatpak for newer stacks. Arch: Flatpak for distribution, pacman for development.
- **Cross-target default:** Flatpak/Flathub, because it is the only channel that carries one artifact across the reference targets with a vendor-neutral store, AppStream metadata, and portal sandboxing.

The guide may recommend Flatpak for a cross-target app without calling it the Ubuntu native default. The matrix and packaging page use these labels consistently.

### 5. The new page is added to the Start navigation

The page is added to the Start sidebar because the documentation MCP test follows the sidebar order for Start pages. The entry is a one-line navigation change, not a new navigation model. The structure session can rename or move it later without changing the content. The page is also linked from the target matrix, the homepage, `choose-stack`, and `README`, so it remains reachable from the pages that introduce the three layers.

## Risks / Trade-offs

- **Duplication** → Platform guides only carry target-specific decisions; shared rules stay in the Linux-wide layer and are linked.
- **Fragmentation** → The cross-target page is the single bridge; the matrix remains the selector.
- **False uniformity** → The recipe explicitly requires a primary HIG and guest behavior.
- **Packaging ambiguity** → The labels "target-native" and "cross-target" replace "primary/secondary" wherever the distinction matters.
- **Scope creep** → Debian, Arch, and Fedora GNOME get no full guides in this change; their validation paths remain a follow-up.

## Migration Plan

Add the cross-target page, update the target profiles and matrix, update the packaging page and the two entry points that currently call Flatpak the Ubuntu primary channel, then run the documentation and quality gates. No URL migration. Commit and deploy. Archive after verification.
