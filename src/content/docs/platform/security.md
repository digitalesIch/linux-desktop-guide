---
title: Security & Privacy
description: "A practical threat model for Linux desktop apps: sandboxing, least privilege, secrets, safe file handling, network security, privacy-respecting telemetry, and vulnerability disclosure."
---

Desktop apps handle the user's documents, credentials, messages, and sometimes their entire screen. A security bug is not an edge case; it is a breach of the trust that makes the app installable in the first place.

Linux gives you strong primitives — a sandbox, portals, the Secret Service, signed packages — but they only help if the app uses them. This page is the minimum bar, not a complete security review.

## The threat model

Assume:

- **Files are untrusted.** Documents, images, archives, and project files can be malicious.
- **The network is hostile.** Wi-Fi, proxies, captive portals, and DNS can be controlled.
- **Other apps are not trustworthy.** A sandboxed app should not be able to read another app's data.
- **The user can make mistakes.** Design for recovery, not blame.
- **The supply chain can be compromised.** Dependencies, build runners, and update channels matter.
- **The app will have bugs.** Limit the blast radius.

The goal is not to eliminate risk. It is to make the common failure survivable.

## Least privilege

Start with the smallest set of capabilities that makes the app useful, then add one at a time with a justification.

| Capability | Default | When to add |
| --- | --- | --- |
| Filesystem access | None (portals only) | Only for a feature that cannot use a portal |
| Network | None | Only if the app genuinely needs it |
| Camera/microphone | None | Only with an explicit feature and a visible indicator |
| Location | None | Only with a clear user benefit and a portal prompt |
| Session bus | None | Only for specific `--talk-name=` services |
| System bus | None | Almost never; use a portal or a user service |
| Devices | GPU only if needed | Specific device classes only |

In Flatpak, this is expressed in `finish-args`. In Snap, it is `plugs`. In a deb, it is your own responsibility: do not run as root, do not install setuid helpers, and do not grant broad filesystem access by default.

## Sandboxing is not a cage you escape

A common anti-pattern is to ship a Flatpak with `--filesystem=home` because "the app needs to open files". That defeats the sandbox and teaches users to distrust permissions.

Use the **FileChooser** portal for files the user chooses, `--persist=` for a small number of app-specific paths if the portal is not enough, and `--filesystem=xdg-run/...` for sockets that genuinely belong to the app.

If a feature cannot work in a sandbox, the answer is usually one of:

- redesign the feature around a portal;
- split the privileged part into a small, audited helper;
- ship outside the sandbox with a clear explanation and a narrower audience.

Do not silently disable the sandbox.

## Ubuntu security services

