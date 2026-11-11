# Spec Delta

## ADDED Requirements

### Requirement: Continuous quality gate

The project SHALL run the browser-based quality gate in CI, separately from the offline documentation gate.

#### Scenario: Pull request quality

- **WHEN** a pull request changes content, styles, or site code
- **THEN** a CI job builds the site and runs Lighthouse on the representative pages
- **AND** accessibility, best practices, and SEO must be 100 and performance at least 90

#### Scenario: Transient Lighthouse failure

- **WHEN** a Lighthouse run returns `n/a` for a page that built successfully
- **THEN** the job retries once before failing

#### Scenario: Offline gate remains browser-free

- **WHEN** `npm run check:docs` runs in CI
- **THEN** it does not launch Chrome, Lighthouse, or a browser-based server

### Requirement: Scheduled freshness check

The project SHALL check the recorded upstream sources on a schedule without paid services.

#### Scenario: Source changes

- **WHEN** a scheduled workflow finds a changed release, support date, or package version
- **THEN** it opens or updates a GitHub issue with the source URL, old value, new value, affected pages, and check date
- **AND** it does not edit content automatically

#### Scenario: No change

- **WHEN** all checked sources match the recorded baseline
- **THEN** the workflow exits successfully without opening an issue

#### Scenario: Free operation

- **WHEN** the workflow runs on the public repository
- **THEN** it uses GitHub-hosted runners and public HTTP endpoints only
- **AND** it requires no paid service, personal token, or metered API

#### Scenario: Unparseable source

- **WHEN** a release page cannot be parsed
- **THEN** the report marks that source as unverified and does not invent a value

### Requirement: External link policy

The project SHALL distinguish unreachable hosts from broken links.

#### Scenario: Known blocked host

- **WHEN** an external host is unreachable because of network policy
- **THEN** it is listed in a documented allowlist with a reason
- **AND** it does not fail strict mode

#### Scenario: Real client or server error

- **WHEN** an external URL returns a 4xx or 5xx response
- **THEN** strict mode fails and names the URL and the source page

#### Scenario: Scheduled external check

- **WHEN** the scheduled link check runs
- **THEN** it reports unreachable warnings without blocking on the known allowlist, and reports hard failures separately
