---
title: Performance
description: Startup budgets, main-loop discipline, rendering, memory, battery, and a profiling workflow with Sysprof, perf, heaptrack, and GTK Inspector.
---

Performance is not a benchmark score. It is the feeling that the app responds before you finish the thought. It is also measurable, budgetable, and regressable — which means it belongs in engineering, not in a late optimization sprint.

Ubuntu 26.04 ships **Sysprof** as a default system utility. Use it. A profile of the real app on the oldest hardware you support is worth more than a hundred guesses.

## Budgets

Set budgets before optimizing. A focused desktop app should be able to defend these on a mid-range laptop from the last five years.

| Metric | Target | How to measure |
| --- | --- | --- |
| Cold start to first window | < 1 s (focused app), < 2 s (complex app) | Sysprof, startup marks |
| Time to interactive | < 500 ms after first frame | Manual + profile |
| Input latency | < 50 ms | Manual, `xinput`/`wev`, frame timings |
| Frame time during scroll | < 16.7 ms (60 fps) | Sysprof, GTK Inspector |
| Idle CPU | < 1% | `top`, `powertop`, Sysprof |
| Resident memory | < 200 MB (document app), < 500 MB (complex) | `/usr/bin/time -v`, heaptrack |
| Idle wakeups | Near zero | `powertop`, `perf` |
| Install size | < 20 MB app payload (Flatpak runtime shared) | `du -sh` |

These are not universal laws. A video editor and a notes app have different budgets. The point is to write the budget down and test it.

## Measure before you optimize

### Sysprof

Sysprof records CPU samples, marks, and (with perf integration) kernel events. It is the default on Ubuntu 26.04 and understands GLib/GTK apps.

1. Start Sysprof.
2. Launch the app and perform the slow action.
3. Stop the recording.
4. Inspect the call tree, flame graph, and marks.
5. Fix the top bottleneck, not the most interesting one.

Add marks around startup phases and long operations so the profile tells a story: "open database", "load notes", "first paint".

### perf

```bash title="Terminal"
perf record -g ./build/notes
perf report
```

`perf` is excellent for CPU hotspots and scheduler behavior. It needs symbols; build with debug info (`-g`) for profiling, and strip for release.

### heaptrack

```bash title="Terminal"
heaptrack ./build/notes
heaptrack_gui heaptrack.notes.*.gz
```

Use it for allocation counts, peak memory, and leaks. A slow app is often an allocation-heavy app.

### GTK Inspector

```bash title="Terminal"
GTK_DEBUG=interactive ./build/notes
```

Inspect the widget tree, CSS, layout, render nodes, and accessibility. The "Visual" tab shows overdraw and clip regions. The "Objects" tab shows signals and properties.

### Other tools

| Tool | Use |
| --- | --- |
| `strace -c` | Syscall overhead, file I/O patterns |
| `ltrace` | Library calls (rarely needed) |
| `valgrind --tool=callgrind` | Instruction-level profiles (slow) |
| `massif` | Heap profiles |
| `hyperfine` | Microbenchmarks and startup loops |
| `cargo bloat` | Rust binary size contributors |
| `powertop` | Idle wakeups and power |
| `wev` | Wayland input events |
| `GSK_RENDERER=help` | List GTK renderers |
| `GDK_DEBUG=help` | List GDK debug options |

## Startup

The first second is mostly about **what you do before the first frame**.

- Create the window and show a usable shell before loading data.
- Defer non-critical work: thumbnails, indexes, plugin discovery, update checks.
- Do not open every database, parse every file, or enumerate the home directory at startup.
- Keep imports/initialization small. Python apps pay for imports; Rust apps pay for static initialization; C apps pay for plugin loading.
- Use `Gtk.Application`'s `startup` for global setup and `activate` for the window.
- Avoid synchronous network calls; show cached data first.
- Use a skeleton layout that matches the final content to avoid layout shift.

```python title="Defer secondary work until after first paint"
def on_activate(self, _app):
    window = NotesWindow(application=self)
    window.present()
    GLib.idle_add(self.load_secondary_content, priority=GLib.PRIORITY_DEFAULT_IDLE)
```

For a Python app, measure import time:

```bash title="Terminal"
python3 -X importtime src/main.py 2> importtime.log
```

If a library costs 300 ms and is only needed for an optional feature, import it lazily.

## The main loop

A responsive app is an app that never blocks the main loop.

- Move file I/O, network, parsing, compression, and database queries off the main thread.
- Use async APIs with cancellation.
- Chunk large work into idle callbacks so input can be processed between chunks.
- Avoid `sleep`, synchronous `subprocess`, and blocking locks on the main thread.
- Do not update the UI once per item in a large loop; batch and coalesce.

