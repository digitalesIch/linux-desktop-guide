# Linux Desktop Guide

A field guide to building fast, accessible, deeply integrated native apps for Ubuntu 26.04 and the wider Linux desktop.

The project is both:

- **a documentation website** built with [Astro Starlight](https://starlight.astro.build/);
- **a Markdown source collection** in `src/content/docs/`, so the content can be reused in MkDocs, Obsidian, GitHub, or any other renderer.

The companion app in `examples/notes/` is a complete GTK 4 + libadwaita reference implementation with Meson and Flatpak packaging.

## Structure

```text
.
├── src/
│   ├── content/docs/          # Markdown/MDX source of truth
│   │   ├── start/             # Why Linux, stack choice, tutorial, standard
│   │   ├── platform/          # Ubuntu, Wayland, XDG, integration, Flatpak, packaging, security
│   │   ├── design/            # Principles, visual language, layout, interaction, a11y, i18n
│   │   ├── engineering/       # Architecture, GTK, Qt, Rust, performance, testing, reliability
│   │   ├── ship/              # AppStream, Flathub, release checklist, quality bar
│   │   └── reference/         # Checklists, glossary, resources
│   ├── components/            # PageTitle override and other Starlight overrides
│   ├── styles/custom.css      # Design tokens and site styling
│   └── assets/                # Logo and hero artwork
├── public/                    # Favicon and the hero SVG
├── examples/notes/            # Runnable GTK 4 reference app
├── astro.config.mjs           # Site title, sidebar, Starlight options
└── package.json
```

## Run the site

```bash
npm install
npm run dev
```

Open <http://localhost:4321>. The dev server is managed by Astro:

```bash
astro dev status
astro dev logs
astro dev stop
```

## Build and preview

```bash
npm run build
npm run preview
```

The static output is in `dist/`. Deploy it to any static host (GitHub Pages, GitLab Pages, Netlify, Cloudflare Pages, an object store, or a plain web server).

The site uses:

- Starlight's Pagefind search (built at `npm run build` time);
- system-aware light/dark themes;
- a custom warm-paper / graphite palette with an Ubuntu-adjacent orange accent;
- local fonts via `@fontsource` (no external font requests).

## Add or edit a page

1. Create `src/content/docs/<section>/<slug>.md`.
2. Start the file with frontmatter:

```yaml
---
title: Page Title
description: One sentence for search results and social previews.
---
```

3. Do **not** add a `# H1` in the body. Starlight renders the frontmatter title as the page heading. Start with an intro paragraph and `##` sections.
4. Add the page to the sidebar in `astro.config.mjs`:

```js
{ label: 'Page Title', slug: 'section/slug' },
```

5. Use relative internal links with trailing slashes: `/platform/wayland/`.
6. Run `npm run build` to catch frontmatter, link, and search-index errors.

## Content conventions

- English prose; keep technical terms in English.
- Prefer primary sources (freedesktop specs, GNOME/KDE/Qt docs, Flathub docs).
- Every command should be runnable. Mark placeholders like `io.github.yourname.Notes` clearly.
- Use tables for comparisons and checklists for release gates.
- Keep the tone opinionated but fair: GTK and Qt are both first-class.
- Mention the tested baseline: Ubuntu 26.04 LTS, GNOME 50, GTK 4.22, libadwaita 1.9, Qt 6.10, KDE Frameworks 6.24.
- When a behavior is desktop-specific, say so and give the portable baseline.

## Reference app

```bash
cd examples/notes
python3 src/main.py
```

See `examples/notes/README.md` for Meson and Flatpak instructions.

## Design tokens

The site's tokens live at the top of `src/styles/custom.css`:

- accent: `#f97316` (dark) / `#c2410c` (light);
- backgrounds: graphite `#0a0c0f` / warm paper `#fbf8f2`;
- display font: Space Grotesk;
- body font: Inter;
- code font: JetBrains Mono.

The palette is intentionally warm and low-glare for long reading sessions, with orange reserved for actions, links, and focus.

## Deployment notes

- Set `site` in `astro.config.mjs` to the real URL before deploying so sitemap and canonical URLs are correct.
- The build has no server-side runtime; any static host works.
- Search is client-side and requires the `dist/pagefind/` directory to be deployed with the rest of the site.
- If you deploy under a subpath, set Astro's `base` and update internal links accordingly.

## Status

- 30 content pages plus the landing page.
- 32 HTML pages including the 404.
- All internal links checked; external links checked against primary sources at the time of writing.
- Reference app syntax-checked, built with Meson, validated with `desktop-file-validate` and `appstreamcli`, and launched successfully in a headless GNOME 50 Wayland session.

Add a `LICENSE` file before publishing. The prose and the example code may need different licenses; decide deliberately.
