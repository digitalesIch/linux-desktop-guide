---
title: Packaging & Distribution
description: Flatpak, deb, Snap, and AppImage compared — with the files, commands, and release practices needed to ship a Linux desktop app that users can install and update with confidence.
---

On Linux, packaging is not a final step. It is part of the architecture. The same source tree may need to produce a Flatpak for Flathub, a deb for the Ubuntu archive, a Snap for the App Center, and a tarball for the people who build from source.

You do not have to ship every format. You do have to choose deliberately, because each one changes how the app is built, sandboxed, updated, and supported.

## Choose the channel

Ubuntu documents two supported package formats: **deb** and **Snap**. Flatpak is not installed by default and is not Canonical's supported path, but it is a mature, open-source, cross-distribution channel. The right choice depends on your audience and your maintenance capacity, not on a single universal ranking.

### Ubuntu-supported paths

| Channel | Best for | Updates | Sandbox | Effort |
| --- | --- | --- | --- | --- |
| **deb / PPA** | Ubuntu/Debian users, archive integration | apt, unattended-upgrades | No (unless hardened) | Medium–high |
| **Snap** | Ubuntu App Center, confined apps | snapd, automatic refresh | Yes, AppArmor | Medium |
| **Distro archive** | System components, long-lived packages | Distro updates | Varies | High |

Ubuntu's [App Center recommends snaps](https://ubuntu.com/desktop/docs/en/26.04/explanation/snap-and-deb-packages) for third-party apps because they are sandboxed and update independently of the release. It also manages debs from the Ubuntu archive and can install third-party debs, but third-party debs are discouraged: they have full access to the user's resources and may add their own repositories.

### Cross-distro and alternative paths

| Channel | Best for | Updates | Sandbox | Effort |
| --- | --- | --- | --- | --- |
| **Flatpak / Flathub** | Upstream desktop apps, cross-distro; not shipped by Ubuntu | OSTree deltas | Yes, portals | Medium |
| **AppImage** | Portable demos, closed beta, legacy | Manual or app-specific | No | Low |
| **Source tarball / self-hosted repo** | Developers, packagers, special audiences | User/distro or self-hosted | Varies | Low–high |

A pragmatic release matrix:

1. **Start with the Ubuntu-supported path that fits your audience.** A deb in a PPA or the archive for apt integration; a Snap for the App Center and confined auto-updates.
2. **Add Flatpak on Flathub** when you need one upstream build across distributions or a vendor-neutral store. Document the extra setup: Ubuntu does not ship Flatpak or Flathub by default.
3. **Add AppImage** only for portable demos or users who cannot install packages.
4. **Keep a source tarball** for packagers and developers.
5. **Do not ship every channel by default.** Every channel is a maintenance, testing, and support commitment.

