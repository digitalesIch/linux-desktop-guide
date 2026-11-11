# Spec Delta

## ADDED Requirements

### Requirement: Standalone published-guide server

The project SHALL provide a read-only documentation MCP server that runs locally over stdio, reads the published GitHub Pages guide, and does not require the repository checkout.

#### Scenario: Start outside the repository

- **WHEN** the packaged server is started from a directory that does not contain the guide sources
- **THEN** it initializes an MCP session over stdin/stdout and reads content only from the configured public base URL

#### Scenario: Default base URL

- **WHEN** no base URL is configured
- **THEN** the server reads `https://digitalesich.github.io/linux-desktop-guide/`

#### Scenario: Configurable base URL

- **WHEN** `LDG_SITE_URL` names another base URL
- **THEN** the server reads that base URL and rejects requests outside its origin and path prefix

### Requirement: Tool parity

The server SHALL expose the same read-only tool names and result fields as the local `docs` server so an agent can switch between source and published content.

#### Scenario: Tool list

- **WHEN** a client lists the server's tools
- **THEN** it returns `search_docs`, `get_page`, `list_pages`, `get_related`, and `get_baseline`, each marked read-only

#### Scenario: Page result shape

- **WHEN** a client reads a page
- **THEN** the result contains the slug, title, description, section, absolute public URL, absolute Markdown URL, headings, word count, and Markdown content

#### Scenario: Search result shape

- **WHEN** a client searches
- **THEN** each result contains the slug, title, description, section, absolute public URL, score, excerpt, and matching headings

### Requirement: Published page retrieval

The server SHALL retrieve pages from the published Markdown routes and reject unknown or unsafe slugs.

#### Scenario: Retrieve a known page

- **WHEN** an agent requests `start/why-linux`
- **THEN** the server returns the published Markdown for that page, including its frontmatter metadata and headings

#### Scenario: Accept common slug forms

- **WHEN** an agent supplies a leading slash, a trailing slash, or a `.md` suffix
- **THEN** the server canonicalizes the slug and returns the same page

#### Scenario: Reject path traversal

- **WHEN** an agent supplies a slug containing `..`, `.` segments, backslashes, a URL scheme, or an absolute filesystem path
- **THEN** the server rejects the request without fetching a URL or reading a file

#### Scenario: Reject unknown pages

- **WHEN** an agent requests a slug that is not listed in `llms.txt`
- **THEN** the server returns an error with suggestions when close matches exist and does not fetch the page

#### Scenario: Baseline page

- **WHEN** an agent requests `reference/baseline`
- **THEN** the server returns an error that points to `get_baseline`

### Requirement: Published page listing

The server SHALL expose `list_pages` grouped by guide section, using the index published in `llms.txt`.

#### Scenario: Browse the guide

- **WHEN** an agent lists pages without a filter
- **THEN** the server returns every page listed in `llms.txt` with its slug, title, description, section, and absolute public URL, ordered by section and then by the published index order

#### Scenario: Filter the listing

- **WHEN** an agent supplies a section
- **THEN** the server returns only pages from that section

#### Scenario: Document the order

- **WHEN** an agent lists pages
- **THEN** the response states that the published index is alphabetical within a section and not the sidebar order

### Requirement: Published search

The server SHALL expose `search_docs` over the published full text.

#### Scenario: Ranked search

- **WHEN** an agent searches for a topic covered by the guide
- **THEN** the server returns ranked pages with excerpts and matching headings, using the same ranking rules as the local `docs` server

#### Scenario: Section filter

- **WHEN** an agent supplies a section
- **THEN** the server returns only pages from that section

#### Scenario: No matches

- **WHEN** a query matches no published page
- **THEN** the server returns an empty result set with guidance to broaden the query or call `list_pages`

### Requirement: Published related pages

The server SHALL expose `get_related` over the published pages.

#### Scenario: Recommend related pages

- **WHEN** an agent requests related pages for a known slug
- **THEN** the server returns ranked recommendations that exclude the source page, include a reason, and use absolute public URLs

#### Scenario: Unknown source page

- **WHEN** an agent requests related pages for a slug that is not published
- **THEN** the server returns an error and no recommendations

