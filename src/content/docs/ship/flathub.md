---
title: Flathub
description: "The complete Flathub submission and maintenance workflow: app IDs, manifests, linting, pull requests, review, runtime updates, verification, and the mistakes that get submissions rejected."
---

Flathub is the largest vendor-neutral app store for Linux. It gives users a trusted place to install Flatpak apps, gives developers delta updates and a software-center listing, and gives the ecosystem a shared runtime model.

It is also curated. A Flathub listing is a signal that the app builds from source, respects the sandbox, ships valid metadata, and has a maintainer who will keep it working. Treat the submission as a product launch, not a pull request.

## Before you submit

You need:

- A **working app** with a meaningful feature set and a real development history.
- A **reverse-DNS application ID** you control, such as `io.github.yourname.Notes`.
- A **source license** that allows redistribution, and a valid `metadata_license`.
- A **desktop entry**, **icon**, and **AppStream metainfo** that pass validation.
- **English localization** for the UI and metadata.
- A **Flatpak manifest** that builds from source with no network access.
- **Minimal static permissions**, with portals used where possible.
- **Screenshots** and **release notes**.
- A **maintainer** who will respond to reviews and runtime updates.

Flathub reviewers are volunteers. A submission that ignores the requirements, uses a manifest generated without understanding, or asks reviewers to do the packaging work is likely to be closed.

