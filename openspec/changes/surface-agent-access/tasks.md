# Tasks

## 1. Landing-page entry point

- [x] 1.1 Add a compact "For agents" section to `src/content/docs/index.mdx` that names clean Markdown, `llms.txt`, `llms-full.txt`, and the local MCP server; verify the copy does not imply a remote endpoint.
- [x] 1.2 Link the section to `/reference/resources/#agent-access`; verify the anchor resolves and the section does not compete with the human development paths.

## 2. Agent-access reference

- [x] 2.1 Add the local MCP server and its read-only tools to the Agent access section in `src/content/docs/reference/resources.md`; verify the tool names match `tools/docs-mcp/` and `AGENTS.md`.
- [x] 2.2 Verify the Agent access section still describes the static-site limits for content negotiation and does not duplicate the README.

## 3. Verification

- [x] 3.1 Run `npm run check:docs`; verify links, anchors, agent-doc validation, and the base path.
- [x] 3.2 Run `npm run check:quality -- --no-build` and review the landing page at desktop and narrow widths.
- [x] 3.3 Run `openspec validate surface-agent-access --strict`; verify only the two content pages and change artifacts are touched.
- [ ] 3.4 Commit and push; verify the Pages deployment and the live sections.

## Workflow follow-up

- Archive after verification.
- Resume the Fedora KDE development path.
