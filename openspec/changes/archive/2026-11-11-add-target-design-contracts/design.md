# Design

## Context

See `proposal.md` for the motivation. The shared design chapter already defines principles, but its examples use GNOME/Adwaita APIs. The target profiles link the canonical HIGs but do not translate them into guide-level decisions. The KDE HIG is explicit that it is a "what and why" document, not a component-by-component implementation guide; the GNOME HIG is similarly organized around principles, guidelines, and patterns.

Both HIGs are living documents. The KDE HIG is CC BY-SA 4.0; the GNOME HIG is maintained on GNOME GitLab. Copying either wholesale would create a maintenance and licensing burden and would not produce the guide's opinionated path.

## Goals / Non-Goals

**Goals:**

- Give each reference target a concise decision layer in the guide's voice.
- Make the KDE path as readable as the GNOME path without duplicating either HIG.
- Link every contract to the canonical HIG and record the check date.
- Keep the shared principles page as the cross-desktop baseline.

**Non-Goals:**

- Reproducing the HIGs or maintaining a fork.
- Adding new routes, navigation entries, or toolkit code.
- Covering elementary, COSMIC, or other non-reference desktops.
- Prescribing a single visual style for every app; the contract defines platform fit, not brand.

## Decisions

### 1. Three layers, one source of truth each

- **Canonical HIG** — exhaustive rules and API links; external and versioned.
- **Target design contract** — the guide's translation: which decisions matter for this target, what to use, and what to avoid.
- **Shared principles** — cross-desktop design values and the primary-desktop rule.

Each layer has one job. The contract links to the HIG rather than restating it.

### 2. Put the contracts in the target profiles

A new `design/` route would require sidebar and navigation work owned by the structure session. The target profile is already the entry point for "which environment and stack should I use?" and can carry the contract without a new route. If the contracts grow beyond a screen, they can move to dedicated pages later.

### 3. Keep each contract to the decisions that change code or structure

The GNOME contract covers:

- single-window navigation and view switchers/sidebars;
- header bars and system window controls;
- alert/action dialogs and undo;
- toasts, banners, notifications, placeholder pages;
- Adwaita spacing/typography, symbolic icons;
- keyboard, focus, 200% scaling, reduced motion, high contrast;
- the guest behavior on KDE.

The KDE contract covers:

- "simple by default, powerful when needed";
- `PageRow`/`PageStack`/`NavigationTabBar`/`GlobalDrawer` navigation;
- toolbar placement and hamburger/menubar thresholds;
- `Kirigami.Units` spacing and icon sizes;
- `Kirigami.FormLayout` settings and immediate apply;
- passive notifications, inline messages, system notifications, errors;
- undo and destructive actions;
- `KStandardShortcut`, Meta-key limits, keyboard access;
- Plasma-first fidelity and cross-desktop fallback.

### 4. Use the HIG's own vocabulary

Use the platform terms (`HeaderBar`, `PageRow`, `GlobalDrawer`, `Kirigami.Units`) because developers search for them. Explain the decision in plain language before naming the API. This keeps the contract useful to designers and developers.

### 5. Date and link the source

Each contract links the HIG and records "checked 2026-11-11". The freshness process will flag changes to the linked pages; the contract is reviewed when the HIG or target changes.

## Risks / Trade-offs

- **Oversimplification** → Keep the contract to decisions and link the HIG for edge cases; do not present it as a complete HIG.
- **Drift** → Date and link the source; review the contract with the target freshness check.
- **Duplication with the Qt/GTK chapters** → The contract names patterns and decisions; API code stays in the stack chapters.
- **Cross-desktop ambiguity** → State the primary HIG and the guest behavior explicitly; do not promise identical behavior on the other desktop.

## Migration Plan

Add the sections to the two target profiles and the pointer in the principles page. Run the documentation and quality gates. No route or schema migration is required. Review the rendered pages at desktop and narrow widths; keep the existing target headings and anchors intact.
