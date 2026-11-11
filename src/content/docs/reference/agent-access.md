---
title: Agent Access
description: How an agent reads the published guide through MCP, the generated Markdown routes, or the local docs server.
---

The guide publishes the same content for people and agents: HTML for readers, Markdown for retrieval, and an MCP server for clients that can start a local process. This page covers the published server and the fallback routes. It does not describe a hosted endpoint; there is none.

## The two MCP servers

| Server | Reads | Use it when |
| --- | --- | --- |
| `docs` | `src/content/docs` in this repository | You edit the guide or work offline. |
| `guide` | The published site over HTTPS | Another agent consumes the guide without this checkout. |

Both expose the same five read-only tools, so an agent can move between them without relearning the interface. The `docs` server answers from the working tree, including unpublished edits. The `guide` server answers from the last deployment, including the CDN window of up to 10 minutes.

Do not point the `guide` server at a source checkout and do not use the `docs` server to check what readers see. They answer different questions.

## Run the published server

The server is distributed as `linux-desktop-guide-mcp` and needs Node.js 22 or newer:

```bash
npx -y linux-desktop-guide-mcp
```

It needs no API key, account, or repository clone. The package is built from this repository. If your client cannot find the package, use the `llms.txt` routes below; they expose the same content without a local process.

## Client configuration

### OpenCode

Add a second local server to `opencode.jsonc`:

```jsonc
{
  "mcp": {
    "servers": {
      "guide": {
        "type": "local",
        "command": ["npx", "-y", "linux-desktop-guide-mcp"]
      }
    }
  }
}
```

### Claude Desktop

Edit `claude_desktop_config.json` in the Claude application data directory:

```json
{
  "mcpServers": {
    "linux-desktop-guide": {
      "command": "npx",
      "args": ["-y", "linux-desktop-guide-mcp"]
    }
  }
}
```

### Cursor

Add the same block to `.cursor/mcp.json` in the project or `~/.cursor/mcp.json` for every project.

## Tools

| Tool | Returns |
| --- | --- |
| `search_docs` | Ranked pages with a section filter, excerpt, and matching headings. |
| `get_page` | One page as Markdown with its title, description, headings, word count, and public URL. |
| `list_pages` | The published table of contents grouped by section. |
| `get_related` | Related pages with a reason for each recommendation. |
| `get_baseline` | The validated Ubuntu, GNOME, GTK, Qt, toolchain, and packaging versions. |

Every result includes `fetchedAt` and `stale`. When `stale` is `true`, the network request failed and the server returned the cached copy.

The published index is alphabetical within a section, not the sidebar order of the site. `list_pages` says so in its result.

## Cache and offline use

The server caches responses outside the project:

| Resource | Default lifetime |
| --- | --- |
| `llms.txt` manifest | 15 minutes |
| A page's `.md` route | 30 minutes |
| `llms-full.txt` search corpus | 60 minutes |
| `reference/baseline.json` | 60 minutes |

Cached entries store `ETag` and `Last-Modified`. An expired entry is usually refreshed with a `304` response and no body transfer. If the network is unavailable, the server returns the cached copy with `stale: true`; a cold cache without a network returns an error that points to `llms.txt`.

The cache lives in `~/.cache/linux-desktop-guide-mcp` on Linux, `~/Library/Caches/linux-desktop-guide-mcp` on macOS, and `%LOCALAPPDATA%\linux-desktop-guide-mcp\Cache` on Windows.

## Environment

| Variable | Purpose |
| --- | --- |
| `LDG_SITE_URL` | Read another deployment or a local preview. The default is `https://digitalesich.github.io/linux-desktop-guide/`. |
| `LDG_CACHE_DIR` | Move the cache. |
| `LDG_NO_CACHE` | Set to `1` to disable cache reads and writes. |
| `LDG_CACHE_TTL_MS` | Override every lifetime. Intended for tests and debugging. |

The server accepts only the configured origin and base path. Redirects are followed inside that boundary, responses are capped at 2 MB, and requests time out after 10 seconds. It sends one retry for a network error, `429`, or `5xx`, respects `Retry-After` up to five seconds, and sends a user agent with the package version. It writes only to the cache directory and collects no telemetry.

## Without MCP

An agent that cannot start a local process can read the same published content directly:

```bash
curl https://digitalesich.github.io/linux-desktop-guide/llms.txt
curl https://digitalesich.github.io/linux-desktop-guide/start/why-linux.md
```

`llms.txt` is the curated index, `llms-full.txt` is the complete guide in one file, and every page has a `.md` route. Content negotiation with `Accept: text/markdown` is not implemented; request the `.md` route explicitly.

## See also

- [Style Guide](/reference/style-guide/) for the agent-facing Markdown rules.
- [Feedback](/reference/feedback/) to report a broken route or a wrong result.
- [Resources](/reference/resources/) for the upstream documentation behind the guide.
