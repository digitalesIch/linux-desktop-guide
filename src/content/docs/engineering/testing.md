---
title: Testing
description: "A practical test strategy for Linux desktop apps: unit, integration, UI, accessibility, performance, packaging, headless Wayland, and CI release gates."
---

Desktop apps are harder to test than libraries: they have a main loop, a display server, a session bus, a filesystem, and a user. The answer is not "test everything through the UI". It is a pyramid with fast tests at the bottom and a small number of high-value end-to-end tests at the top.

## The test pyramid

| Layer | What it proves | Speed | Tools |
| --- | --- | --- | --- |
| Unit | Pure logic, parsers, state machines | Milliseconds | pytest, GLib testing, QtTest, cargo test |
| Integration | Storage, D-Bus, portals, async flows | Seconds | `GTestDBus`, `dbus-run-session`, temp XDG dirs |
| UI | Keyboard flows, layout, accessibility | Seconds–minutes | dogtail, AT-SPI, Qt Quick Test |
| Packaging | The artifact users install | Minutes | flatpak-builder, lintian, snapcraft |
| Manual | Real desktop, real hardware, Orca | Hours | A human |

Most of your tests should be unit and integration tests. UI tests are expensive and flaky; use them for the critical paths, not every button.

## Unit tests

### Python

```python title="tests/test_notes.py"
from notes.domain.note import Note
from notes.application.notes import NotesService

class MemoryRepository:
    def __init__(self):
        self.notes = {}

    def list(self):
        return list(self.notes.values())

    def save(self, note):
        self.notes[note.id] = note

    def delete(self, note_id):
        self.notes.pop(note_id, None)

def test_create_trims_title():
    service = NotesService(MemoryRepository())
    note = service.create("  Hello  ", "Body")
    assert note.title == "Hello"

def test_empty_title_falls_back():
    service = NotesService(MemoryRepository())
    note = service.create("   ", "Body")
    assert note.title == "Untitled"
```

Run with `pytest -q`. Use fixtures for temp directories and fake clocks. Do not touch the real home directory.

### C / GLib

Use `GTest`:

```c title="tests/test-note.c"
#include <glib.h>
#include "note.h"

static void test_note_title(void) {
    Note *note = note_new("  Hello  ", "Body");
    g_assert_cmpstr(note_get_title(note), ==, "Hello");
    note_free(note);
}

int main(int argc, char **argv) {
    g_test_init(&argc, &argv, NULL);
    g_test_add_func("/note/title", test_note_title);
    return g_test_run();
}
```

### Qt

Use `QtTest` for C++ and `TestCase` for QML:

```cpp title="tests/tst_note.cpp"
#include <QtTest>
#include "note.h"

class TestNote : public QObject {
    Q_OBJECT
private slots:
    void trimsTitle() {
        Note note("  Hello  ", "Body");
        QCOMPARE(note.title(), QString("Hello"));
    }
};

QTEST_MAIN(TestNote)
#include "tst_note.moc"
```

### Rust

```rust title="tests/note.rs"
#[test]
fn trims_title() {
    let note = notes::Note::new("  Hello  ", "Body");
    assert_eq!(note.title, "Hello");
}
```

Use `insta` for snapshots, `proptest` for parsers, and `trybuild` for macro/API contracts.

## Integration tests

Integration tests exercise the seams: storage, D-Bus, portals, and async work. Keep them isolated from the user's real session.

### Isolate XDG directories

```python title="tests/conftest.py"
import os
from pathlib import Path
import pytest

@pytest.fixture
def xdg(tmp_path, monkeypatch):
    config = tmp_path / "config"
    data = tmp_path / "data"
    state = tmp_path / "state"
    cache = tmp_path / "cache"
    runtime = tmp_path / "runtime"
    for path in (config, data, state, cache, runtime):
        path.mkdir()
    runtime.chmod(0o700)
    monkeypatch.setenv("XDG_CONFIG_HOME", str(config))
    monkeypatch.setenv("XDG_DATA_HOME", str(data))
    monkeypatch.setenv("XDG_STATE_HOME", str(state))
    monkeypatch.setenv("XDG_CACHE_HOME", str(cache))
    monkeypatch.setenv("XDG_RUNTIME_DIR", str(runtime))
    return tmp_path
```

### Isolate D-Bus

```bash title="Terminal"
dbus-run-session -- pytest -q
```

For GLib apps, `GTestDBus` starts a private session bus. For portal tests, run a mock portal or use the real one in a nested session.

### Test async work

- Use a fake clock or `GLib.MainLoop` with a timeout.
- Assert cancellation: cancel the task and verify no stale state is applied.
- Assert error paths: permission denied, disk full, network timeout.
- Do not sleep arbitrarily; wait for a condition with a deadline.

## UI tests

UI tests should verify the user-visible contract, not implementation details.

### dogtail (AT-SPI)

`dogtail` drives the accessibility tree, which makes it closer to a real user than pixel clicking.

```python title="tests/test_ui.py"
from dogtail.tree import root

def test_create_note():
    app = root.application("io.github.yourname.Notes")
    app.button("New note").click()
    assert app.child("Untitled note").shows()
```

Advantages: works with keyboard and accessibility semantics; catches missing labels. Limitations: slower, depends on AT-SPI, can be flaky if the tree changes.

### Qt Quick Test

```qml title="tests/tst_main.qml"
import QtQuick
import QtTest

TestCase {
    name: "Notes"

    function test_createNote() {
        let model = createNotesModel()
        model.addNote("Hello")
        compare(model.count, 1)
    }
}
```