Ubuntu layers four services on top of the sandbox model. They are covered in more detail in [Ubuntu Platform](/platform/ubuntu/#security-and-ubuntu-pro).

| Service | Use it for | Do not |
| --- | --- | --- |
| **AppArmor** | Confining system services and sandboxed apps | Disable a profile to make a feature work |
| **Polkit** | Named privileged actions with desktop authentication | Run `sudo` or `pkexec` from a GUI app |
| **fwupd / LVFS** | Firmware updates and device status | Write firmware directly |
| **Ubuntu Pro** | ESM, Livepatch, FIPS, CIS for users who subscribe | Require Pro for core app functionality |

### Permission prompting and Security Center

Ubuntu 26.04 includes an experimental permission-prompting system on top of AppArmor 4.0. It is snap-focused: users enable it in **Security Center**, and prompts can grant one-time or persistent access to files, camera, microphone, and similar resources. Flatpak apps use XDG Desktop Portals instead, and debs are managed through AppArmor and the app's own privilege model.

Do not build a feature that depends on prompting being enabled. Use portals and the smallest Snap interfaces you need, handle denial as a normal state, and test with prompting both on and off. The user's decision is authoritative; never retry a denied prompt in a loop.

### AppArmor

AppArmor is the default mandatory-access-control layer on Ubuntu. It mediates filesystem access, capabilities, network sockets, D-Bus, and IPC for confined programs. If you ship a system service, include an AppArmor profile and test it:

```bash
aa-status
sudo journalctl -fx -k --grep=apparmor
```

Desktop apps should rely on the Flatpak or Snap sandbox rather than asking users to install a custom profile.

### Polkit

Polkit is the correct way to request a privileged operation from a desktop session. Define a named action with a clear message, then let the desktop's authentication agent prompt the user. Do not shell out to `sudo`, and do not run `pkexec` from a GUI process; both bypass the desktop's policy and break in sandboxes.

### fwupd and Ubuntu Pro

fwupd handles firmware updates through the Linux Vendor Firmware Service (LVFS). Integrate with it or link to the firmware updater; never flash firmware yourself.

Ubuntu Pro adds ESM, Livepatch, FIPS, and CIS hardening. It is optional:

```bash
pro status
sudo pro enable esm-apps
sudo pro enable livepatch
```

Detect whether a Pro service is enabled before exposing it in the UI, and keep the app fully usable when it is absent.

## Secrets

Never store credentials in plaintext. Use the Secret Service (libsecret on GNOME, KWallet on KDE with a compatible backend), the Secret portal in a sandbox, or the platform's keyring API.

```python title="Storing and retrieving a token"
import gi
gi.require_version("Secret", "1")
from gi.repository import Secret

schema = Secret.Schema.new(
    "io.github.yourname.Notes",
    Secret.SchemaFlags.NONE,
    {"account": Secret.SchemaAttributeType.STRING},
)

Secret.password_store_sync(
    schema, {"account": "sync"}, Secret.COLLECTION_DEFAULT,
    "Notes sync token", token, None,
)

secret = Secret.password_lookup_sync(schema, {"account": "sync"}, None)
```

Rules:

- Use a stable schema and non-personal attributes.
- Handle a locked or unavailable keyring without crashing.
- Provide a "Forget" action that deletes the secret.
- Do not log tokens, even at debug level.
- Do not put secrets in command-line arguments; other users can read `/proc`.
- Do not put secrets in environment variables that are inherited by child processes unless necessary.

## Safe file handling

Files are the most common attack surface. Treat every path, filename, and file format as untrusted.

- **Write atomically.** Create a temporary file in the same directory, write, `fsync` if durability matters, then rename. Never write directly to the user's file.
- **Respect symlinks.** Do not follow symlinks out of a directory you own; use `O_NOFOLLOW` where appropriate.
- **Check permissions.** Secrets and private data should be `0600`; directories `0700`.
- **Limit sizes.** A 10 GB image or a 2 million-row JSON file should fail gracefully, not exhaust memory.
- **Validate formats.** Use a parser with a security track record; fuzz it; reject malformed input early.
- **Use `Glycin` for untrusted images.** It is designed to decode untrusted image data in a sandboxed process.
- **Do not extract archives blindly.** Guard against path traversal (`../`), absolute paths, and zip bombs.
- **Use the Trash.** `Gio.File.trash()` instead of permanent deletion.

```python title="Atomic write in Python"
import os
import tempfile
from pathlib import Path

def write_atomic(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=path.parent, prefix=f".{path.name}.")
    try:
        with os.fdopen(fd, "wb") as handle:
            handle.write(data)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(tmp, path)
    finally:
        if os.path.exists(tmp):
            os.unlink(tmp)
```

## Network security

- Use HTTPS for everything. Do not implement "fallback to HTTP".
- Use the system trust store. Do not bundle a private CA unless the app is enterprise-managed.
- Let the toolkit or a mature library handle TLS (`Gio.TlsConnection`, Qt Network, rustls, OpenSSL). Do not roll your own.
- Respect system proxy settings and `Gio.NetworkMonitor` for connectivity changes.
- Set timeouts and cancellation on every request. A hung request is a hung UI if you await it on the main thread.
- Validate certificates and hostnames. Do not add "ignore certificate errors" to production.
- Beware of SSRF if the app fetches user-provided URLs: block localhost, link-local, and metadata endpoints unless explicitly required.
- Treat downloaded content as untrusted: parse it in a sandbox or a separate process where possible.

Certificate pinning is rarely appropriate on Linux: certificates rotate, proxies exist, and users may legitimately inspect their own traffic. Use the system trust store unless you have a specific, documented threat model.

## Input validation and memory safety

- Prefer memory-safe languages (Rust, Python, managed runtimes) for parsers and network-facing code.
- In C/C++, use bounded APIs, check integer overflows, and run static analysis (`clang-tidy`, `scan-build`).
- Fuzz parsers and protocol handlers. A crash on malformed input is a bug; a memory corruption is a vulnerability.
- Treat command-line arguments, environment variables, D-Bus messages, and portal responses as untrusted.
- Never pass untrusted strings to a shell. Use `GSubprocess` with an argument vector, not `system()` or `popen()`.

## Privacy

Privacy is a product decision, not a legal footnote.

- **Collect the minimum.** If a feature does not need a data point, do not collect it.
- **Opt in, not out.** Telemetry, crash reporting, and analytics require explicit consent. The default is off.
- **Be specific.** Tell users what is collected, why, where it goes, and how long it is retained.
- **Local-first by default.** Sync and cloud features should be optional and clearly labeled.
- **No unique identifiers** unless necessary. If you need one, rotate it and document it.
- **Redact logs and crash reports.** Remove paths, usernames, tokens, document contents, and IP addresses.
- **Respect the desktop's privacy settings.** Do not infer location or identity from unrelated data.
- **Keep system telemetry separate.** Ubuntu Insights is opt-in system telemetry; it is not consent for your app's analytics. Ask separately and never bundle the two.
- **Make deletion real.** "Delete account" must delete the data, not just hide it.

If you add telemetry, publish the schema and a sample payload. Users should be able to audit what is sent.

## Updates and supply chain

- Ship through a package manager or store with signed updates (Flatpak/OSTree, Snap assertions, apt signatures).
- Do not self-update inside a sandbox.
- Pin dependencies in CI and review lockfile changes.
- Use a clean build environment; do not publish artifacts built on a developer laptop with unknown state.
- Sign tags and release artifacts. Publish checksums.
- Monitor your dependencies for CVEs; have a patch cadence.
- Never `curl | sh` in an install script. Never ask users to disable security features to install your app.

## Vulnerability disclosure

Ship a `SECURITY.md` with:

- a private contact (email or a security advisory channel);
- supported versions;
- a response window;
- a commitment to coordinated disclosure;
- a credit policy, if you want one.

When a report arrives: reproduce, contain, patch, release, notify. Do not argue with the reporter in public. Do not silently fix a critical issue without a CVE when one is warranted.

## Security checklist

- ☐ The app runs without root and without setuid helpers.
- ☐ Flatpak/Snap permissions are minimal; portals are used where available.
- ☐ Secrets are in the Secret Service, not in config files or logs.
- ☐ File writes are atomic; symlinks and traversal are handled.
- ☐ Untrusted images are decoded with Glycin or an equivalent sandbox.
- ☐ Network requests use TLS, timeouts, and cancellation.
- ☐ No shell interpolation of untrusted data.
- ☐ Crash reports and telemetry are opt-in and redacted; app telemetry is separate from Ubuntu Insights.
- ☐ Snap/Flatpak permission prompting and denial paths are tested.
- ☐ Updates come from a signed channel; no self-updater in a sandbox.
- ☐ AppArmor profiles are shipped for system services and tested with `aa-status`.
- ☐ Privileged operations use a named Polkit action, not `sudo` or `pkexec`.
- ☐ Firmware updates go through fwupd/LVFS; the app never flashes firmware directly.
- ☐ Ubuntu Pro is optional; the app works without ESM, Livepatch, FIPS, or CIS.
- ☐ `SECURITY.md` exists and is current.
- ☐ Dependencies are pinned and monitored.

Next: [Design Principles](/design/principles/) — how to make the app feel calm, fast, and native across Linux desktops.
