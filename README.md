# Linux Desktop Guide

A field guide to building fast, accessible, deeply integrated native apps for the Linux desktops that matter. It defines a small, evidence-based set of platform targets, a default stack for each, and a shared quality bar. The [Native Standard](/start/native-standard/#purpose-of-the-guide) states the guide's purpose and what counts as a complete development path; the [Quality Bar](/ship/quality-bar/#release-criteria) defines the criteria an app must meet before it is release-ready.

The project is both:

- **a documentation website** built with [Astro Starlight](https://starlight.astro.build/);
- **a Markdown source collection** in `src/content/docs/`, so the content can be reused in MkDocs, Obsidian, GitHub, or any other renderer.

The companion app in `examples/notes/` is a minimal GTK 4 + libadwaita teaching example with Meson and Flatpak packaging; its README lists the production work it deliberately leaves out.

Repository: [digitalesIch/linux-desktop-guide](https://github.com/digitalesIch/linux-desktop-guide).

Live: <https://digitalesich.github.io/linux-desktop-guide/>

## Platform targets

The guide is not a distro-agnostic tutorial. It supports a small, evidence-based target matrix:

- **Reference:** Ubuntu 26.04 LTS + GNOME (GTK 4 / libadwaita) and Fedora 45 KDE + Qt (Qt 6 / Kirigami).
- **Validation:** Fedora 45 Workstation + GNOME (upstream GTK/GNOME) and Arch Linux (rolling GTK/Qt).
- **Compatibility:** Debian 13 (stable base, older GTK/Qt; Flatpak for newer stacks).

Start at `src/content/docs/targets/index.md`; the method and evidence are in `targets/selection.md`; the machine-readable matrix is `src/data/targets.json`. `npm run check:targets` enforces dates, sources, scores, roles, and coverage.

## Platform guides and Linux-wide guidance

The target profiles are platform guides: they describe what is native on Ubuntu + GNOME and Fedora + KDE. Shared standards, architecture, design, engineering, and release guidance live in the Linux-wide chapters and are linked, not repeated. If you ship one app across targets, start with `src/content/docs/start/one-app-across-targets.md`.

## Structure

```text
.
├── src/
│   ├── content/docs/          # Markdown/MDX source of truth
│   │   ├── targets/           # Curated platform targets and selection method
│   │   ├── start/             # Why Linux, stack choice, tutorial, standard, cross-target recipe
│   │   ├── platform/          # Ubuntu, Wayland, XDG, integration, Flatpak, packaging, security
│   │   ├── design/            # Principles, visual language, layout, interaction, a11y, i18n
│   │   ├── engineering/       # Architecture, GTK, Qt, Rust, performance, testing, reliability
│   │   ├── ship/              # AppStream, user documentation, Flathub, release checklist, quality bar
│   │   └── reference/         # Baseline, quality signals, checklists, style guide, glossary, resources
│   ├── components/            # PageTitle override and other Starlight overrides
│   ├── data/baseline.json     # Ubuntu/GNOME reference baseline
│   ├── data/targets.json      # Curated target matrix and evidence scores
│   ├── styles/custom.css      # Design tokens and site styling
│   └── assets/                # Logo and hero artwork
├── scripts/                   # Baseline and maintenance checks
├── tools/docs-mcp/            # Read-only stdio MCP server for agents
├── public/                    # Favicon, hero SVG, PWA manifest, service worker, icons, offline page
├── examples/notes/            # Runnable GTK 4 teaching example
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
npm run check:baseline
npm run build
npm run preview
```

The static output is in `dist/`. Deploy it to any static host (GitHub Pages, GitLab Pages, Netlify, Cloudflare Pages, an object store, or a plain web server).

GitHub Pages on a private repository requires a plan that supports private Pages (GitHub Pro, Team, or Enterprise Cloud). On the Free plan, make the repository public before enabling Pages; the deployed site can still be public while the repository is private only on a paid plan.

The site uses:

- Starlight's Pagefind search (built at `npm run build` time);
- system-aware light/dark themes;
- a custom ink / lime / cyan palette with a dark hero stage;
- local fonts via `@fontsource` (no external font requests).

## Install as an app

The site is an installable Progressive Web App on the deployed HTTPS site:

- **Android:** Chrome menu → **Install app**. Chrome uses a WebAPK, so the installed guide can appear in the app launcher.
- **iOS:** Safari → Share → **Add to Home Screen**. The installed app uses the Apple touch icon and standalone display.
- **Offline:** the shell, icons, and previously visited pages are cached. Full-text search still needs a network connection.

Installation and service workers require HTTPS or `localhost`. The LAN preview over `http://192.168.178.38:4330/` is not a secure context on a phone; use the deployed site or an HTTPS tunnel for device testing.

`npm run check:pwa` validates the manifest, icons, service worker, offline page, and install meta tags. Regenerate the icons with `npm run generate:pwa-icons`. Bump `CACHE_VERSION` in `public/sw.js` when the shell or cache strategy changes.

## Documentation checks

Run the deterministic local gate before releasing:

```bash
npm run check:docs
```

It runs, in order:

1. baseline validation;
2. tutorial/example consistency checking;
3. target-matrix validation;
4. freshness fixture tests;
5. a full Astro build (including agent docs and Pagefind);
6. PWA validation;
7. agent-doc validation;
8. the MCP server tests;
9. internal link and anchor checking against `dist/`.

The default gate is offline and repeatable. External URLs are checked separately:

```bash
npm run check:links:external
```

Network and DNS failures are warnings, because a local network or a site blocking automated requests is not proof of a broken link. Strict mode fails on real HTTP 4xx/5xx responses. Known blocked hosts are listed in `scripts/external-allowlist.mjs` with a reason.

`npm run check:links` runs only the fast internal check. `npm run check:examples` compares the file blocks in the first-app tutorial with `examples/notes`; it fails on drift and prints a line diff. `npm run check:targets` validates the curated target matrix: dates, scores, sources, roles, and coverage gates. `npm run check:pwa` validates the manifest, icons, service worker, offline page, and install meta tags.

Freshness checks compare the recorded baseline and target values with public upstream sources:

```bash
npm run check:freshness          # human-readable report
npm run test:freshness           # offline fixture tests
```

The scheduled `Freshness` workflow runs the check weekly and opens or updates an issue labeled `docs:freshness` when a source changes. It never edits content. A root-domain build can be validated with:

```bash
npm run check:root-build
```

Browser-based quality checks are separate because they need a local Chrome installation:

```bash
npm run check:quality
```

It builds the site, serves `dist/` on a loopback-only port, and runs Lighthouse against the landing page, a start page, a framework guide, the accessibility page, and the packaging page. Accessibility, best practices, and SEO must score 100. Performance must stay at or above 90; the observed local range is 98–100.

Use `npm run check:quality -- --no-build` to audit an existing `dist/` without rebuilding, for example after `npm run check:docs`.

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

- Follow `src/content/docs/reference/style-guide.md` for voice, terminology, links, code, screenshots, accessibility, localization, and agent-facing Markdown.
- English prose; keep technical terms in English.
- Prefer primary sources (freedesktop specs, GNOME/KDE/Qt docs, Flathub docs).
- Every command should be runnable. Mark placeholders like `io.github.yourname.Notes` clearly.
- Use tables for comparisons and checklists for release gates.
- Keep the tone opinionated but fair: GTK and Qt are both first-class.
- Do not use Apple/macOS/Windows as the reference point or promote proprietary/non-standard vendors. Name an alternative only as a sourced example when it is open source, actively maintained, widely accepted, and compared on quality signals.
- Mention the tested target and its baseline: Ubuntu 26.04 LTS + GNOME (GTK 4.22, libadwaita 1.9) or Fedora 45 KDE + Qt (Qt 6.11, KDE Frameworks 6.30+). The full matrix is in `/targets/`.
- When a behavior is desktop-specific, say so and give the portable baseline.

## Teaching example

```bash
cd examples/notes
python3 src/main.py
```

See `examples/notes/README.md` for Meson and Flatpak instructions.

## Agent docs

The build generates agent-friendly documentation from the same HTML:

- `/llms.txt` — curated index grouped by section.
- `/llms-full.txt` — the complete guide in one Markdown file.
- `/<route>.md` — a clean Markdown version of every page, e.g. `/start/why-linux.md`.
- Every HTML page advertises its Markdown sibling via `rel="alternate"` and `/llms.txt` via `rel="describedby"`.

These files are build artifacts in `dist/`, not committed duplicates. Verify them with:

```bash
npm run check:agent-docs
```

Content negotiation (`Accept: text/markdown`) is intentionally left to a future host/CDN rule.

## Documentation MCP server

Agents can read the guide through a local MCP server instead of loading `llms-full.txt`:

```bash
npm run mcp:docs
```

The server speaks MCP over stdio and exposes five read-only tools:

- `search_docs` — ranked search over titles, descriptions, headings, and body text, with section filters and excerpts;
- `get_page` — one page's Markdown, metadata, headings, and URL by slug;
- `list_pages` — the table of contents grouped by section;
- `get_related` — related pages based on internal links, section, and text similarity;
- `get_baseline` — the validated platform data from `src/data/baseline.json`.

It indexes `src/content/docs/**/*.md`, rejects path traversal and unknown slugs, writes nothing, and makes no network requests. The index refreshes automatically when source files change.

`opencode.jsonc` registers it as the local `docs` server:

```jsonc
{
  "mcp": {
    "servers": {
      "docs": {
        "type": "local",
        "command": ["node", "tools/docs-mcp/server.mjs"],
        "cwd": "."
      }
    }
  }
}
```

Run the server tests with:

```bash
npm run test:docs-mcp
```

The guide deliberately operates only this local stdio server. There is no remote MCP endpoint, no hosted worker, and no Cloudflare deployment. Agents that cannot run a local process use `llms.txt` or the per-page Markdown instead.

## Design tokens

The site's tokens live at the top of `src/styles/custom.css`:

- paper: `#ffffff` (light) / `#0b0d12` (Prism Ink dark);
- surfaces: `#ffffff` (light) / `#141821` (dark);
- ink: `#111318` (light) / `#f3f5f7` (dark);
- functional accent: deep violet `#6d28d9` (light) / lavender `#c4b5fd` (dark);
- spectrum: rose, amber, lime, cyan, and violet, used only for foil edges, the hero glow, page-title rules, links and hover states;
- display font: Space Grotesk;
- body font: Inter;
- code font: JetBrains Mono.

The palette is deliberately paper-like and airy, with the spectrum reserved for refraction rather than full surfaces. Both themes share the same spectrum; the dark theme uses a brighter foil blend.

## Deployment notes

- The default build targets GitHub Pages at `https://digitalesich.github.io/linux-desktop-guide/` with `base: /linux-desktop-guide`. `site.config.mjs` holds both values.
- To use a custom domain at the root, set `SITE_URL=https://example.com` and `BASE_PATH=/` in the build environment. No other code change is needed.
- The build has no server-side runtime; any static host works.
- Search is client-side and requires the `dist/pagefind/` directory to be deployed with the rest of the site.
- Internal links, the manifest, the service worker, and the agent Markdown all follow the configured base path. Run `npm run check:docs` after changing it.
- The public release checklist is in [PUBLIC_RELEASE.md](PUBLIC_RELEASE.md): licensing, history cleanup, Pages setup, freshness, and feedback checks.
- Verify the deployed site after a deployment: `npm run check:deployed -- https://digitalesich.github.io/linux-desktop-guide/`. The Pages workflow runs the same check in its `verify` job.

## License

- **Code** — scripts, site components, and the example app are licensed under the [MIT License](LICENSE).
- **Prose and documentation** — the guide text, diagrams, and screenshots are licensed under [CC BY-SA 4.0](LICENSE-docs).
- **Third-party assets** — fonts, icons, and bundled dependencies keep their own licenses; see the package metadata and upstream projects.

The two licenses are deliberate: MIT keeps the code easy to reuse, and CC BY-SA keeps derived documentation open under the same terms.

## Status

- 42 Markdown source files and 43 built HTML pages, including the 404.
- All internal links checked; external links checked against primary sources at the time of writing.
- Teaching example syntax-checked, built with Meson, validated with `desktop-file-validate` and `appstreamcli`, and launched successfully in a headless GNOME 50 Wayland session. It is not a complete production app; its README lists the missing product work.

Licenses are in `LICENSE` (code) and `LICENSE-docs` (prose).