### Requirement: Published baseline

The server SHALL return the structured baseline published with the site.

#### Scenario: Read the baseline

- **WHEN** an agent calls `get_baseline`
- **THEN** the server returns the parsed `reference/baseline.json` object with the Ubuntu, desktop, Qt, toolchain, packaging, and site versions

#### Scenario: Baseline is unavailable

- **WHEN** the baseline artifact is missing or cannot be parsed
- **THEN** the server returns an error that names the missing artifact and does not invent values

### Requirement: Network policy

The server SHALL restrict network access to the configured guide and bound every request.

#### Scenario: Origin and path allowlist

- **WHEN** a request or redirect targets a different origin or a path outside the configured base path
- **THEN** the server refuses the request

#### Scenario: Bounded responses

- **WHEN** a response exceeds 2 MB or does not arrive within 10 seconds
- **THEN** the server aborts the request and returns a tool error

#### Scenario: Retry discipline

- **WHEN** a request fails with a network error, `429`, or a `5xx` status
- **THEN** the server retries at most once, respects `Retry-After` up to five seconds, and does not loop

#### Scenario: Identifiable client

- **WHEN** the server sends a request
- **THEN** it sends a user agent that contains the package name and version

### Requirement: Caching and freshness

The server SHALL cache published responses outside the project and expose whether a result is stale.

#### Scenario: Warm cache

- **WHEN** a response is younger than its TTL
- **THEN** the server answers from the cache without a network request

#### Scenario: Conditional refresh

- **WHEN** a cached response is older than its TTL and has an `ETag`
- **THEN** the server sends `If-None-Match` and, on `304`, reuses the cached body and extends its timestamp

#### Scenario: Offline with cache

- **WHEN** the network fails and a cached response exists
- **THEN** the server returns the cached content with `stale: true` and the original fetch time

#### Scenario: Offline without cache

- **WHEN** the network fails and no cached response exists
- **THEN** the server returns an actionable tool error and suggests `llms.txt` for a client without MCP

#### Scenario: Cache location

- **WHEN** the server writes a cache entry
- **THEN** it writes only below the platform cache directory, `LDG_CACHE_DIR`, or not at all when `LDG_NO_CACHE=1`

### Requirement: Package distribution

The project SHALL publish the server as an npm package that a consumer can run without this repository.

#### Scenario: One-command client configuration

- **WHEN** a consumer configures an MCP client with `npx -y linux-desktop-guide-mcp`
- **THEN** the server starts over stdio without an API key, account, or repository checkout

#### Scenario: No runtime dependencies

- **WHEN** the published tarball is inspected
- **THEN** it contains the bundled server, README, and license, and declares no runtime dependencies or install scripts other than `prepack`

#### Scenario: Node baseline

- **WHEN** the package is installed on Node.js 22 or newer
- **THEN** the bundled server runs

#### Scenario: No hosted endpoint

- **WHEN** the project describes its MCP offering
- **THEN** it documents only local stdio servers and does not claim a remote, hosted, or Cloudflare endpoint

### Requirement: Published baseline artifact

The build SHALL publish the validated baseline as JSON alongside the Markdown routes.

#### Scenario: Build output

- **WHEN** the site is built
- **THEN** `dist/reference/baseline.json` exists, parses as a JSON object, and matches the validated source data

#### Scenario: Artifact validation

- **WHEN** the agent-docs check runs
- **THEN** it fails if the baseline artifact is missing, invalid, or diverges from `src/data/baseline.json`

### Requirement: Contract verification

The project SHALL verify the published MCP contract after a deployment and in the offline test suite.

#### Scenario: Offline tests

- **WHEN** the test suite runs without network access
- **THEN** it exercises every tool against fixtures and a local HTTP server, including cache refresh, stale fallback, invalid slugs, and the baseline

#### Scenario: Post-deploy smoke test

- **WHEN** the Pages workflow deploys a new build
- **THEN** a verification job starts the packaged server against the deployed base URL and calls `list_pages`, `search_docs`, `get_page`, and `get_baseline`

#### Scenario: Bundle check

- **WHEN** the release check runs
- **THEN** it builds the bundle, packs the npm tarball, and starts the packed server successfully
