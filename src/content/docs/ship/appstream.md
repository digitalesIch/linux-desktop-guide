---
title: AppStream & Metadata
description: How to write AppStream metainfo, screenshots, release notes, and desktop entries that make a Linux app discoverable, trustworthy, and installable from a software center.
---

A software center does not see your app the way you do. It sees a name, a summary, an icon, screenshots, categories, a license, release notes, and a permission set. If any of those are missing or inconsistent, the app looks unfinished — or never appears at all.

**AppStream** is the metadata standard behind GNOME Software, KDE Discover, Flathub, and most distribution catalogs. The file is small, but it is part of the product.

## Where the file goes

```text
/usr/share/metainfo/io.github.yourname.Notes.metainfo.xml
```

For Flatpak, install it to `$FLATPAK_DEST/share/metainfo/`. The filename must match the component ID: `io.github.yourname.Notes.metainfo.xml`.

Legacy `.appdata.xml` files are still accepted, but new apps should use `.metainfo.xml`.

## A complete example

```xml title="data/io.github.yourname.Notes.metainfo.xml"
<?xml version="1.0" encoding="UTF-8"?>
<component type="desktop-application">
  <id>io.github.yourname.Notes</id>

  <name>Notes</name>
  <summary>Write and organize notes</summary>

  <metadata_license>CC0-1.0</metadata_license>
  <project_license>GPL-3.0-or-later</project_license>

  <description>
    <p>Notes is a small, fast note-taking app for the Linux desktop.</p>
    <p>It stores your notes locally, works offline, and integrates with the desktop through standard XDG interfaces.</p>
  </description>

  <launchable type="desktop-id">io.github.yourname.Notes.desktop</launchable>

  <url type="homepage">https://example.org/notes</url>
  <url type="bugtracker">https://example.org/notes/issues</url>
  <url type="vcs-browser">https://example.org/notes</url>

  <developer id="org.example">
    <name>Your Name</name>
  </developer>

  <categories>
    <category>Office</category>
    <category>Utility</category>
  </categories>

  <keywords>
    <keyword>notes</keyword>
    <keyword>writing</keyword>
    <keyword>markdown</keyword>
  </keywords>

  <screenshots>
    <screenshot type="default">
      <caption>Write notes with a calm, keyboard-first interface</caption>
      <image type="source" width="1600" height="900">https://example.org/notes/screenshot-light.png</image>
    </screenshot>
    <screenshot>
      <caption>The same notes in dark mode</caption>
      <image type="source" width="1600" height="900">https://example.org/notes/screenshot-dark.png</image>
    </screenshot>
  </screenshots>

  <releases>
    <release version="0.1.0" date="2026-11-10">
      <description>
        <p>First public release.</p>
        <ul>
          <li>Local-first notes with an adaptive sidebar.</li>
          <li>Keyboard-first navigation and search.</li>
          <li>Flatpak build with minimal permissions.</li>
        </ul>
      </description>
    </release>
  </releases>

  <content_rating type="oars-1.1"/>

  <provides>
    <binary>notes</binary>
  </provides>
</component>
```

## The fields that matter

| Field | Why it matters |
| --- | --- |
| `<id>` | Must match the desktop file, icon, Flatpak ID, and D-Bus name |
| `<name>` | The display name, not the binary name; keep it short (Flathub quality guidance prefers under 20 characters) |
| `<summary>` | One line, no trailing period; Flathub quality guidance targets 10–25 characters, max ~35 |
| `<description>` | 1–3 short paragraphs; use `<ul>` for features |
| `<launchable>` | The installed desktop-file ID (`<id>.desktop`), not the executable command |
| `<developer>` | The human or organization behind the app |
| `<categories>` | Controls menu placement and discovery |
| `<keywords>` | Improves search; use real user terms |
| `<screenshots>` | The single biggest factor in install conversion; tag non-English captures with `xml:lang` |
| `<releases>` | Version history and user-facing notes |
| `<content_rating>` | Required for many catalogs; OARS 1.1 |
| `<provides>` | Declares binaries, MIME types, or libraries |
| `<url>` | Homepage, bug tracker, donation, translate |
| `<translation>` | Declares the gettext/Qt translation domain so software centers can show available languages |

## Screenshots

Screenshots are not decoration. They are how users decide whether the app is for them.

- Use the real app, not a mockup.
- Show the primary workflow, not a settings page.
- Provide light and dark variants when the app supports both.
- For Flathub, capture the app window at 1000×700 or smaller (2000×1400 for HiDPI) so text stays legible in the store UI.
- Keep the real native window shadow, title bar, and rounded corners; do not crop them out, and do not use transparent backgrounds or fake window frames.
- Tag screenshots with the language they show (`xml:lang`), and keep captions to one sentence without a trailing period.
- Include a caption that explains what the user is looking at.
- Localize captions and images where practical.
- Keep the screenshots current; an outdated UI is a trust signal in the wrong direction.

