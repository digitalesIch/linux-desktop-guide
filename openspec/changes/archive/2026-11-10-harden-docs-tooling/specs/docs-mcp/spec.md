# Spec Delta

## ADDED Requirements

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
