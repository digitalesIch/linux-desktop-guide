# Spec Delta

## ADDED Requirements

### Requirement: Evidence-based target selection

The guide SHALL select its development targets from published criteria and dated evidence, not from an arbitrary list of distributions.

#### Scenario: Criteria are published

- **WHEN** a reader opens the target-selection page
- **THEN** the page states the criteria, their weights, the evidence sources, and the review cadence

#### Scenario: A target is proposed

- **WHEN** a distribution or desktop is considered as a target
- **THEN** its adoption, momentum, developer environment, platform quality, support window, and role are recorded with a primary source and a check date

#### Scenario: Popularity proxy is used

- **WHEN** the guide cites Steam, Fedora countme, Debian popcon, Arch pkgstats, or DistroWatch
- **THEN** it labels the metric as a proxy, states its bias or limitation, and does not call it market share

#### Scenario: Missing evidence

- **WHEN** a metric cannot be verified
- **THEN** the guide marks it as unverified instead of estimating it

#### Scenario: Coverage constraints

- **WHEN** the final matrix is selected
- **THEN** it includes at least one GNOME/GTK target, one KDE/Qt target, one LTS/stable target, one current/rolling target, and both deb- and rpm-based distributions

#### Scenario: Target role

- **WHEN** a target appears in the matrix
- **THEN** it is labeled reference, validation, or compatibility and its role is explained

#### Scenario: Review and removal

- **WHEN** a target no longer meets the gates at review time
- **THEN** it is removed or demoted, and the review date and reason are recorded
