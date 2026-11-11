# Design

## Context

See `proposal.md` for the motivation. The generated agent docs are built from the same content as the HTML. `reference/resources.md` already documents `llms.txt`, `llms-full.txt`, per-page Markdown, and discovery, but it does not mention the local MCP server. The landing page has no agent entry point.

## Goals / Non-Goals

**Goals:**

- Make agent suitability visible on the landing page without turning it into a second product pitch.
- Link to the canonical Agent access section instead of duplicating its details.
- Complete the Agent access reference with the local MCP server and its read-only tools.

**Non-Goals:**

- Adding a remote MCP endpoint or hosted service.
- Changing the generated Markdown, `llms.txt`, `llms-full.txt`, or the MCP server.
- Adding a new route, card grid, or stylesheet rule.

## Decisions

### 1. One compact section, not another card grid

The page already ends with a six-card navigation grid. A separate, text-only section keeps the agent access mode visible without competing with the human development paths. It uses the existing `ldg-section`, `ldg-title-sm`, and `ldg-textlink` classes.

### 2. Link to the canonical reference

The homepage states the access modes and links to `resources.md#agent-access`. The reference page remains the place for per-page Markdown, discovery, MCP tool names, and content-negotiation limits.

### 3. Complete the reference with the MCP server

The Agent access section gains one bullet for the local stdio server and its five read-only tools. This makes the homepage claim about MCP accurate and gives readers a concrete next step.

## Risks / Trade-offs

- **Overstating agent support** → Only name capabilities that exist in the repository: generated Markdown, `llms.txt`, `llms-full.txt`, and the local MCP server. Do not imply a hosted remote endpoint.
- **Duplication** → Keep the homepage to one short paragraph; put the operational details in the reference page.
- **Anchor drift** → The link targets the existing `## Agent access` heading and is checked by the internal link checker.

## Migration Plan

Edit the two pages, run the documentation and quality gates, review the rendered landing page, then commit and verify the deployment. No route or schema migration.
