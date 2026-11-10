---
title: Packaging & Distribution
description: Flatpak, deb, Snap, and AppImage compared — with the files, commands, and release practices needed to ship a Linux desktop app that users can install and update with confidence.
---

On Linux, packaging is not a final step. It is part of the architecture. The same source tree may need to produce a Flatpak for Flathub, a deb for the Ubuntu archive, a Snap for the App Center, and a tarball for the people who build from source.

You do not have to ship every format. You do have to choose deliberately, because each one changes how the app is built, sandboxed, updated, and supported.

## Choose the channel

| Channel | Best for | Updates | Sandbox | Effort |
| --- | --- | --- | --- | --- |
| **Flatpak / Flathub** | Upstream desktop apps, cross-distro | Flatpak/OSTree, delta updates | Yes, portals | Medium |
| **deb / PPA** | Ubuntu/Debian users, system integration | apt, unattended-upgrades | No (unless hardened) | Medium–high |
| **Snap** | Ubuntu App Center, confined apps | snapd, automatic refresh | Yes, AppArmor | Medium |
| **AppImage** | Portable demos, closed beta, legacy | Manual or app-specific | No | Low |
| **Distro archive** | System components, long-lived packages | Distro updates | Varies | High |

A pragmatic release matrix for a new app:

1. **Flatpak on Flathub** — the primary upstream channel.
2. **deb in a PPA** — for Ubuntu users who want apt integration, and as a step toward the archive.
3. **Snap** — only if the Ubuntu App Center is a real audience and you can maintain the confinement.
4. **AppImage** — optional, for portable testing; not a substitute for a repository.

## Flatpak

Flatpak is covered in depth in [Flatpak & Portals](/platform/flatpak-portals/). The packaging-specific workflow is:

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

:::caution[Do not self-update inside Flatpak]
The sandbox cannot replace its own deployment. Ship updates through Flathub/Flatpak. An in-app updater will either fail or bypass the permission model.
:::

## deb packages

A Debian package is a directory tree plus metadata. The minimum source package layout is:

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
Standards-Version: 4.7.0
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
lintian ../notes_0.1.0-1_amd64.changes
```

For a clean build that matches the archive, use `sbuild` or `pbuilder` rather than your desktop environment. A package that only builds on your machine is not a package.

### PPA

```bash title="Terminal"
debuild -S -sa
dput ppa:yourname/notes ../notes_0.1.0-1_source.changes
```

A PPA is a good stepping stone. It is not a substitute for the Ubuntu archive, and users still need to add it manually.

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

A Snap is a squashfs image with an AppArmor confinement profile and a `snapcraft.yaml` recipe.

```yaml title="snapcraft.yaml"
name: notes
base: core24
version: '0.1.0'
summary: Small note-taking app for the Linux desktop
description: |
  Notes is a local-first note-taking application with a native
  GTK 4 and libadwaita interface.
grade: stable
confinement: strict

apps:
  notes:
    command: bin/notes
    extensions: [gnome]
    plugs:
      - home
      - network
      - unity7

parts:
  notes:
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
      - python3
      - python3-gi
      - gir1.2-gtk-4.0
      - gir1.2-adw-1
```

```bash title="Terminal"
snapcraft pack
sudo snap install --dangerous notes_0.1.0_amd64.snap
snap run notes
```

:::note
`confinement: strict` is the only acceptable default for a new app. `devmode` is for development.
:::

- `extensions: [gnome]` pulls in the GNOME runtime and desktop helpers.
- `plugs: [home, network]` are broad. Use interfaces and portals; remove what the app does not need.
- The Snap Store review checks metadata, confinement, and policy. Expect iteration.

Snap's automatic refresh is a feature, not a bug. Do not add a self-updater; test the app across a refresh, including with unsaved work.

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
          cache-key: flatpak-builder-${{ github.sha }}
  deb:
    runs-on: ubuntu-26.04
    steps:
      - uses: actions/checkout@v4
      - run: sudo apt-get build-dep -y .
      - run: dpkg-buildpackage -b -us -uc
      - run: lintian ../*.changes
```

Pin the runner image and the runtime. A release that depends on "whatever was latest" is not reproducible.

## Updates

| Channel | Update mechanism | What the app should do |
| --- | --- | --- |
| Flatpak | OSTree deltas via Flathub | Nothing; optionally show version |
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
- ☐ The Snap installs and launches on a clean VM with `strict` confinement.
- ☐ The app launches with no home directory access (Flatpak) and degrades gracefully.
- ☐ The upgrade path from the previous version is tested.
- ☐ Release notes and screenshots are current.
- ☐ The license and copyright are installed.
- ☐ The uninstall path removes app data only with consent.

## Key takeaways

- Packaging is part of the product, not a release-day chore.
- Flatpak/Flathub is the default for upstream desktop apps.
- deb is for Ubuntu/Debian integration; Snap is for the Ubuntu App Center.
- AppImage is a portable artifact, not a distribution strategy.
- Build every channel from one tag, in a clean environment, with the same metadata.
- Never self-update inside a package-managed app.

Next: [Security & Privacy](/platform/security/) — the threat model behind the sandbox, secrets, and permissions.