Flathub mirrors screenshots from the URLs in the metainfo. Use stable HTTPS URLs, not a temporary CDN link.

## Release notes

Release notes are user-facing. Write them for the person deciding whether to update.

```xml
<releases>
  <release version="0.2.0" date="2026-12-01">
    <description>
      <p>Search is now instant, even with thousands of notes.</p>
      <ul>
        <li>New command palette (Ctrl+K).</li>
        <li>Fixed a crash when the keyring is locked.</li>
        <li>Improved contrast in high-contrast mode.</li>
      </ul>
    </description>
  </release>
</releases>
```

- Put the newest release first.
- Use ISO dates (`YYYY-MM-DD`).
- Mention breaking changes and migration steps.
- Do not paste the git log.
- Keep the version consistent with the package and the app's `--version`.

## Icons and branding

- Install a scalable SVG and a 256×256 PNG under `hicolor`.
- Make the icon legible at 16 px; test it in the app grid and the window switcher.
- Do not use another project's logo or a trademark you do not own.
- Optional `<branding>` colors can tint the software-center page:

```xml
<branding>
  <color type="primary" scheme_preference="light">#c6ff3d</color>
  <color type="primary" scheme_preference="dark">#3f7d20</color>
</branding>
```

## Desktop entry consistency

The metainfo and desktop file must agree:

| Metainfo | Desktop file |
| --- | --- |
| `<id>` | Filename; `StartupWMClass` must match the actual `WM_CLASS` (test it) |
| `<launchable>` | Installed desktop-file ID (`<id>.desktop`); `Exec` is the command, not the launchable |
| `<name>` | `Name` |
| `<summary>` | `Comment` |
| `<categories>` | `Categories` |
| `<keywords>` | `Keywords` |
| MIME types in `<provides>` | `MimeType` |

A mismatch is a common review failure. Validate both files in CI.

## Validation

```bash title="Terminal"
appstreamcli validate --no-net data/io.github.yourname.Notes.metainfo.xml
desktop-file-validate data/io.github.yourname.Notes.desktop
```

Fix every error. Warnings are worth reviewing; some are stylistic, some become errors in the next AppStream release.

For Flathub, also run:

```bash title="Terminal"
flatpak-builder-lint manifest io.github.yourname.Notes.yml
```

## Common validation errors

| Error | Cause | Fix |
| --- | --- | --- |
| `metainfo-filename-cid-mismatch` | ID differs from filename/Flatpak | Use one ID everywhere |
| `missing-launchable` | No `<launchable>` | Add the desktop-file ID |
| `description-markup` | Invalid HTML/XML in description | Use `<p>`, `<ul>`, `<li>`, `<em>`, `<code>` only |
| `screenshot-no-media` | No image URL | Add a stable HTTPS screenshot |
| `releases-info-missing` | No `<releases>` | Add at least one release |
| `developer-info-missing` | No developer | Add `<developer><name>` |
| `metadata-license-missing` | No metadata license | Add a valid metadata license |
| `url-homepage-missing` | No homepage | Add `<url type="homepage">` |
| `category-invalid` | Unknown category | Use the AppStream category list |
| `summary-too-long` | Summary is a paragraph | Keep it short; Flathub quality guidance targets 10–25 characters |

Icon and desktop-file consistency checks happen in `appstreamcli compose` and Flathub's linter, not in the raw `validate` output. Run both.

## Metadata checklist

- ☐ ID matches everywhere: metainfo, desktop, icon, Flatpak, D-Bus.
- ☐ Name and summary are user-facing and concise.
- ☐ Description explains the value, not the implementation.
- ☐ At least one screenshot, light/dark variants where useful, with captions and `xml:lang` tags.
- ☐ Release notes for the current version, newest first.
- ☐ License is valid SPDX and matches the source.
- ☐ Developer and contact URL are present.
- ☐ Categories and keywords are accurate.
- ☐ Content rating is present and accurate.
- ☐ The desktop file passes validation.
- ☐ If the app is translated, `<translation type="gettext">` or `<translation type="qt">` is present and the `.mo`/`.qm` files are installed.
- ☐ The metainfo passes `appstreamcli validate --no-net` and `flatpak-builder-lint appstream`.
- ☐ The icon is installed and legible at 16 px.

Next: [Flathub](/ship/flathub/) — the submission and maintenance process.
