# Spec Delta

## ADDED Requirements

### Requirement: Shared documentation core

The `docs` server SHALL use the shared `tools/docs-core` modules for sections, slug rules, text extraction, search, and related-page ranking.

#### Scenario: Offline behavior is unchanged

- **WHEN** the server starts and answers tool calls
- **THEN** it still opens no network connection, reads only project files, and writes nothing

#### Scenario: Result shape stays compatible

- **WHEN** a page has no explicit public URL
- **THEN** tool results keep the existing `/<slug>/` and `/<slug>.md` forms

#### Scenario: Explicit public URL

- **WHEN** a page object carries an absolute public URL
- **THEN** summaries, search results, related pages, and page results use that URL instead of the relative form
