# Tasks

## 1. Canonical example

- [x] 1.1 Align `examples/notes/src/main.py` with the tutorial: data path, `.body` class, accessibility labels, About fields, and the `--quit-after-startup` hook.
- [x] 1.2 Align the desktop entry, AppStream metadata, and icon with the tutorial; use the application ID for `StartupWMClass`.
- [x] 1.3 Keep desktop and AppStream categories consistent.

## 2. Tutorial

- [x] 2.1 Update every file block to match the canonical example.
- [x] 2.2 Fix the data-path sentences so they name the same path as the code.
- [x] 2.3 Label the Meson block as `meson`, not `python`.

## 3. Consistency gate

- [x] 3.1 Add `scripts/check-examples.mjs` with the file mapping and unified diff output.
- [x] 3.2 Add the `check:examples` npm script.
- [x] 3.3 Run it from `scripts/check-docs.mjs`.
- [x] 3.4 Document it in `README.md` and `AGENTS.md`.

## 4. Navigation

- [x] 4.1 Point `start/native-standard` to `platform/ubuntu`.
- [x] 4.2 Add a `Next` link from `platform/ubuntu` to `platform/wayland`.
- [x] 4.3 Link the glossary from `start/why-linux` and `platform/ubuntu`.

## 5. Verification

- [x] 5.1 Run `npm run check:examples`.
- [x] 5.2 Run `npm run check:docs`.
- [x] 5.3 Run `npm run check:quality`.
- [x] 5.4 Validate the example with `python3 -m py_compile`, `desktop-file-validate`, `appstreamcli validate --no-net`, and Meson.
- [x] 5.5 Commit on `workspace`, merge to `main`, and archive the change.