:::caution[Generative AI policy]
Flathub requires disclosure of AI-generated code, documentation, and packaging. Flatpak manifests must not contain AI-generated or AI-assisted content. Do not let an agent open or automate the submission PR. Read the current [requirements](https://docs.flathub.org/docs/for-app-authors/requirements) before submitting.
:::

## The application ID

The ID is permanent. Choose it carefully.

- Format: `{tld}.{vendor}.{product}`, at least three components, at most five.
- Must match the metainfo `<id>`, the desktop file name, the icon name, the Flatpak ID, and the D-Bus name.
- For code-hosting IDs, use `io.github.username.App`, `io.gitlab.username.App`, `page.codeberg.username.App`, or `io.frama.username.App`.
- The domain must be controlled by the project, or the code-hosting repository must be reachable.
- Do not use a domain you do not control. Do not use another project's namespace.

Renaming later is possible but reviewed conservatively. Get it right once.

## The manifest

Flathub requires the manifest at the top level, named after the app ID, with `.json`, `.yml`, or `.yaml`.

```yaml title="io.github.yourname.Notes.yml"
id: io.github.yourname.Notes
runtime: org.gnome.Platform
runtime-version: '50'
sdk: org.gnome.Sdk
command: notes

finish-args:
  - --socket=wayland
  - --socket=fallback-x11
  - --share=ipc
  - --device=dri

modules:
  - name: notes
    buildsystem: meson
    sources:
      - type: dir
        path: .
```

Rules:

- Use the latest runtime available on Flathub at submission time.
- Build everything from source; no prebuilt binaries, no network during build.
- Keep `finish-args` minimal and explain every permission in the PR.
- Do not include generated AI manifests.
- Include license files for every module under `$FLATPAK_DEST/share/licenses/$FLATPAK_ID`.
- Use `cleanup` and `cleanup-commands` to remove build artifacts.
- Keep the manifest readable: logical key order, consistent indentation, no comments in JSON.

## Build and test locally

Use the official builder:

```bash title="Terminal"
flatpak install -y flathub org.flatpak.Builder
flatpak remote-add --if-not-exists --user flathub https://dl.flathub.org/repo/flathub.flatpakrepo

flatpak run --command=flathub-build org.flatpak.Builder --install io.github.yourname.Notes.yml
flatpak run io.github.yourname.Notes
```

Test the things reviewers will test:

- Launch from the app grid and from the command line.
- Open a file through the file manager.
- Use the file chooser, notifications, and secrets.
- Run with the network disabled if the app does not need it.
- Check the app in light and dark mode, at 100% and 200% scaling.
- Uninstall and reinstall; verify data survives or is removed as documented.
- Check the desktop file and metainfo in a software center.

## Lint

```bash title="Terminal"
flatpak run --command=flatpak-builder-lint org.flatpak.Builder manifest io.github.yourname.Notes.yml
flatpak run --command=flatpak-builder-lint org.flatpak.Builder repo repo
appstreamcli validate --no-net data/io.github.yourname.Notes.metainfo.xml
desktop-file-validate data/io.github.yourname.Notes.desktop
```

Fix errors; review warnings. Some linter errors require an exception with a justification. Do not disable a check to hide a real problem.

## Submit

1. Fork `flathub/flathub` (keep all branches).
2. Clone the `new-pr` branch.
3. Create a branch for your app.
4. Add the manifest and any required files.
5. Commit and push.
6. Open a pull request **against `new-pr`**, titled `Add io.github.yourname.Notes`.
7. Answer review comments; do not close the PR to make changes.
8. When asked, comment `bot, build` to start a test build.

```bash title="Terminal"
git clone --branch=new-pr git@github.com:yourname/flathub.git
cd flathub
git checkout -b notes-submission new-pr
# add io.github.yourname.Notes.yml
git add io.github.yourname.Notes.yml
git commit -m "Add io.github.yourname.Notes"
git push origin notes-submission
```

The PR template asks for permission justifications, build instructions, and confirmation that the app is functional. Fill it in. Reviewers can reject a PR that ignores the template.

## Review and approval

- Reviewers may ask for changes to permissions, metadata, the manifest, or the app itself.
- Keep the conversation technical and responsive.
- Do not merge `master` into the submission branch.
- Once approved, the app gets its own repository under the Flathub organization.
- Accept the write-access invitation within a week and enable 2FA.

After the first build is published, the listing appears on flathub.org. Screenshots from test builds do not appear; only official builds do.

## Maintenance

- **Runtime updates:** move to a new runtime before the old one is EOL. Test the app on the new runtime.
- **App updates:** open a PR against your app's Flathub repository, not the main `flathub/flathub` repo.
- **Beta channel:** create a `beta` branch after the stable app is accepted.
- **Architectures:** Flathub builds `x86_64` and `aarch64` by default. Use `flathub.json` only if you must restrict.
- **Permissions:** changes are reviewed. Explain new permissions and prefer portals.
- **Metadata:** keep screenshots and release notes current.
- **Security:** respond to reports; do not abandon the app silently.

## Verification

Verified apps show a badge and can use the verified developer portal. Verification usually requires control of the domain in the app ID or a code-hosting repository. Follow the current [verification guide](https://docs.flathub.org/docs/for-app-authors/verification); do not guess the token path.

## Common rejection reasons

| Reason | Fix |
| --- | --- |
| App is non-functional or trivially small | Ship a real, usable app |
| Missing or invalid metainfo | Validate and complete it |
| Permissions too broad | Use portals; justify each permission |
| Network during build | Vendor all sources |
| Prebuilt binaries | Build from source |
| Wrong app ID or domain | Use a controlled reverse-DNS ID |
| No English localization | Translate the UI and metadata |
| Missing license files | Install them under `share/licenses` |
| EOL runtime | Use the current runtime |
| AI-generated manifest | Write and understand the manifest yourself |
| No response to review | Maintain the submission |

## Flathub checklist

- ☐ App ID is controlled and consistent everywhere.
- ☐ Manifest builds from source with no network.
- ☐ Runtime is current and supported.
- ☐ `finish-args` are minimal and justified.
- ☐ Desktop file, icon, and metainfo validate.
- ☐ English localization is complete.
- ☐ Screenshots and release notes are current.
- ☐ License files are installed.
- ☐ `flatpak-builder-lint` passes.
- ☐ The app launches and works on a clean install.
- ☐ The PR targets `new-pr` and follows the template.
- ☐ A maintainer is committed to updates.

Next: [Release Checklist](/ship/release-checklist/) — the final pass before users install.
