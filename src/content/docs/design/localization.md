---
title: Localization
description: "Internationalization and localization for Linux desktop apps: gettext, Qt Linguist, plurals, dates, RTL layouts, fonts, metadata translation, and a workflow that keeps translations current."
---

An app that only works in English is an app that excludes most of the world. Localization is not a late-stage translation pass; it is a set of decisions about strings, layout, formatting, and fonts that you make while writing the first screen.

The Linux ecosystem has strong translation infrastructure: gettext, Weblate, GNOME's Damned Lies, KDE's Lokalize, and distribution translation teams. Use it instead of inventing a JSON translation format.

## Internationalization vs localization

- **Internationalization (i18n):** making the code capable of supporting multiple languages and locales. No hardcoded strings, no concatenation, no fixed date formats.
- **Localization (l10n):** providing the actual translations, formats, and cultural adaptations for a locale.

You do i18n once; translators do l10n continuously.

## Strings

### Mark every user-facing string

**C / GLib:**

```c
#include <glib/gi18n.h>

label = gtk_label_new(_("Open note"));
```

**Python:**

```python
import gettext
_ = gettext.gettext
ngettext = gettext.ngettext

label.set_text(_("Open note"))
```

**Qt / C++:**

```cpp
auto *label = new QLabel(tr("Open note"));
```

**QML:**

```qml
Label { text: qsTr("Open note") }
```

**Rust:**

Use `gettext-rs` with the same `.po` workflow, or Fluent for message-heavy apps. Do not hardcode English strings in Rust macros that bypass extraction.

### Do not concatenate

Translators need the full sentence, not fragments.

```python
# Bad: word order differs across languages
message = _("Deleted") + " " + str(count) + " " + _("notes")

# Good: one translatable string with a placeholder
message = ngettext("Deleted %d note", "Deleted %d notes", count) % count
```

### Use placeholders, not string interpolation

```python
# Good
label = _("Welcome back, {name}").format(name=user.name)
```

Keep placeholders named and documented. Do not change them without updating translators.

### Plurals

Use the platform's plural API. Plural rules differ across languages; a simple `count == 1` check is wrong for many locales.

```python
ngettext("%d note", "%d notes", count)
```

```c
ngettext("%d note", "%d notes", count)
```

Qt: `tr("%n note(s)", "", count)`. QML: `qsTr("%n note(s)", "", count)`.

### Context

Words like "Open" (verb) and "Open" (adjective), or "File" (noun) and "File" (verb), need context. Use `pgettext()` / `QT_TRANSLATE_NOOP` with a context string.

```c
_("Open")                 // ambiguous
pgettext("verb", "Open")  // clear to the translator
```

### Translator comments

Add comments for ambiguous strings, placeholders, and UI constraints.

```c
// TRANSLATORS: Title of the dialog that appears when a note is deleted.
_("Delete note?")
```

## Build integration

### Meson + gettext

```python title="meson.build"
i18n = import('i18n')
i18n.gettext('notes', preset: 'glib')
```

```text title="po/LINGUAS"
de
es
fr
pt_BR
```

```bash title="Terminal"
# Extract strings into a POT template
xgettext --from-code=UTF-8 -o po/notes.pot src/*.py

# Merge the template into existing translations
msgmerge --update po/de.po po/notes.pot

# Compile for testing
msgfmt po/de.po -o po/de.mo
```

Install `.mo` files to `$prefix/share/locale/<lang>/LC_MESSAGES/notes.mo`.

### Qt

Use `lupdate` to extract `tr()` strings into `.ts` files, translate them in Qt Linguist, and `lrelease` them into `.qm` files. Install them under `$prefix/share/<app>/translations/` or embed them in resources.

## Dates, numbers, and currency

Never format dates and numbers by hand.

- **GLib:** `GDateTime` with locale-aware format strings; use `g_date_time_format()` for display, ISO 8601 for storage.
- **Qt:** `QLocale` for dates, numbers, currency, and measurement units.
- **Python:** `datetime` + `locale` or `babel`; prefer `babel` for explicit locale control.
- **Rust:** `chrono` + `time` with locale support, or ICU4X for full CLDR data.

