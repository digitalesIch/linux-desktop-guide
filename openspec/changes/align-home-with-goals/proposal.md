# Proposal

## Why

The landing page still reads as a platform manifesto: it emphasizes why Linux is different, repeats the same distribution argument across sections, and skips the work between the first window and a store listing. It also promises behavior "across GNOME, KDE and every distribution", which contradicts the deliberately bounded target matrix, and it gives GNOME a design entry point while KDE has none.

The guide now defines success by a coherent path from a useful core task through persistence, integration, installation, and updates, with release criteria that no quality score can override. The front page should express that contract.

## What Changes

- Rewrite the hero and tagline around the path from the first useful task to an installable, updatable app.
- Replace the repeated platform pitch with three durable distinctions: standards as the API, one default stack per target, and shipping as part of the design.
- Fix the "every distribution" scope claim.
- Link both reference targets directly and name their design contracts.
- Replace "From first window to Flathub" with the real development path: choose a target, build the core task, make it durable and shippable.
- Replace the performance-budget band with the four mandatory release criteria, and link the Quality Bar.
- Give GNOME and KDE equal entry points in the closing navigation.
- Mark the hero artwork as an illustration.

## Impact

- `src/content/docs/index.mdx`
- `openspec/changes/align-home-with-goals/`

No new route, component, stylesheet, target, or automated gate. The prose describes the finished guide; it does not claim that Fedora runtime validation has already happened.