```python title="Chunked work with idle callbacks"
def process_batch(self, items, offset=0, batch=100):
    for item in items[offset:offset + batch]:
        self.process(item)
    next_offset = offset + batch
    if next_offset < len(items):
        GLib.idle_add(self.process_batch, items, next_offset, batch)
```

Measure input latency, not just CPU time. A fast function that runs 60 times per second on the main thread is still a problem.

## Rendering

GTK 4 renders through GSK, usually on the GPU. Most rendering problems are caused by the widget tree, not the renderer.

- Keep the widget tree shallow. Deep nesting costs layout and paint.
- Use `Gtk.ListView` with recycled rows for long lists; do not build thousands of widgets.
- Avoid CSS selectors that match huge subtrees; keep custom CSS small.
- Do not animate layout properties (width, height, margin); animate transform and opacity.
- Hide or destroy off-screen content; do not keep a full second UI in memory.
- Use `Gtk.Picture` with `can_shrink` and appropriately sized textures for images.
- Avoid decoding a 6000×4000 image just to show a 64×64 thumbnail.
- Test with `GSK_RENDERER=gl`, `ngl`, `vulkan`, and `cairo` if you support multiple renderers; do not force one in production without a reason.

If scrolling stutters, check:

1. Row count and widget depth.
2. Image decoding on the main thread.
3. CSS complexity.
4. Layout invalidation on every frame.
5. A synchronous operation triggered by scroll.

## Memory

- GObject is reference-counted; cycles leak. Use weak references in signal handlers and callbacks.
- Rust `Rc` cycles leak the same way; use `Weak`.
- Python references keep GObject wrappers alive; disconnect signals when destroying widgets.
- Bound caches: thumbnails, decoded images, search results, undo history.
- Release large buffers when a view closes.
- Use `GdkTexture` and `Gtk.Picture` instead of keeping `GdkPixbuf` copies.
- Decode untrusted images with Glycin, which also limits resource use.

## Battery and background work

- Prefer event-driven APIs over polling. D-Bus signals, `Gio.NetworkMonitor`, and file monitors are cheaper than a 1-second timer.
- Use the longest acceptable timer interval; coalesce updates.
- Stop animations and timers when the window is not visible.
- Release idle inhibitors when work finishes.
- Do not hold a GPU context or a wake lock for a hidden window.
- Test suspend/resume: the app should reconnect, refresh, and not spin.

`powertop` and Sysprof can show wakeups and CPU residency. A "0% CPU" app that wakes 100 times per second is still draining the battery.

## A profiling workflow

1. **Write the budget.** "Cold start under 1 s on a 2021 ThinkPad."
2. **Reproduce.** Use the same hardware, session type, scaling, and data set.
3. **Capture.** Sysprof for CPU and marks; heaptrack for memory; GTK Inspector for layout.
4. **Find the top cost.** Ignore the rest until the top is fixed.
5. **Fix one thing.** Measure again. Do not bundle five changes.
6. **Add a regression check.** A startup benchmark, a frame-time budget, or a memory ceiling in CI.
7. **Repeat.** Performance work is a loop, not a milestone.

## CI and release gates

- Track binary/package size on every release.
- Run a startup benchmark on a fixed runner with a `--quit-after-startup` flag.
- Fail the build on a large regression (for example, > 20% startup time).
- Keep a performance profile attached to release notes for major versions.
- Test on the oldest supported hardware before declaring a release "fast".

```bash title="A simple startup benchmark"
hyperfine --warmup 3 --runs 20 \
  './build/notes --quit-after-startup'
```

Implement `--quit-after-startup` in the app: show the window, wait for the first frame, then exit. It is a test hook, not a user feature.

## Common wins

| Problem | Fix |
| --- | --- |
| Slow cold start | Defer plugins, indexes, thumbnails; lazy imports |
| UI freezes on open | Async file/network I/O; cancellable tasks |
| Scroll stutter | `Gtk.ListView`, fewer widgets, smaller images |
| High idle CPU | Remove polling; use D-Bus signals |
| Memory grows over time | Bound caches; break GObject/Rc cycles |
| Slow search | Search the model, debounce, index in a worker |
| Battery drain | Fewer wakeups; stop timers when hidden |
| Slow first paint | Show the shell before loading data |
| Large package | Strip binaries, share runtime, remove unused assets |

## Key takeaways

- Performance is a budget, measured on real hardware, not a vibe.
- The main loop is the first place to look; blocking it defeats every other optimization.
- Rendering cost is usually the widget tree and images, not the GPU.
- Memory leaks are often reference cycles; use weak references.
- Battery is a performance metric; polling is the enemy.
- Profile, fix one thing, measure again, and add a regression check.

Next: [Testing](/engineering/testing/) — how to prove the app works before users do.
