# Proposal

## Why

The guide is deliberately published for humans and agents from one Markdown source, with `llms.txt`, `llms-full.txt`, per-page Markdown, and a local read-only MCP server. The landing page never says so. A reader who arrives through the website cannot tell that the same content is available without a browser, and the Agent access reference omits the MCP server.

## What Changes

- Add a compact "For agents" section to `src/content/docs/index.mdx`.
- Link it to the existing `resources.md#agent-access` anchor.
- Add the local MCP server to the Agent access section in `resources.md`, with the read-only tools it exposes.
- Keep the homepage claim factual: clean Markdown, `llms.txt`, `llms-full.txt`, and a local MCP server.

## Impact

- `src/content/docs/index.mdx`
- `src/content/docs/reference/resources.md`
- `openspec/changes/surface-agent-access/`

No new route, component, stylesheet, or generated file. The agent-facing artifacts stay generated from the same source.
