# Spec Delta

## ADDED Requirements

### Requirement: Browser-based quality gate

The project SHALL provide a local Lighthouse check for the built documentation.

#### Scenario: Representative pages meet the budgets

- **WHEN** a maintainer runs `npm run check:quality` on a machine with Chrome
- **THEN** the command builds the site, serves `dist/` on a loopback port, audits the landing, start, engineering, accessibility, and packaging pages, and exits zero only when accessibility, best practices, and SEO are 100 and performance is at least 90

#### Scenario: A budget is missed

- **WHEN** any audited page scores below a required budget
- **THEN** the command exits non-zero, prints the page and category score, and lists the weighted audits that lost points

#### Scenario: Existing build is reused

- **WHEN** a maintainer runs `npm run check:quality -- --no-build`
- **THEN** the command audits the existing `dist/` without rebuilding

#### Scenario: The gate stays outside the offline check

- **WHEN** a maintainer runs `npm run check:docs`
- **THEN** no browser is launched and no Lighthouse audit runs

#### Scenario: Server is disposable

- **WHEN** the quality check finishes or fails
- **THEN** its HTTP server and Chrome process are closed and no background server remains