Store timestamps in UTC (or with an explicit offset) and convert for display. Do not assume the first day of the week is Sunday or Monday; read the locale.

## Layout and RTL

Right-to-left languages (Arabic, Hebrew, Persian, Urdu) require more than mirrored text.

- Use start/end layout APIs (`set_margin_start`, `set_margin_end`) instead of left/right.
- Let the toolkit mirror the layout automatically.
- Mirror directional icons (arrows, back/forward) but not universal symbols (play, check, warning).
- Test with `LANG=ar_EG.UTF-8` and a full RTL desktop session.
- Avoid absolute positioning and hardcoded x-coordinates.
- Check that progress bars, sliders, and timelines make sense in RTL.

GTK and Qt handle most mirroring when the locale is RTL. Your job is to avoid assumptions that defeat it.

## Fonts and text rendering

- Use the system UI font; it has fallbacks for the user's language.
- Do not hardcode a font family that lacks CJK, Arabic, or Devanagari glyphs.
- Test with long German compounds, Japanese, Arabic, and Hindi.
- Do not use fixed-width labels for translated text.
- Allow text to wrap; avoid truncating essential information.
- Check line height for scripts with tall glyphs and diacritics.

Ubuntu ships Noto fonts for broad coverage. If you bundle a font for branding, pair it with the system fallback rather than replacing the UI font entirely.

## Metadata and desktop entry

Translate user-visible metadata, not just the UI.

```ini title="io.github.yourname.Notes.desktop"
Name=Notes
Name[de]=Notizen
Comment=Write and organize notes
Comment[de]=Notizen schreiben und organisieren
Keywords=notes;writing;
Keywords[de]=Notizen;Schreiben;
```

```xml title="metainfo localization"
<name>Notes</name>
<name xml:lang="de">Notizen</name>
<summary>Write and organize notes</summary>
<summary xml:lang="de">Notizen schreiben und organisieren</summary>
```

AppStream supports localized names, summaries, descriptions, and screenshots. Software centers show the user's language when available.

## Translation workflow

1. **Extract** strings into a `.pot` template on every change.
2. **Translate** in a platform that supports context, plurals, and comments (Weblate, Damned Lies, Lokalize, Crowdin).
3. **Review** by a native speaker, especially for UI-critical strings.
4. **Test** with the translated build, not just the `.po` file.
5. **Freeze** strings before a release; give translators a deadline.
6. **Credit** translators in the about dialog or release notes.

Do not machine-translate the UI and ship it unreviewed. Flathub explicitly rejects low-quality machine translation, and users notice.

## Testing localization

- Run with `LANG=de_DE.UTF-8`, `LANG=ar_EG.UTF-8`, `LANG=ja_JP.UTF-8`.
- Use pseudo-localization (replace letters with accented variants and expand strings by 30%) to catch truncation.
- Test plural forms with 0, 1, 2, 5, 11, 21, and 100.
- Test date, time, number, and currency formats.
- Test RTL layout and mirrored icons.
- Test with a larger system font and 200% scaling.
- Check the desktop entry and software-center listing in the translated locale.

## Localization checklist

- ☐ No user-facing string is hardcoded outside the translation system.
- ☐ No string concatenation for sentences.
- ☐ Plurals use `ngettext` / `tr("%n")`.
- ☐ Translators have context and comments for ambiguous strings.
- ☐ Dates, numbers, and currency use locale APIs.
- ☐ Layout uses start/end, not left/right.
- ☐ Icons are mirrored where appropriate.
- ☐ The UI works with long translations and 200% text scaling.
- ☐ Desktop entry and AppStream metadata are localized.
- ☐ English is complete; additional languages are reviewed.
- ☐ The app runs in an RTL locale.
- ☐ Translators are credited.

## Key takeaways

- Internationalize while writing the first screen, not after the release.
- Use gettext or Qt's translation system; do not invent a format.
- Plurals, dates, numbers, and RTL are not edge cases.
- Metadata translation is part of the product.
- Machine translation without review is worse than no translation.

Next: [Architecture](/engineering/architecture/) — how to structure the code so the UI stays fast and the app stays maintainable.