:::note[Ubuntu's own guidance]
Ubuntu supports **deb** and **Snap** as first-class package formats. The App Center recommends snaps for third-party apps and supports debs from the Ubuntu archive; third-party debs are possible but discouraged. Flatpak is not part of a stock Ubuntu installation and is not Canonical's supported path, but it remains a legitimate open-source cross-distribution channel for upstream apps. See [Ubuntu Platform](/platform/ubuntu/#packaging-paths) for the full decision table and primary sources.
:::

:::tip[Quality signals]
Whichever channel you choose, check that the runtime, toolkit, and store are actively maintained. The [quality signals](/reference/quality-signals/) page lists observable metrics for release recency, activity, bus factor, responsiveness, security, release engineering, governance, standards, and adoption.
:::

## Flatpak

Flatpak is covered in depth in [Flatpak & Portals](/platform/flatpak-portals/). Ubuntu does not install Flatpak or Flathub by default; if you choose this channel, set it up explicitly:

```bash title="Terminal"
sudo apt install flatpak flatpak-builder
flatpak remote-add --if-not-exists --user flathub https://dl.flathub.org/repo/flathub.flatpakrepo
```

The App Center does not manage Flatpak apps. Users who want Flatpak install it themselves or use a distribution that ships it.

For local development, `type: dir` sources are fine. For a Flathub submission, replace them with a `git` source pinned to a tag/commit or an `archive` source with a checksum; Flathub does not accept the app source code inside the submission PR.

The packaging-specific workflow is:

```bash title="Terminal"
flatpak-builder --user --install --force-clean build-dir io.github.yourname.Notes.yml
flatpak-builder --repo=/tmp/notes-repo --force-clean build-dir io.github.yourname.Notes.yml
flatpak build-update-repo /tmp/notes-repo
```

For a self-hosted repository, publish the OSTree repo and a `.flatpakref`:

```ini title="io.github.yourname.Notes.flatpakref"
[Flatpak Ref]
Title=Notes
Name=io.github.yourname.Notes
Branch=stable
Url=https://example.org/flatpak/repo
GPGKey=...
IsRuntime=false
```

For public distribution, use Flathub instead of running your own repository. It gives you a store listing, delta updates, verification, and a build service.

Flatpak runtimes have their own support windows. Track the `runtime-version` branch, rebase before the runtime reaches end-of-life, run `flatpak update`, and remove unused runtimes with `flatpak uninstall --unused`. Do not assume that an Ubuntu LTS support window applies to a GNOME or KDE runtime.

:::caution[Do not self-update inside Flatpak]
The sandbox cannot replace its own deployment. Ship updates through Flathub/Flatpak. An in-app updater will either fail or bypass the permission model.
:::

## deb packages

A Debian package is a directory tree plus metadata. The [Ubuntu packaging guide](https://ubuntu.com/project/docs/) and the [new-package guide](https://ubuntu.com/project/docs/contributors/new-package/create-a-new-package/) cover the archive process; the example below is the minimal local layout.

The minimum source package layout is:

```text
notes/
├── debian/
│   ├── changelog
│   ├── control
│   ├── copyright
│   ├── install
│   └── rules
├── meson.build
└── src/
```

### `debian/control`

```text title="debian/control"
Source: notes
Section: utils
Priority: optional
Maintainer: Your Name <you@example.com>
Build-Depends: debhelper-compat (= 13),
               meson,
               ninja-build,
               python3,
               libgtk-4-dev,
               libadwaita-1-dev
Standards-Version: 4.7.4.0
Rules-Requires-Root: no
Homepage: https://example.org/notes

Package: notes
Architecture: all
Depends: ${misc:Depends},
         python3,
         python3-gi,
         gir1.2-gtk-4.0,
         gir1.2-adw-1
Description: small note-taking app for the Linux desktop
 Notes is a local-first note-taking application with a native
 GTK 4 and libadwaita interface.
```

Use `Architecture: any` if you ship compiled code. For a Python app, `all` is correct, but the dependencies must be available in every supported release. If they are not, build a Flatpak instead of bundling a private Python runtime in `/opt`.

### `debian/rules`

```make title="debian/rules"
#!/usr/bin/make -f

%:
	dh $@
```

Make it executable: `chmod +x debian/rules`.

Because this is an `Architecture: all` Python package, the build produces `notes_0.1.0-1_all.changes`. Use the matching file for `lintian`, or use `../*.changes` so the command works for either architecture.

### `debian/changelog`

```text title="debian/changelog"
notes (0.1.0-1) resolute; urgency=medium

  * Initial release.

 -- Your Name <you@example.com>  Tue, 10 Nov 2026 12:00:00 +0100
```

The distribution (`resolute` for Ubuntu 26.04) and the version must match the target archive.

### Build and validate

```bash title="Terminal"
sudo apt install debhelper devscripts lintian
dpkg-buildpackage -b -us -uc
lintian ../notes_0.1.0-1_all.changes
```

For a clean build that matches the archive, use `sbuild` or `pbuilder` rather than your desktop environment. A package that only builds on your machine is not a package.

### PPA

```bash title="Terminal"
debuild -S -sa
dput ppa:yourname/notes ../notes_0.1.0-1_source.changes
```

A PPA is a good stepping stone. It is not a substitute for the Ubuntu archive, and users still need to add it manually. Follow [Build packages in a PPA](https://ubuntu.com/project/docs/contributors/bug-fix/build-packages-in-a-ppa/) for the upload and signing flow.

### What goes in the package

| Asset | Path |
| --- | --- |
| Binary/script | `/usr/bin/notes` |
| Desktop entry | `/usr/share/applications/io.github.yourname.Notes.desktop` |
| Metainfo | `/usr/share/metainfo/io.github.yourname.Notes.metainfo.xml` |
| Icon | `/usr/share/icons/hicolor/scalable/apps/io.github.yourname.Notes.svg` |
| GSettings schema | `/usr/share/glib-2.0/schemas/` |
| Translations | `/usr/share/locale/` |
| License | `/usr/share/doc/notes/copyright` |

Do not install into `/opt` unless the app is genuinely self-contained and you understand the trade-offs with themes, icons, and desktop integration.

## Snap

A Snap is a squashfs image with an AppArmor confinement profile and a `snapcraft.yaml` recipe. [`core26`](https://ubuntu.com/docs/snapcraft/stable/reference/bases/) is the recommended base for Ubuntu 26.04.

```yaml title="snapcraft.yaml"
name: notes
base: core26
version: '0.1.0'
summary: Small note-taking app for the Linux desktop
description: |
  Notes is a local-first note-taking application with a native
  GTK 4 and libadwaita interface.
grade: stable
confinement: strict

apps:
  notes:
    command: usr/bin/notes
    extensions: [gnome]
    # Add `plugs: [gsettings]` only if the app reads or writes host GSettings.

parts:
  python-runtime:
    plugin: nil
    stage-packages:
      - libpython3.14-minimal
      - libpython3.14-stdlib
      - python3-minimal
      - python3.14-minimal
      - python3.14-venv

  notes:
    after: [python-runtime]
    plugin: meson
    source: .
    meson-parameters:
      - --prefix=/usr
    build-packages:
      - python3
      - python3-gi
      - gir1.2-gtk-4.0
      - gir1.2-adw-1
    stage-packages:
      - python3-gi
      - gir1.2-gtk-4.0
      - gir1.2-adw-1
```

```bash title="Terminal"
snapcraft pack
sudo snap install --dangerous notes_0.1.0_amd64.snap
snap run notes
snapcraft lint
```

:::note[core26 and Python]
`core26` does not bundle Python. A strictly confined Python snap must stage its own runtime, as the `python-runtime` part above does. The [GNOME extension](https://ubuntu.com/docs/snapcraft/stable/how-to/extensions/use-the-gnome-extension/) supports `core26` from Snapcraft 9.2 onward and no longer adds the `gsettings` plug automatically; add it only when the app needs host settings.
:::

- `command` is relative to the snap root. With `--prefix=/usr`, the binary is `usr/bin/notes`, not `bin/notes`.
- `extensions: [gnome]` pulls in the GNOME content snaps and desktop helpers.
- Keep `plugs` minimal. Prefer portals and specific interfaces; `home`, `network`, and the legacy `unity7` interface are broad and should not be defaults.
- `confinement: strict` is the right default. `classic` is legitimate for tools that genuinely need broad host access, but it is reviewed manually and should not be the first choice.
- The Snap Store review checks metadata, confinement, and policy. Expect iteration.

Snap's automatic refresh is a feature, not a bug. Do not add a self-updater; test the app across a refresh, including with unsaved work.

For the full build and review flow, use the [Snapcraft documentation](https://ubuntu.com/docs/snapcraft/stable/) and the [Craft a snap](https://ubuntu.com/docs/snapcraft/stable/tutorials/craft-a-snap/) tutorial. Read the current [interfaces reference](https://snapcraft.io/docs/interfaces) and [XDG desktop portals guidance](https://snapcraft.io/docs/xdg-desktop-portals). For automation, use the [snapd REST API](https://snapcraft.io/docs/snapd-api) rather than shelling out to `snap`.

## OCI images with Rockcraft

If the deliverable is a service or cloud workload rather than a desktop app, build it as an OCI image with [Rockcraft](https://github.com/canonical/rockcraft). Rocks are minimal, Ubuntu-based images with a supported build path. Do not use them as a desktop packaging format.

## AppImage

AppImage is a single executable file that mounts a squashfs image. It is useful for demos, portable tools, and users who cannot install packages, but it has no sandbox, no repository, and no standard update mechanism.

```bash title="Terminal"
# Example with linuxdeploy and the AppImage plugin
linuxdeploy --appdir AppDir --executable build/notes \
  --desktop-file data/io.github.yourname.Notes.desktop \
  --icon-file data/io.github.yourname.Notes.svg
linuxdeploy-plugin-appimage --appdir AppDir
```

If you ship an AppImage:

- Include an `AppRun` that sets `LD_LIBRARY_PATH` correctly.
- Provide a `.desktop` file and icon inside the image.
- Publish a checksum and a GPG signature.
- Document that updates are manual.
- Do not treat it as your only distribution channel.

## Versioning and release notes

Use semantic versioning for the app (`MAJOR.MINOR.PATCH`) and a distribution-specific revision suffix (`0.1.0-1`) for deb packages. The AppStream `<releases>` section should match the version users see.

```xml title="metainfo release entry"
<releases>
  <release version="0.1.0" date="2026-11-10">
    <description>
      <p>First public release.</p>
      <ul>
        <li>Local-first notes with adaptive sidebar.</li>
        <li>Keyboard-first navigation and search.</li>
      </ul>
    </description>
  </release>
</releases>
```

Release notes are user-facing. Write them for users, not for the commit log. Mention breaking changes, migration steps, and known issues.

## CI: build every channel from one tag

A release pipeline should produce:

- a Flatpak build that passes `flatpak-builder-lint`;
- a deb source and binary package that passes `lintian`;
- a Snap that installs and launches on a clean VM;
- an AppImage (optional) with a checksum;
- a source tarball with a signed tag.

```yaml title=".github/workflows/release.yml (sketch)"
name: release
on:
  push:
    tags: ['v*']
jobs:
  flatpak:
    runs-on: ubuntu-26.04
    steps:
      - uses: actions/checkout@v4
      - uses: flatpak/flatpak-github-actions/flatpak-builder@v6
        with:
          bundle: notes.flatpak
          manifest-path: io.github.yourname.Notes.yml
          cache-key: flatpak-builder-${{ hashFiles('**/*.yml', '**/*.json', '**/Cargo.lock', '**/Cargo.toml') }}
  deb:
    runs-on: ubuntu-26.04
    steps:
      - uses: actions/checkout@v4
      - run: sudo apt-get update
      - run: sudo apt-get install -y devscripts equivs lintian
      - run: sudo mk-build-deps -i -y debian/control
      - run: dpkg-buildpackage -b -us -uc
      - run: lintian ../*.changes
  snap:
    runs-on: ubuntu-26.04
    steps:
      - uses: actions/checkout@v4
      - uses: snapcore/action-build@v1
        id: build
      - run: sudo snap install --dangerous ${{ steps.build.outputs.snap }}
```

Pin the runner image and the runtime. A release that depends on "whatever was latest" is not reproducible.

## Updates

| Channel | Update mechanism | What the app should do |
| --- | --- | --- |
| Flatpak | OSTree deltas via Flathub; runtime branch has its own EOL | Rebase before runtime EOL; do not self-update |
| Snap | snapd automatic refresh | Nothing; handle restart gracefully |
| deb | apt / unattended-upgrades | Nothing; do not self-update |
| AppImage | Manual | Check for updates only with consent; link to download |

Never replace your own binary from inside the app. It breaks package ownership, signatures, and sandboxing. If the app needs a newer version of itself, tell the user and link to the store.

## Packaging checklist

- ☐ One application ID across desktop file, metainfo, icon, D-Bus, and Flatpak.
- ☐ The app builds from a clean checkout with no network access.
- ☐ The desktop file passes `desktop-file-validate`.
- ☐ The metainfo passes `appstreamcli validate --no-net`.
- ☐ The Flatpak passes `flatpak-builder-lint`.
- ☐ The deb passes `lintian`.
- ☐ The Snap uses `core26`, installs and launches on a clean VM with `strict` confinement, and passes `snapcraft lint`.
- ☐ The app launches with no home directory access (Flatpak) and degrades gracefully.
- ☐ The channel choice passes the [quality signals](/reference/quality-signals/) check; Flatpak setup is documented separately from stock Ubuntu.
- ☐ The upgrade path from the previous version is tested.
- ☐ Release notes and screenshots are current.
- ☐ The license and copyright are installed.
- ☐ The uninstall path removes app data only with consent.


## Sources

- [Snapcraft bases](https://ubuntu.com/docs/snapcraft/stable/reference/bases/)
- [Core24 to core26](https://ubuntu.com/docs/snapcraft/stable/how-to/change-bases/change-from-core24-to-core26/)
- [GNOME extension](https://ubuntu.com/docs/snapcraft/stable/how-to/extensions/use-the-gnome-extension/)
- [Flathub requirements](https://docs.flathub.org/docs/for-app-authors/requirements)
- [Debian Policy](https://www.debian.org/doc/debian-policy/)
- [AppImage documentation](https://docs.appimage.org/)
- [snapd REST API](https://snapcraft.io/docs/snapd-api)

Next: [Security & Privacy](/platform/security/) — the threat model behind the sandbox, secrets, and permissions.
