# docs-mcp Specification

## Purpose
Provide local agents with offline, read-only access to the Linux Desktop Guide through a small set of MCP tools, so they can find and read only the documentation they need.

## Requirements

### Requirement: Local stdio MCP server

The project SHALL provide a documentation MCP server that runs locally over stdio and can be started with the project's Node.js runtime.

#### Scenario: Server starts without network access

- **WHEN** the server is started with `node tools/docs-mcp/server.mjs`
- **THEN** it initializes an MCP session over stdin/stdout without opening a network connection or requiring an API key

#### Scenario: Server is registered with OpenCode

- **WHEN** OpenCode loads the project configuration
- **THEN** it finds a local MCP server named `docs` that runs the documentation server from the workspace root

### Requirement: Read-only operation

The server SHALL NOT write files, create directories, mutate documentation, or call remote services.

#### Scenario: Tool call leaves sources unchanged

- **WHEN** an agent calls any documentation tool
- **THEN** the server returns data from the existing `src/content/docs` and `src/data` files without modifying them

### Requirement: Documentation search

The server SHALL expose a `search_docs` tool that searches page titles, descriptions, headings, and body text and returns ranked results.

#### Scenario: Search returns relevant pages

- **WHEN** an agent searches for a topic covered by the guide
- **THEN** the result contains the canonical slug, title, section, URL, score, and a short excerpt for each matching page

#### Scenario: Search is limited and filterable

- **WHEN** an agent supplies a result limit or a section filter
- **THEN** the server returns no more than the requested number of results and only pages from the requested section

#### Scenario: Search has no matches

- **WHEN** a query matches no indexed page
- **THEN** the server returns an empty result set with guidance to broaden the query or browse the page list

### Requirement: Page retrieval

The server SHALL expose a `get_page` tool that returns one page's Markdown, metadata, headings, and public URL by canonical slug.

#### Scenario: Retrieve a known page

- **WHEN** an agent requests `start/why-linux`
- **THEN** the server returns that page's title, description, section, headings, word count, Markdown content, and `/start/why-linux/` URL

#### Scenario: Accept common slug forms

- **WHEN** an agent supplies a leading slash, a trailing slash, or a `.md` suffix
- **THEN** the server canonicalizes the slug and returns the same page

#### Scenario: Reject path traversal

- **WHEN** an agent supplies a slug containing `..`, `.` segments, backslashes, or an absolute filesystem path
- **THEN** the server rejects the request with a tool error and does not read any file outside the documentation root

#### Scenario: Reject unknown pages

- **WHEN** an agent requests a slug that is not in the index
- **THEN** the server returns a tool error with suggestions when close matches exist and points to `list_pages`

### Requirement: Page listing

The server SHALL expose a `list_pages` tool that lists indexed pages grouped by guide section.

#### Scenario: Browse the guide

- **WHEN** an agent lists pages without a filter
- **THEN** the server returns every indexed page with its slug, title, description, and section, ordered by the guide's section and sidebar order

#### Scenario: Filter the listing

- **WHEN** an agent supplies a section
- **THEN** the server returns only pages from that section

### Requirement: Related pages

The server SHALL expose a `get_related` tool that recommends pages related to a given page.

#### Scenario: Find related reading

- **WHEN** an agent requests related pages for a valid slug
- **THEN** the server returns ranked recommendations that exclude the source page itself and include a reason for each recommendation

#### Scenario: Related page slug is invalid

- **WHEN** an agent requests related pages for an unknown slug
- **THEN** the server returns a tool error and does not return recommendations

### Requirement: Baseline data

The server SHALL expose a `get_baseline` tool that returns the validated platform data from `src/data/baseline.json`.

#### Scenario: Read the baseline

- **WHEN** an agent calls `get_baseline`
- **THEN** the server returns the parsed baseline JSON, including Ubuntu, desktop, Qt, toolchain, packaging, and site versions

#### Scenario: Baseline is unavailable

- **WHEN** the baseline file is missing or cannot be parsed
- **THEN** the server returns a tool error describing the problem instead of partial or invented data

### Requirement: Index freshness

The server SHALL reflect changes to indexed Markdown sources without requiring a restart.

#### Scenario: Source changes between calls

- **WHEN** a documentation file changes after the server has started
- **THEN** a later tool call rebuilds the index from the current source before answering

### Requirement: Readable plain-text extraction

The MCP server SHALL derive readable plain text from Markdown for excerpts, word counts, and related-page similarity without dropping table content or treating table separator rows as prose.

#### Scenario: Table-heavy page is extracted

- **WHEN** the server indexes a page that contains Markdown tables
- **THEN** the page's plain text contains the table header and cell text, excludes separator rows, and produces a realistic word count

#### Scenario: Separator row is not content

- **WHEN** `markdownToPlain` processes a table separator such as `| --- | :---: |`
- **THEN** the separator is removed without consuming the table's header or body lines

#### Scenario: Comparison text is preserved

- **WHEN** a page contains comparison text such as `< 1 s` or `< 200 MB`
- **THEN** the plain text keeps the comparison instead of stripping it as an HTML tag

#### Scenario: Regression is caught

- **WHEN** the MCP tests run
- **THEN** a table-heavy page must retain a meaningful word count so the multi-line table-removal defect cannot return silently
