# Spec Delta

## MODIFIED Requirements

### Requirement: Page retrieval

The server SHALL expose a `get_page` tool that returns one page's Markdown, metadata, headings, and absolute public URL by canonical slug.

#### Scenario: Retrieve a known page

- **WHEN** an agent requests `start/why-linux`
- **THEN** the server returns that page's title, description, section, headings, word count, Markdown content, and the absolute public URL for `start/why-linux` under the configured `SITE_URL` and `BASE_PATH`

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

The server SHALL expose a `list_pages` tool that lists indexed pages grouped by guide section with absolute public URLs.

#### Scenario: Browse the guide

- **WHEN** an agent lists pages without a filter
- **THEN** the server returns every indexed page with its slug, title, description, section, and absolute public URL, ordered by the guide's section and sidebar order

#### Scenario: Filter the listing

- **WHEN** an agent supplies a section
- **THEN** the server returns only pages from that section
