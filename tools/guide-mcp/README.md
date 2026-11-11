# Linux Desktop Guide MCP

A read-only [MCP](https://modelcontextprotocol.io/) server for the published [Linux Desktop Guide](https://digitalesich.github.io/linux-desktop-guide/). It reads the public Markdown routes over HTTPS, caches them locally, and exposes the guide to an agent without requiring this repository.

```bash
npx -y linux-desktop-guide-mcp
```

Node.js 22 or newer is required. There is no API key, account, telemetry, or write path.

## Client configuration

OpenCode (`opencode.jsonc`):

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

Claude Desktop (`claude_desktop_config.json`) and Cursor (`.cursor/mcp.json`):

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

## Tools

| Tool | Description |
| --- | --- |
| `search_docs` | Ranked search with section filters, excerpts, and matching headings. |
| `get_page` | One page as Markdown with metadata, headings, and its public URL. |
| `list_pages` | The published table of contents grouped by section. |
| `get_related` | Related pages based on links, section, and text similarity. |
| `get_baseline` | The validated Ubuntu, GNOME, GTK, Qt, toolchain, and packaging baseline. |

Every result includes `fetchedAt` and `stale`. `stale: true` means the network failed and the cached copy was returned.

The published index is alphabetical within a section, not the sidebar order of the site.

## Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `LDG_SITE_URL` | `https://digitalesich.github.io/linux-desktop-guide/` | Read another deployment or a local preview. |
| `LDG_CACHE_DIR` | Platform cache directory | Move the cache. |
| `LDG_NO_CACHE` | unset | Set to `1` to disable cache reads and writes. |
| `LDG_CACHE_TTL_MS` | built-in TTLs | Override every TTL; intended for tests and debugging. |

The cache lives in `~/.cache/linux-desktop-guide-mcp` on Linux, `~/Library/Caches/linux-desktop-guide-mcp` on macOS, and `%LOCALAPPDATA%\linux-desktop-guide-mcp\Cache` on Windows.

## Caching and offline use

The manifest is cached for 15 minutes, pages for 30 minutes, and the full text and baseline for 60 minutes. Cached entries carry `ETag` and `Last-Modified` validators, so an expired entry is usually refreshed with a `304` and no body transfer. If the network is unavailable, the server returns the cached copy with `stale: true`. A cold cache without a network returns an actionable error.

The server reads only the configured origin and base path. Redirects are followed inside that boundary, responses are capped at 2 MB, and requests time out after 10 seconds.

## Source and published content

This package reads the **published** guide. It can trail the latest deployment by the Pages build plus the CDN window of up to 10 minutes. For editing the guide, use the `docs` server in the repository, which reads `src/content/docs` and works offline.

If an MCP client is not available, the site already publishes the same content as [`llms.txt`](https://digitalesich.github.io/linux-desktop-guide/llms.txt), [`llms-full.txt`](https://digitalesich.github.io/linux-desktop-guide/llms-full.txt), and one `.md` route per page.

## License

MIT. The guide prose is licensed separately; see the repository's `LICENSE-docs`.
