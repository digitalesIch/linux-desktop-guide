# Design

## Context

See `proposal.md`. The tutorial is a hand-written Markdown page with code blocks titled after the files they create. The runnable project lives in `examples/notes`. Both were edited independently, so small differences accumulated. The site build does not compile or compare the example, and `check:docs` never touches it.

## Goals / Non-Goals

**Goals:**

- One canonical source for the tutorial files: `examples/notes`.
- A deterministic offline check that fails when a tutorial block and its example file diverge.
- A reading path that matches the sidebar: Start → Platform → Design → Engineering → Ship → Reference.
- A glossary that is reachable from the guide, not only from the sidebar.

**Non-Goals:**

- Compiling the Qt, Rust, or GTK snippets. They are illustrative and do not form runnable projects.
- Running the GTK app in CI. The check is textual and metadata-aware, not a GUI test.
- Turning the example into a product or a showcase.
- Replacing the tutorial with generated Markdown.

## Decisions

### 1. The example is authoritative

The tutorial explains the code; the example is what readers can run. When they disagree, the example wins. The tutorial's prose may add context, but its file blocks must match the files byte-for-byte after trimming trailing blank lines.

### 2. Compare only titled file blocks

`check-examples.mjs` extracts fenced blocks whose title is one of the known example paths:

- `src/main.py`
- `meson.build`
- `io.github.yourname.Notes.yml`
- `data/io.github.yourname.Notes.desktop`
- `data/io.github.yourname.Notes.metainfo.xml`
- `data/io.github.yourname.Notes.svg`

This avoids comparing illustrative fragments or terminal commands. If a block is missing, the check fails: the tutorial must keep showing the file.

### 3. Report a unified diff

On mismatch, print the example path, the tutorial line, and a unified diff. A bare "mismatch" is not actionable.

### 4. Keep the check offline and dependency-free

Use Node's filesystem APIs and a small diff formatter. No Python, Meson, Flatpak, or appstream tools are required for the default gate. The example is still validated manually with `desktop-file-validate`, `appstreamcli`, `py_compile`, and Meson when those tools are present.

### 5. The sidebar order is the reading order

The "Next" chain must not skip a section. `start/native-standard` points to `platform/ubuntu`, and `platform/ubuntu` points to `platform/wayland`. The existing chain then runs through Platform to Design.

### 6. Link the glossary where terms first matter

Add one link in `start/why-linux` (the contracts section) and one in `platform/ubuntu` ("See also"). This gives the glossary real inbound links without turning every page into a link farm.

## Risks / Trade-offs

- **Byte-for-byte comparison is strict** → it is intentional; comments and formatting are part of what the reader copies. The example is the canonical formatting.
- **The check only covers one tutorial** → it is the only tutorial with a full runnable project; extend the mapping when another one exists.
- **The tutorial can still drift in prose** → the check catches code and metadata, which are the parts that break when copied. Prose review remains editorial.
- **`--quit-after-startup` is a test hook** → keep it in both files and describe it as a smoke-test hook, not a user feature.
