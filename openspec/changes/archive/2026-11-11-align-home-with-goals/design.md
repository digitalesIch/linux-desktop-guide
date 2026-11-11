# Design

## Context

See `proposal.md` for the motivation. The landing page is `src/content/docs/index.mdx`. It uses the existing `ldg-*` classes from `src/styles/custom.css`; that file is being edited by the structure session and must not be touched here.

The current page has three overlapping layers: a Linux-difference pitch, a target model, and a four-contract model. The first two repeat the same argument, while the actual development path is compressed into three steps that jump from the first window to Flathub.

## Goals / Non-Goals

**Goals:**

- Make the page answer, in order: what the guide is for, which targets it supports, what a native app honors, how a path is completed, and what blocks a release.
- Keep both reference targets equally reachable.
- State the release gates without presenting them as a score.
- Keep the page within the existing markup and CSS contract.

**Non-Goals:**

- Adding a new visual system, animation, component, or route.
- Claiming Fedora runtime validation or a measured app result.
- Covering Debian, Arch, or validation targets as full development paths.
- Replacing the Native Standard or the Quality Bar with landing-page copy.

## Decisions

### 1. Three distinctions instead of a platform essay

The first section becomes "What makes this guide different": standards are the API, each target gets one default stack and design contract, and shipping is part of the design. This removes the repetition with the four-contract section while keeping the Linux-specific argument.

### 2. Direct routes to both reference targets

The target card lists Ubuntu + GNOME and Fedora + KDE with links to their profiles. The closing navigation gives GNOME and KDE one design card each, both pointing at the new design contracts. No target gets a privileged entry point.

### 3. A path with a middle

The path section becomes:

1. choose a target;
2. build a useful core task;
3. make it durable and shippable through storage, recovery, integration, packaging, installation, and updates.

The third step links the release checklist. This is the smallest change that makes the page match the complete-path definition without adding a fourth column and touching CSS.

### 4. Release gates replace the budget band

The four metrics become data preservation, accessible core tasks, justified permissions, and a supported install/update path. Performance budgets stay in the Native Standard and the Performance chapter; they are app-specific targets, not release gates. The band links the Quality Bar's release criteria.

### 5. Aspirational prose, factual evidence

The page describes the finished guide and may promise full reference paths. It must not claim a specific Fedora build, runtime test, or measured value. The hero image is labeled as an illustration.

## Risks / Trade-offs

- **Longer page** → Keep sections short and scannable; no new cards beyond the existing grids.
- **Repeating the target matrix** → Link the profiles instead of reproducing versions and support windows.
- **Losing the performance message** → Keep performance in the four contracts and link the Performance chapter through the Native Standard.
- **Anchor drift** → Use existing anchors only; verify with the internal link checker.

## Migration Plan

Edit `index.mdx`, run the documentation and quality gates, review the page at desktop and narrow widths, then commit and verify the deployment. No route or schema migration.