Run with `qmltestrunner -input tests`.

### Screenshot tests

Screenshot tests catch layout regressions that unit tests miss.

- Run the app in a deterministic environment (fixed theme, font, scale, window size).
- Capture with the compositor's screenshot tool, not by reading the framebuffer.
- Compare with a perceptual diff, not pixel equality.
- Store baselines per theme and scale.
- Review diffs manually; do not auto-accept.

On CI, a headless Wayland compositor (`weston --backend=headless`) or Xvfb is usually easier than a full desktop session. Match the display backend to the behavior you are testing.

## Accessibility tests

- Run the critical flows with Orca enabled.
- Use Accerciser to inspect names, roles, states, and relations.
- Use dogtail to assert accessible names and roles.
- Test keyboard-only navigation, focus order, and dialog focus traps.
- Test at 200% text scaling and in high-contrast mode.
- Add accessibility checks to the release checklist, not just the test suite.

## Headless Wayland

A headless compositor gives you a real Wayland session without a physical display:

```bash title="Terminal"
export XDG_RUNTIME_DIR=$(mktemp -d)
chmod 700 "$XDG_RUNTIME_DIR"
weston --backend=headless --socket=wayland-test &
export WAYLAND_DISPLAY=wayland-test
export GDK_BACKEND=wayland
dbus-run-session -- ./build/notes
```

`weston` is the simplest starting point. For GNOME-specific behavior, use Mutter Devkit or a nested GNOME session. `grim` is wlroots-only; on GNOME use the Shell or portal screenshot path instead.

## Sanitizers, fuzzing, and reproducibility

- Build C/C++ with ASan/UBSan in CI; run the parser and protocol tests under `cargo-fuzz` or AFL++.
- Use `SOURCE_DATE_EPOCH` and a reproducible build environment; compare artifacts with `diffoscope` or `reprotest`.
- Generate an SBOM and run `cargo audit`/`cargo deny`, `pip-audit`, or the equivalent for your ecosystem.
- Test the upgrade path and the uninstall path, not just a fresh install.

## Packaging tests

The artifact is part of the product. Test it.

```bash title="Terminal"
# Flatpak
flatpak-builder --user --install --force-clean build-dir io.github.yourname.Notes.yml
flatpak run io.github.yourname.Notes
flatpak info --show-permissions io.github.yourname.Notes

# Metadata
desktop-file-validate data/io.github.yourname.Notes.desktop
appstreamcli validate --no-net data/io.github.yourname.Notes.metainfo.xml
flatpak remote-add --if-not-exists --user flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install --user -y flathub org.flatpak.Builder
flatpak run --command=flatpak-builder-lint org.flatpak.Builder manifest io.github.yourname.Notes.yml

# deb
dpkg-buildpackage -b -us -uc
lintian ../*.changes

# Snap
snapcraft pack
sudo snap install --dangerous notes_0.1.0_amd64.snap
snap run notes
```

Run the packaged app on a clean VM or container. A build that only works on your machine is not a release.

## CI

A minimal GitHub Actions workflow:

```yaml title=".github/workflows/ci.yml"
name: ci
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-26.04
    steps:
      - uses: actions/checkout@v4
      - run: sudo apt-get update
      - run: sudo apt-get install -y python3 python3-gi gir1.2-gtk-4.0 gir1.2-adw-1 \
          meson ninja-build flatpak flatpak-builder desktop-file-utils appstream \
          python3-pytest
      - run: /usr/bin/python3 -m pytest -q
      - run: desktop-file-validate data/io.github.yourname.Notes.desktop
      - run: appstreamcli validate --no-net data/io.github.yourname.Notes.metainfo.xml
  flatpak:
    runs-on: ubuntu-26.04
    steps:
      - uses: actions/checkout@v4
      - uses: flatpak/flatpak-github-actions/flatpak-builder@v6
        with:
          bundle: notes.flatpak
          manifest-path: io.github.yourname.Notes.yml
          cache-key: flatpak-builder-${{ hashFiles('**/*.yml', '**/*.json') }}
```

Cache dependencies, pin the runner image, and upload the built artifact. A CI job that builds a different app than the one you ship is worse than no CI.

## Flaky tests

UI tests fail for reasons unrelated to the app: focus, timing, animations, D-Bus races, and screen size. Reduce flakiness:

- Disable animations in tests.
- Fix the window size and theme.
- Wait for conditions, not fixed sleeps.
- Isolate XDG, D-Bus, and network.
- Use a fresh app instance per test.
- Retry only known-flaky tests, and track the flake rate.
- Fix the race instead of adding a longer timeout.

## Coverage

Coverage is a smell detector, not a goal.

- Aim for high coverage of domain logic and parsers.
- Do not chase 100% on UI glue.
- Use branch coverage where available.
- Review uncovered error paths; those are where bugs live.
- `coverage.py`, `gcovr`, `cargo llvm-cov`, and `lcov` all work.

## Release gates

Before a release, require:

- ☐ Unit and integration tests pass.
- ☐ Critical UI flows pass under AT-SPI.
- ☐ Accessibility checks pass (keyboard, Orca, contrast, scaling).
- ☐ Metadata validates.
- ☐ Flatpak/deb/Snap artifacts build and launch.
- ☐ The app runs with denied permissions and explains the failure.
- ☐ The upgrade path from the previous release is tested.
- ☐ Performance budgets are checked.
- ☐ No known critical security issue is open.

Next: [Reliability & Logging](/engineering/reliability/) — what happens when the disk is full, the network is down, and the compositor restarts.
