# docs-mcp-remote Specification

## Purpose
Provide read-only MCP access to the Linux Desktop Guide over Streamable HTTP from a Cloudflare Worker, so agents that cannot run a local process can search and read the same documentation.

## ADDED Requirements

### Requirement: Remote MCP endpoint

The project SHALL provide a Cloudflare Worker that serves an MCP endpoint at `/mcp` using Web Standards Streamable HTTP in stateless mode.

#### Scenario: Initialize a session

- **WHEN** a client sends a valid MCP `initialize` request to `/mcp`
- **THEN** the Worker responds with the server name, version, and capabilities without creating a persistent session

#### Scenario: Call a tool

- **WHEN** a client sends a valid `tools/call` request to `/mcp`
- **THEN** the Worker executes the requested read-only tool and returns the result in the MCP response format

#### Scenario: Unsupported route

- **WHEN** a client requests a path other than `/`, `/health`, or `/mcp`
- **THEN** the Worker returns a 404 response with CORS headers

### Requirement: Tool parity with the local server

The Worker SHALL expose the same five tools as the local server, with the same names, input constraints, and result shapes.

#### Scenario: Search documentation

- **WHEN** a client calls `search_docs` with a query, optional limit, and optional section
- **THEN** the Worker returns ranked pages with slug, title, description, section label, URL, score, excerpt, and matching headings

#### Scenario: Read a page

- **WHEN** a client calls `get_page` with a canonical slug, leading slash, trailing slash, or `.md` suffix
- **THEN** the Worker returns the same page metadata, headings, word count, Markdown content, and public URL as the local server

#### Scenario: Reject an unsafe slug

- **WHEN** a client supplies a slug containing `..`, backslashes, an absolute path, or an invalid segment
- **THEN** the Worker returns a tool error and does not read any file

#### Scenario: List pages

- **WHEN** a client calls `list_pages` with or without a section
- **THEN** the Worker returns the indexed pages grouped and ordered by the guide sections

#### Scenario: Find related pages

- **WHEN** a client calls `get_related` for a valid slug
- **THEN** the Worker returns ranked recommendations that exclude the source page and include a reason for each recommendation

#### Scenario: Read the baseline

- **WHEN** a client calls `get_baseline`
- **THEN** the Worker returns the parsed `src/data/baseline.json` content

### Requirement: Generated content corpus

The Worker SHALL serve content generated from the repository's Markdown and baseline data, not from a separate hand-maintained copy.

#### Scenario: Generate the corpus

- **WHEN** a maintainer runs `npm run worker:corpus`
- **THEN** the command reads `src/content/docs` and `src/data/baseline.json` and writes the Worker corpus, excluding the 404 page

#### Scenario: Rebuild after a content change

- **WHEN** a guide page changes and the Worker is redeployed
- **THEN** the Worker serves the updated page and search index

### Requirement: Read-only operation

The Worker SHALL NOT write data, create issues, call remote services, or expose tools with write or destructive annotations.

#### Scenario: Tool annotations

- **WHEN** a client lists the Worker's tools
- **THEN** every tool is marked read-only, non-destructive, idempotent, and closed-world

#### Scenario: No remote content fetch

- **WHEN** a tool runs
- **THEN** it reads only the bundled corpus and does not fetch the Pages site or another origin

### Requirement: Health and discovery

The Worker SHALL expose `/health` and `/` responses for operations and discovery.

#### Scenario: Health check

- **WHEN** a client requests `/health`
- **THEN** the Worker returns a JSON object with status, page count, corpus timestamp, and the list of tools

#### Scenario: Discovery

- **WHEN** a client requests `/`
- **THEN** the Worker returns a JSON object naming the service, the MCP endpoint, and the health endpoint

### Requirement: CORS and errors

The Worker SHALL answer CORS preflight requests and include CORS headers on successful and error responses.

#### Scenario: Preflight

- **WHEN** a browser sends an `OPTIONS` request
- **THEN** the Worker returns a 204 response with allowed methods, allowed headers, and exposed MCP headers

#### Scenario: Tool error

- **WHEN** a tool call fails validation
- **THEN** the Worker returns an MCP tool error with a readable message and CORS headers

### Requirement: Deployment and CI

The project SHALL document and validate the Worker deployment without requiring Cloudflare credentials in CI.

#### Scenario: Dry-run build

- **WHEN** a maintainer runs `npm run worker:check`
- **THEN** the command generates the corpus and bundles the Worker with `wrangler deploy --dry-run` without contacting Cloudflare

#### Scenario: CI validation

- **WHEN** the documentation workflow runs on a push or pull request
- **THEN** it runs the Worker dry-run build in addition to the existing documentation gate

#### Scenario: Deploy

- **WHEN** a maintainer with Cloudflare credentials runs `npm run worker:deploy`
- **THEN** the Worker is deployed with the generated corpus and the configured route
